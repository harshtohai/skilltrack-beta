# OutcomeTrack — Domain Model

## Implementation State (as of Sep 2026)
- **Git remote**: `origin` → https://github.com/harshtohai/skilltrack-beta (changed from skilltrack; push there only)
- **Spec/tickets**: parent spec #23; tickets #24 (T1 centers+courses) ✅, #25 (T2 scoring+gov leaderboard) ✅, #26 (T3 institute gaps), #27 (T4 recommendations), #28 (T5 simulator direct-run), #29 (T6 trainee profile+session), #30 (T7 ID visibility), #31 (T8 employer dashboard) ✅. Order: T1→T2→{T3,T4,T8}; T5,T6,T7 independent. **Spec #32: Job Board (F25)** — verified recruiters, trainee applications, hire→outcomes pipeline, demand-gap signals. Vertical tickets (contract-first): #33 JOB-01 schema+DDL ✅ (closed, fed85cd), #44 JOB-02 API contracts ✅ (closed, bae0f02), #45 JOB-03 employer track ✅ (closed), #46 JOB-04 trainee track ✅ (closed), #47 JOB-05 gov track ✅ (closed), #48 JOB-06 hire→pipeline verification ✅ (closed — 51/51 E2E pass on prod after one deploy). **F25 COMPLETE.** Scripts: scripts/verify-job-board.ts (E2E harness, 51 checks) + scripts/cleanup-smoke-data.ts (demo-DB cleanup). Order: 01→02→{03,04,05 in parallel}→06.
- **T1 DONE**: `TrainingCenter` model (+`trainingCenterId` on Cohort), `Course` model; 10 centers seeded, 15 cohorts round-robin assigned, 20 PMKVY-style courses; demo certificates (359) + survey responses (300) seeded via idempotent `prisma/backfill-centers.ts` (upserts only, creates certs/surveys if count 0). seed.ts also creates centers/courses on fresh seeds.
- **T2**: pure scoring engine `src/server/scoring.ts` (`computeCenterScores` — placement verified-weighted (confirmed 1.0/self 0.5)/academic (60% relevance + 40% certs vs benchmark 2)/volume (relative to max)/overall 50-30-20; `computeEmployerRetention` — confirmed claims with later-checkpoint sustained employment, null when insufficient; `normalizeEmployerName`) — 15 vitest unit tests green (`npx vitest run src/server/scoring.test.ts`, vitest@4.1.11 devDep). `getTrainingCenterScores()` in `src/server/analytics.ts` (flat 5-query + in-memory, same pattern as getMonthlyOutcomes); wired into `analytics/government` response as `trainingCenters` sorted by overallScore.
- **Pending after T2**: admin analytics page leaderboard UI; then T3/T4/T5/T6/T7/T8.
- **DB access**: pure Prisma ORM (`src/server/db.ts`, single client, pooled `DATABASE_URL` 6543). No raw SQL, no `db-direct.ts`. `DIRECT_URL` (pooler :5432) unreachable from Node — do not use. Pooler is FLAKY on cold connect (first request after idle may 500 with "Can't reach database server :6543" — retry succeeds; treat transient, don't "fix").
- **Dev server quirk**: start with `(npm run dev > /tmp/next-dev.log 2>&1 &) ; sleep 28; curl health` in ONE command (generous timeout) — timed-out commands kill detached processes; `(cmd &)` only survives if outer command exits cleanly. Health endpoint itself hits DB (may 500 transiently on pooler cold start).
- **Path alias**: `~/*` → `./src/*` only (NOT `@/*`).
- **Bot integration**: Kapso via `https://api.kapso.ai/meta/whatsapp/v24.0`, webhook `/api/webhook` (zod + idempotent by message id), consent-first conversation (in-memory), `startConversation` fires post-login. Consent recorded via WhatsApp (source of truth).
- **Analytics**: no API-key gate on analytics routes (middleware protects `/admin` by session role); list endpoints paginated.
- **Email**: Brevo free tier (300 emails/day); sender must be a verified sender email in the Brevo account (account owner's own address works); send failures are caught — magic link logged on failure (`[MAGIC-LINK] Magic link for...` in dev log); graceful 200. Resend removed.
- **Test user**: seeded demo trainee (consent given) — see `scripts/test-bot-trigger.ts` (reads credentials from env, no hardcoded personal data).
- **Env**: no actual values documented here (personal/secret data must never be committed). Notable keys in `.env` (untracked): `DATABASE_URL`, `DIRECT_URL`, `INTERNAL_API_KEY` (dummy), `BREVO_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, `KAPSO_API_KEY`, `KAPSO_PHONE_NUMBER_ID`, `APP_BASE_URL`. NOTE: `/bot-service/` is gitignored (legacy, contains hardcoded key — push protection blocks it); never `git add -A` blindly.
- **Lint**: 0 errors across repo (fixed: kapso.ts types, webhook zod, ConversationData typing, `??` operators, optional chains).
- **Prior decisions**: don't change `.env` URLs; keep API routes thin (user asked for server actions but API routes kept); trainee detail timeline exists at `/trainees/[public_id]`; `/cohorts` page never existed (only `/cohorts/[id]` + API).

## Overview
OutcomeTrack is a longitudinal skilling-outcomes platform. It follows up with trainees via WhatsApp at 30/90/180/365 days post-certification, captures employment claims, enables employer verification, and surfaces cohort-level KPIs with evidence levels.

**Guiding principle**: Trust is the product. Unknown ≠ unemployed. Never overwrite history. Always show numerator/denominator and evidence level.

## Core Concepts

### Programme
- **Identity**: `id` (uuid), `name`, `code` (unique)
- **Ownership**: Contains many Cohorts

### Cohort
- **Identity**: `id` (uuid), `programme_id` (FK), `name`, `start_date`, `end_date`
- **Lifecycle**: Trainees enrol → certify → follow-ups triggered

### Trainee
- **Identity**: `id` (uuid), `public_id` (human-readable, e.g., `TRN-000001`), `full_name`, `phone_e164` (unique, E.164 format), `email`, `district`, `language` (`EN` | `HI`)
- **Enrolment**: Links to one Cohort via `enrolments` table
- **Privacy**: Phone masked in UI (`+91 XXXXX 3210`), synthetic data only for demo

### Enrolment
- **Identity**: `id` (uuid), `trainee_id` (FK), `cohort_id` (FK), `certification_date` (date)
- **Invariant**: Unique `(trainee_id, cohort_id)`

### FollowupEvent
- **Identity**: `id` (uuid), `trainee_id` (FK), `cohort_id` (FK), `checkpoint_days` (30, 90, 180, 365)
- **Status**: `SCHEDULED` → `SENT` → `RESPONDED` | `FAILED` | `EXPIRED`
- **Channel**: `WHATSAPP` (only for hackathon)
- **Timestamps**: `sent_at`, `responded_at`
- **Trigger**: Manual admin action (Tier 0); cron later

### BotSession
- **Identity**: `id` (uuid), `trainee_id` (FK), `followup_event_id` (FK)
- **State Machine**:
  ```
  AWAITING_STATUS → [EMPLOYED | SELF_EMPLOYED | APPRENTICE] → AWAITING_EMPLOYER_NAME → AWAITING_ROLE → AWAITING_SALARY_BAND → DONE
  AWAITING_STATUS → [LOOKING | NOT_WORKING] → AWAITING_NON_PLACEMENT_REASON → DONE
  ```
- **Collected Data** (JSONB): Accumulates answers `{status, employer_name, role, salary_band, non_placement_reason}`
- **Expiry**: `expires_at` (24h from start)

### EmploymentClaim
- **Identity**: `id` (uuid), `trainee_id` (FK), `followup_event_id` (FK)
- **Fields**: `employer_name`, `role`, `salary_band` (enum), `non_placement_reason` (enum, nullable)
- **Verification Status**: `SELF_REPORTED` (level 1) → `EMPLOYER_CONFIRMED` (level 3) | `CONFLICT`
- **Evidence Level**: 0–5 (0=UNKNOWN, 1=SELF_REPORTED, 3=EMPLOYER_CONFIRMED)
- **Created At**: When bot flow completes

### OutcomeEvent (Append-Only)
- **Identity**: `id` (uuid), `trainee_id` (FK), `employment_claim_id` (FK, nullable), `checkpoint_days`
- **Fields**: `outcome_status`, `verification_status`, `source` (`TRAINEE` | `EMPLOYER` | `SYSTEM`), `evidence_level`
- **Invariant**: Insert only. No UPDATE/DELETE. New row per state change.

### VerificationRequest
- **Identity**: `id` (uuid), `employment_claim_id` (FK)
- **Token**: `token_hash` (SHA-256 of random URL-safe token), `expires_at` (7 days)
- **Action**: `CONFIRMED` | `REJECTED`, `rejection_reason` (nullable text)
- **Used At**: Timestamp when employer acts (single-use)

### AuditEvent
- **Identity**: `id` (uuid), `entity_type`, `entity_id`, `action`, `actor_type` (`ADMIN` | `TRAINEE` | `EMPLOYER` | `SYSTEM`), `actor_id` (nullable), `metadata` (JSONB)
- **Purpose**: Immutable log of every state change

### Employers (F25 Job Board)
- **Identity**: `id` (uuid), `company_name`, `contact_email` (unique, login identity), `sector` (industry), `district`, `registration_no` (GSTIN/CIN — collected for verification)
- **Verification Status**: `PENDING` → `VERIFIED` | `REJECTED`; `SUSPENDED` for repeat offenders
- **Rule**: Only `VERIFIED` employers can post jobs. Recruiter signup is an **unlisted** page — never linked from landing/login/signup, reached by direct URL only.
- **Retention accountability**: per-employer retention is computed from the follow-up checkpoints (30/90/180/365d); chronically poor retention → flagged on gov analytics → admin may SUSPEND (jobs hidden from trainees).

### JobPosting
- **Identity**: `id` (uuid), `employer_id` (FK), `title`, `description`, `employment_type` (`FULL_TIME` | `PART_TIME` | `INTERNSHIP` | `CONTRACT` | `FREELANCE`), `work_mode` (`ONSITE` | `REMOTE` | `HYBRID`), `salary_band` (reuses existing enum), `district` (job location), `skills_required`, `openings` (count), `application_deadline`, `status` (`OPEN` | `CLOSED`)
- **Lifecycle**: Open jobs visible to trainees; `CLOSED` or deadline-passed vanish from the trainee view; employer may re-open.

### JobApplication
- **Identity**: `id` (uuid), `job_posting_id` (FK), `trainee_id` (FK), `status`
- **State Machine**: `APPLIED` → `SHORTLISTED` → `HIRED` | `REJECTED` (employer moves it); `WITHDRAWN` (trainee action, any pre-hire state)
- **Invariant**: Unique `(job_posting_id, trainee_id)` — one application per trainee per job
- **Hire Effect**: `HIRED` creates the trainee's `employmentHistory` entry + an `outcomeEvent` with `EMPLOYER_CONFIRMED` (evidence level 3, source EMPLOYER) — feeds placement/verified-employment metrics automatically
- **Auto-Close**: When `HIRED` count reaches the job's `openings`, the posting auto-closes (`CLOSED`)
- **Contact Reveal (symmetric)**: Once `SHORTLISTED`, the employer sees the trainee's phone/email AND the trainee sees the employer's contact email (two-way, zero chat infrastructure)

### Trainee Job Hunt View
- **Jobs section**: open jobs sorted most-relevant → least (same district first), filters (district/work mode/type) as client-side convenience
- **My Applications**: trainee's own applications with live status + employer contact once shortlisted + Withdraw
- **"Can't find a job?" button**: end of the jobs section — reason dialog (reuses `non_placement_reason` enum) → records a `JobSeekSignal` with district

### JobSeekSignal ("Can't find a job?" signal)
- **Identity**: `id`, `trainee_id` (FK), `reason` (reuses `non_placement_reason` enum), `district`
- **Purpose**: Demand-gap signal — gov analytics shows how many trainees per district report "no jobs nearby" / "skills mismatch" etc.

## Enums (Exact Values)

| Enum | Values |
|------|--------|
| `outcome_status` | `EMPLOYED`, `SELF_EMPLOYED`, `APPRENTICE`, `LOOKING`, `NOT_WORKING`, `UNKNOWN` |
| `verification_status` | `UNKNOWN`, `SELF_REPORTED`, `PROVIDER_CONFIRMED`, `EMPLOYER_CONFIRMED`, `DOCUMENT_VERIFIED`, `SYSTEM_VERIFIED`, `CONFLICT` |
| `salary_band` | `LT_10K`, `B_10_20K`, `B_20_35K`, `B_35_50K`, `GT_50K` |
| `non_placement_reason` | `NO_JOBS`, `SKILLS_MISMATCH`, `FAMILY`, `HEALTH`, `OTHER` |
| `followup_status` | `SCHEDULED`, `SENT`, `RESPONDED`, `FAILED`, `EXPIRED` |
| `channel` | `WHATSAPP`, `SMS`, `EMAIL` |
| `bot_session_state` | `AWAITING_STATUS`, `AWAITING_EMPLOYER_NAME`, `AWAITING_ROLE`, `AWAITING_SALARY_BAND`, `AWAITING_NON_PLACEMENT_REASON`, `DONE` |
| `employment_type` | `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT`, `FREELANCE` |
| `work_mode` | `ONSITE`, `REMOTE`, `HYBRID` |
| `employer_verification_status` | `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED` |
| `job_posting_status` | `OPEN`, `CLOSED` |
| `job_application_status` | `APPLIED`, `SHORTLISTED`, `HIRED`, `REJECTED`, `WITHDRAWN` |

## Verification Ladder (Evidence Model)
`0 UNKNOWN` → `1 SELF_REPORTED` → `2 PROVIDER_CONFIRMED` → `3 EMPLOYER_CONFIRMED` → `4 DOCUMENT_VERIFIED` → `5 SYSTEM_VERIFIED`; plus `CONFLICT` when sources disagree.
**Hackathon uses**: levels 1, 3, and CONFLICT.
**Rules**: Never overwrite contradictory history. Append new events. Keep source + timestamp + verifier for every claim.

## Metric Definitions (Always Show Numerator / Denominator / Period)

| Metric | Definition |
|--------|------------|
| Outcome Coverage | Trainees with known (non-UNKNOWN) latest outcome ÷ Certified trainees |
| Verified Employment | Employed/self-employed/apprentice with `EMPLOYER_CONFIRMED` ÷ Trainees with outcome known |
| Retention at T | Employed at 30-day checkpoint and still employed at T ÷ Employed at 30-day checkpoint |
| Follow-up Response Rate | Follow-ups `RESPONDED` ÷ Follow-ups `SENT` |

## Integration Contract (Frozen)

### Conventions
- **Casing**: API JSON fields camelCase; DB columns camelCase-quoted (Postgres); enum VALUES `UPPER_SNAKE_CASE` strings (exact lists above). (Supersedes the earlier "snake_case everywhere" line — no route, pre- or post-F25, ever used snake_case JSON; the frozen contracts follow the codebase as built.)
- **IDs**: uuid `id`; FKs `<entity>_id`; human-readable `public_id` for trainees.
- **Timestamps**: `*_at` ISO-8601 UTC; dates `*_date` `YYYY-MM-DD`; phones E.164 `phone_e164`.
- **Enums**: `UPPER_SNAKE_CASE` strings (exact lists above).
- **API Base**: `/api/v1`; Errors: `{"error":{"code","message"}}`; Service auth: `X-API-Key: $INTERNAL_API_KEY`.

### Service Boundaries
```
Trainee (WhatsApp) ⇄ [Bot Service] ── POST /api/v1/bot/inbound ──▶ [Backend (Next.js)] ⇄ [Postgres (Supabase)]
                         ▲                                                   │
                         └────────── POST {BOT_BASE_URL}/send ◀──────────────┘
```
- **Bot → Backend**: `POST /api/v1/bot/inbound` `{provider, provider_message_id, from_phone_e164, text, received_at, channel}` → `{matched, trainee_id, session_state, replies:[{text, options[]}]}`
- **Backend → Bot**: `POST {BOT_BASE_URL}/send` `{message_id, to_phone_e164, text, options[], language}` → `202 {status:"queued", provider_message_id}`
- **Idempotency**: `provider_message_id` on inbound; `message_id` (uuid) on outbound.

### Database ↔ Backend
- Teammate A owns tables/columns/views (`v_trainee_latest_outcome`, `v_cohort_overview`, `v_retention`, `v_wage_bands`).
- Backend reads views if available; falls back to raw SQL.
- `outcome_events` is append-only.

## Environment Variables
| Variable | Owner | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Teammate A | Supabase Postgres connection |
| `INTERNAL_API_KEY` | You (generate) | Service-to-service auth (32+ chars) |
| `BOT_BASE_URL` | Teammate B | Bot service base URL (e.g., `https://bot.onrender.com`) |
| `BACKEND_BASE_URL` | You | Backend base URL (e.g., `https://app.vercel.app`) |
| `APP_BASE_URL` | You | Same as `BACKEND_BASE_URL` |
| `BOT_MODE` | Both | `real` | `mock` |

## Feature Tiers (Cut-Line Plan)
- **Tier 0 (Must Have)**: F01–F08 — Complete demo loop
- **Tier 1 (Important)**: F09–F12 — Retention at 90d, conflicts queue, audit log viewer, export
- **Tier 2 (Optional)**: F13–F19 — Consent, i18n, simulator, trainee profile
- **Tier 3 (Stretch)**: F20–F24 — LLM insights, SIDH adapter, deduplication, employer edit, email
- **F25 Job Board (Current Sprint)**: Verified-recruiter job postings → trainee apply → hire feeds outcomes pipeline

## Idea Bag — UI Reskin decisions awaiting confirmation (Sep 30 morning)
Context: Merivo UI reskin running on branch `ui-overhaul` (spec #49, tickets #50–#65). Decisions I made autonomously — confirm or override:
1. **DotMap deferred**: design §4.14 wants a dot-map for geo, but our data is Maharashtra *districts*, not countries. Deferred; district distribution renders as a horizontal bar chart (§4.11-compliant). Options: India dot-map / world map / keep bar chart.
2. **Font**: design says `next/font` Plus Jakarta Sans (build-time Google fetch, self-hosted). If the build environment can't reach Google Fonts, fallback is `@fontsource/plus-jakarta-sans`. Space Grotesk (currently the "mono" font) dropped for ui-monospace per design §2.1.
3. **Command palette (⌘K)**: included in the app sidebar (design-sanctioned §15.5). Say the word if you don't want it.
4. **dnd-kit NOT installed**: no drag use case exists in OutcomeTrack (no kanban). Design allowlists it but YAGNI.
5. **Dead footer links**: landing links to /privacy, /terms, /consent, /data-retention, /accessibility — none exist as pages. Options: create minimal pages / remove links. Currently: links kept, unresolved.
6. **CSV export**: dead Export buttons (no backend route) replaced with client-side CSV generation from table data. Confirm OK.
7. **Employer verify redirect**: success on `/employer/verify/[token]` sends the (likely logged-out) verifier to `/dashboard` — existing behavior kept. Confirm intended.
8. **Dark mode**: implemented fully (design `[inferred]`; site had none) — next-themes, toggle in user menu. Confirm wanted.
9. **Sonner replaces Radix toast** (design §4.9 literal); Toaster mounted globally (fixes silent toasts on employer/verify).
10. **Non-functional controls**: decorative search/filter on cohort detail removed (design: no decorative controls); "Add Employment"/"Upload Certificate" on trainee portal removed or disabled-with-tooltip.
11. **Rebrand scope**: product name stays "OutcomeTrack"; "Merivo" is the design system name only. Logo = GraduationCap in orange chip treatment.
12. **Landing content**: same content structure (features/how-it-works/audiences), new Merivo visuals.
13. **Route groups**: authenticated pages move into `(app)/` route group for the shared S1 shell — URLs unchanged, middleware untouched.
14. **Recruiter register stays unlisted**: gets S5 auth shell, never linked from landing/login/signup (F25 rule).
15. **Simulator kept as dev tool** with a simple centered shell.
16. **a11y verification is manual** (keyboard walkthrough + focus inspection) — no axe runner installed; say the word if you want @axe-core/react added.
17. **KPI deltas/sparklines omitted** (UI-08): design §9.1/§4.14 want delta chips + DotSparkline on KPI cards, but `/api/v1/kpis/overview` is point-in-time only — no history to compute deltas from. Faking it would be decorative. Needs a time-series endpoint (e.g. daily KPI snapshots table + rollup) before deltas can be honest.
18. **Trainees no longer see org-wide KPIs** (UI-08): `/dashboard` previously rendered the admin KPI grid to trainees too; now trainees land on the jobs board only (their own stats come with the trainee portal, UI-15). Product call — confirm intended.
19. **District endpoint added** (UI-08): new read-only `GET /api/v1/kpis/districts` (trainee.groupBy) powers the district-distribution card. Additive, mirrors kpis/overview; note the funnel data quirk (employed > certified counts) is existing kpis/overview behavior, untouched.
20. **Dashboard layout adaptation** (UI-08): §9.1's table row is full-width; here the cohort table sits 8/12 beside a Recent activity card 4/12 (recentActivity is real data the template has no slot for). Rows keep the design's 8/12+4/12 rhythm.
21. **Compare toggle skipped** (UI-10): §9.10's header wants a compare toggle, but expected-vs-actual comparison is already baked into the four ComparisonCharts — a toggle would add a second way to see the same data. YAGNI; say the word if you want a chart-mode toggle.
22. **"Latest month" KPI fix** (UI-10): the government API returns trailing empty months up to today (buckets built to now), so `monthlyData[length-1]` was an empty bucket → old page showed 0.0% rates. KPI cards now use the latest month WITH certified > 0 (fallback to last row). Honest values; charts still show the full timeline including empty months.
23. **DotForecast sparse-data clustering** (UI-10): with 12 monthly points the dot grid is 132px wide (§4.14 pitch is fixed) and clusters left while the x-axis labels spread the container width — labels don't align with columns. §4.14 targets dense daily data (60+ points fill the width); a wider seed range or daily buckets would fix the visual. Component left §4.14-lawful.
24. **Verification Queue columns trimmed** (UI-10): Sector + Registration No dropped (9 cols pushed Actions off-viewport at desktop width, hiding the primary approve/reject workflow); still in the API. 7 cols fit with visible buttons.
25. **Single-series distributions in ComparisonChart** (UI-12): employer verification-history and wage-band charts are one-series categorical counts, but the only grouped-bar component is expected-vs-actual (both series = same count, legend hidden, meaning carried in the card description). A dedicated simple bar-chart component would render one bar per category if you want it.
26. **Only Reject is confirmed** (UI-12): applicants pipeline confirms Reject with a dialog (CL-18 destructive); Hire stays direct (happy path), Close/Re-open stay direct (reversible). The admin verification queue confirms BOTH approve and reject (governance decisions) — say the word if Hire should be confirmed too.
27. **Post-job is a page, not a sheet** (UI-12): §9.6 allows Sheet for ≤ 8 fields, but the form has 9 (skills/expansion room) and scales better as a page — matches the existing "Post Job navigates to /post-job" behavior.

## Idea Bag (older items)
- **In-app message thread per application** (employer↔trainee chat): parked — feasible later via a simple polling-based thread; contact reveal on shortlist covers the immediate need.
- **WhatsApp bot apply flow**: trainees apply via web only; bot job prompts/apply deferred.
- **Bot notifications for new jobs**: WhatsApp nudge when a job matching the trainee's district/skills posts — stretch.
- **"Viewed" application state** (employer saw the application): parked; minimal state machine preferred.
- **Interview scheduling** (employer↔trainee slot booking): parked.
- **Max open jobs per employer** (spam control): parked until real usage demands it.
- **Employer profile pages as a metric**: company profiles (sector, size, hiring history) surfaced as their own analytics section — near-future.

## Non-Goals (Hackathon)
- Not a replacement for SIDH/NCS/LMS/HRMS
- No scraping, no real PII, no LLM decisions
- No multi-tenant / gov admin dashboard
- No phone encryption at rest (mask in UI only)
- No email channel (WhatsApp only)