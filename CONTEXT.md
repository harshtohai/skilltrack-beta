# SkillsTrack — Domain Model

## Implementation State (as of Sep 2026)
- **Feature set "Trainee section completion" (Oct 13, grilled → spec #102 → tickets #103–#110 → implemented)**: branch `trainee-section-v2` (NEVER merge to main — owner constraint; commits only, no push). Grilling decisions live in ADR-002 + the Certificates glossary entry; spec at #102, all tickets closed except #104 (T7, in flight). Landed: **T1** certificate two-source schema (Certificate.source SELF_REPORTED|ISSUED / status PENDING|VERIFIED|REJECTED / fileKey / review fields; TraineeLoginToken.purpose LOGIN|EMAIL_CHANGE|PHONE_CHANGE + pendingValue) + Supabase Storage REST client (env-gated SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, private `certificates` bucket, 15-min signed URLs, PDF/JPG/PNG ≤ 1 MB — uploads 503 STORAGE_NOT_CONFIGURED until the service key is set in .env) + 1090 seed certs backfilled ISSUED/VERIFIED. **T2** trainee self-service certificates (upload/edit-while-PENDING/delete-while-PENDING-or-REJECTED, session-gated signed-file route, `/api/v1/trainee/certificates`). **T3** institute(center-scoped)/admin(unscoped) per-trainee issuance (born-VERIFIED) + review (verify / reject+reason, append-only) on the trainee detail page; shared `certificate-actions` module. **T4** per-cohort bulk issuance → per-trainee cert + enrolment COMPLETED (idempotency marker = status COMPLETED — certificationDate is pre-seeded non-null), route slug MUST be `[id]` (Next rejects mismatched dynamic slugs app-wide). **T5** email change via OTP-to-NEW-email (+ old-address notice, sessions survive — JWT carries no email claim), VerifiedInfoCard extracted to profile-verified-info.tsx, OtpSlots moved to components/auth. **T6** phone change via WhatsApp OTP (Kapso, BOT_MODE=mock logs the OTP; atomic 3-field phone swap). **T8** dashboard "For you" tab (the orphaned recommendations API finally has a UI), profile "My Training" section, portal mirror (cert statuses + training chain in the verify payload; Skills placeholder tab removed until phase-2 self-assessment), landing copy honest. **T7** (WhatsApp OTP login for phone-only trainees) in flight on `slice/t7-whatsapp-login`. Runtime smoke verified live: issue 201 VERIFIED, reject+reason, re-review 409 CERTIFICATE_IMMUTABLE, cohort bulk {issued:27}, idempotent re-run 409 NOTHING_TO_ISSUE. **Two-axis code review (Oct 13)** fixed: free-text email PATCH removed (was bypassing the OTP flow — email is OTP-only now), institute/admin proof-file route added (US 24), dialogs split under the 200-line rule, text-title/date()/Skeleton/ErrorState/spinner conformance, scope guard deduplicated into `getTraineeInCertificateScope` (4 routes), hasFile aligned with serializeCertificate. **New harness**: `scripts/verify-trainee-section.ts` — 20 HTTP checks (issue/review/immutability/cohort idempotency/file ownership/OTP guards/enumeration safety/auth walls); note the issue route is multipart-only and the trainees list response shape is `{data:[…],pagination}`. **ADR-003 (issue #111, owner decision "certificates are not validated by hand")**: the review workflow is REMOVED — provenance-only model; SELF_REPORTED born VERIFIED + immediately live, ISSUED immutable, provenance labels (Institute-issued/Self-reported) replace status badges everywhere, review route + reviewCertificate deleted, backfill `scripts/backfill-certificate-verified.ts` (status constant VERIFIED, schema columns retained for stability); employer applicants panel shows all certificates with provenance + file links via the new scoped route `/api/v1/employer/certificates/[certificateId]/file` (session.user.id IS the Employers row id; JobApplication relation is `jobPosting` NOT `job`; verified live 302/404-by-application-removal). **Deferred judgement calls (tracked debt, no action now)**: failed-OTP limiter + resend-cooldown blocks duplicated across login/email-change/phone-change verify routes (extract a shared helper when a 4th OTP flow appears); `email.ts` render shell + Brevo fetch re-copied per function; institute actors land as `actorType: "SYSTEM"` (ActorType enum has no INSTITUTE — actorId preserves attribution); cohort issuance is sequential per trainee (fine at demo scale). **Follow-on slice (Oct 13, issues #112–#114)**: institute/admin removal of SELF_REPORTED certificates (DELETE route + Remove button + CERTIFICATE_REMOVED audit + trainee email notice — the ADR-003 remediation path), in-browser certificate preview (shared CertificatePreviewDialog iframe pattern on trainee/institute/employer surfaces), and bulk CSV import (POST /api/v1/trainees/import-certificates + institute page /trainees/import-certificates + nav item; quote-aware CSV parsing, center-scoped rows, skip-if-exists idempotency, per-row results; harness now 24/24). Gotchas hit: vitest scans `.worktrees/` (excluded in vitest.config.ts — test counts inflate ×4 otherwise); parallel-track merge conflicts on profile page files resolved by extracting components per-track; `pkill -f "next dev"` self-matches the shell command line (use `fuser -k <port>/tcp`); stale dev servers on port 3000 serve old code and produce phantom 500s — always smoke-test against the fresh port from the dev log; `.next/types/validator.ts` holds stale route references after deleting a route file (delete `.next/types` + recompile); Next.js rejects mismatched dynamic slug names app-wide (`[cohortId]` vs `[id]` broke dev boot); `z.object().safeParse(bareString)` silently 404s every request — parse the params OBJECT. Idea Bag #40 (UAN-based past-employment retrieval) created; trainee employment self-entry explicitly rejected. **Operator TODOs for real-mode activation (code is done, these are account actions only the owner can do)**: (1) ~~set `SUPABASE_SERVICE_ROLE_KEY`~~ **DONE (Oct 13)** — key set in `.env` + Vercel (Production/Preview, with SUPABASE_URL which was missing there), private `certificates` bucket created by the owner, pipeline verified live (upload 200 → signed download 200 → delete 200) — certificate file uploads are fully live; (2) complete **Meta Business Verification** for WABA 2079042822734686 — the actual blocker (Oct 13): template creation via the Kapso MCP works, but Meta auto-rejects OTP content in UTILITY (`INCORRECT_CATEGORY` — OTP must be the AUTHENTICATION category) and AUTHENTICATION creation returns 2388185 "does not have permission" until verification. After verification: create the auth template (`skillstrack_otp`, en_US, BODY add_security_recommendation + BUTTONS [{type:"OTP", otp_type:"COPY_CODE"}] — note the button type is "OTP", COPY_CODE alone is invalid) in one Kapso MCP call and set `WHATSAPP_OTP_TEMPLATE=skillstrack_otp` in .env — the code side is already wired (sendKapsoOtp in kapso.ts: template send when the env var is set, free-text fallback inside the 24h window, mock logging otherwise; both phone-change and phone-otp login routes use it). Kapso MCP also has no template-delete tool — DELETE via the Graph proxy `api.kapso.ai/meta/whatsapp/v24.0/{waba_id}/message_templates?name={name}` with the app's X-API-Key works; leftover "test" MARKETING template removed Oct 13; (3) decide when `trainee-section-v2` reaches `main` (owner constraint: never auto-merged).

- **Feature set "Auth + Institute + polish" (Oct 2026)**: grilled → spec → tickets → implement. Branch: new branch off `ui-overhaul` (no merge; push to skilltrack-beta only). Decisions: **Enumeration guard (Q9)** — the magic-link route keeps its internal existence check (no token minted for unknown emails) but ALWAYS responds with the same generic success shape (never reveals whether the email is registered); only genuine send failures return an explicit error; sent-page copy conditional ("If an account exists for this email, we've sent a login link"). **Rate limit (Q8)**: 30s per email, server-side via the most recent token's timestamp (429 + seconds remaining, §7 toast pattern), client timer mirrors it; fresh-signup first-send exempt. **OTP (Q5)**: 6-digit, hashed on the login-token row alongside the link token; the portal accepts token OR OTP; the email carries both; unverified trainees blocked from login until verified. **Signup**: gender Select (Female · Male · Non-binary · Prefer to self-describe → text input · Prefer not to say) on the Trainee schema + shown/edited on the profile; §9.3 ">4 fields at signup" deviation documented in DESIGN.md; self-signup POST public exemption (currently 401s — broken end-to-end); duplicate check email-first-then-phone with distinct errors + Sign-in link, STAYS on signup (no redirect); success → mint + send magic link → sent page; "[object Object]" nested-error reading fixed on login/sent pages. **Institute = TrainingCenter (Q12)**: env `INSTITUTE_CENTER_CODE` + JWT claim, NO Institute table (upgrade path documented); all institute queries scope through cohorts by center; gov pages (trainees/followups/conflicts/audit-logs) REMOVED from the institute nav — institute nav: Dashboard · All trainees (scoped) · Add trainee · Analytics. **Add-trainee**: name/phone/email?/programme + cohort Select → creates trainee + enrolment + sends the enrollment email (enrollment info + OTP + link) via the Brevo sender. **Course lifecycle (Q10)**: institute moves a trainee between cohorts only while the trainee has zero progress data (audit-logged); after progress exists the move is ADMIN-ONLY (no institute-side action, no approval workflow); drop out = AlertDialog → "Dropped out" status + timeline entry on the trainee detail; re-enrollment = fresh add; portal access kept; trainees-list tabs All · Active · Dropped out · Completed. **Institute dashboard (Q13)**: KPI row (trainees produced · certified · placed · placement rate) + cohort-performance table + peer-ranking card — reuses the existing `getTrainingCenterScores()` engine; no new schema. **Polish (Q15/Q16)**: aria-labels → "Placement trends" exactly (landing, signup, employer/register); visible band headers at `text-title font-medium` left-aligned with the sparkline right, one alignment axis; empty space measured programmatically, fixed at the cause (signup column fits 100svh at ≥800px heights — no scrollbar). **Verification plan (owner-directed)**: changed/new surfaces ONLY (no full-app re-sweep) — DOM dumps + both themes on: signup (gender/fit/duplicates), sent (conditional copy + 30s cooldown), login (error fixes), portal (OTP entry), trainees list (tabs + scoping), trainee detail (move/drop-out/timeline), institute dashboard, the new add-trainee page, landing/employer-register band; **loop-check** (E2E harness, the scripts/verify-job-board.ts pattern) for every new/upgraded API: magic-link (generic response, 429+retryAfter, send failure), signup POST (distinct duplicates, first send, public exemption), verify (token + OTP paths, consent completion), move/drop-out endpoints, institute scoping.
- **Git remote**: `origin` → https://github.com/harshtohai/skilltrack-beta (changed from skilltrack; push there only)
- **Skills self-assessment LANDED (bag #44, ticket #115, Oct 13)**: `SkillAssessment` append-only table + `Programme.courseId` (skills source = the programme's linked Course, seed wires round-robin + idempotent backfill `scripts/backfill-programme-courses.ts`); `src/server/skills.ts` (SKILL_LEVELS 1–5 labels, humanizeSkill, latestBySkill + unit tests); `GET/POST /api/v1/trainee/skills` (GET resolves active→latest enrolment's programme.course and returns latest+history per skill; POST validates skills ∈ course.skills + levels 1–5, dedupes last-wins, audit `SKILLS_ASSESSED`); profile `Skills` card with the straight-up disclosure contract verbatim + 5 anchored level buttons + dirty-state save; portal Skills tab restored (read-only levels + one-line disclosure); institute coaching card (self-assessed levels + dates, "employers never see this") on the trainee detail page; harness +4 checks (course-linked list, POST→reflect, fabricated skill→400). Verified: tsc/lint/vitest 160 tests; harness green after the skills slice. DB gotcha: `.env` vars are NOT in the shell env — `DIRECT_URL="$DATABASE_URL"` passes an empty string (Prisma "Validation Error Count: 1 [Context: getConfig]"); extract with `grep + cut -d'"' -f2` or use `--url`. Supabase outage windows can last minutes (both pooler + direct hosts) — background retry loops beat foreground timeouts.
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
- **Bot follow-up recording FIXED (Oct 13, branch fix/bot-followup-recording)**: the live WhatsApp brain is `src/lib/bot/conversation.ts` (Kapso webhook → `/api/webhook` → `processInboundMessage` — a language→consent→identity→survey flow writing `survey_responses` + `trainee.conversationState`), while the admin/trainee follow-up views read `followup_events` — populated only by the OTHER brain (`/api/v1/bot/inbound` + `bot-service/` relay, NOT in the active webhook path; known two-brain debt). Owner's bot chats therefore never reflected in follow-ups (root-caused via Kapso MCP: 41-message conversation, SurveyResponse with traineeId NULL). Fixes: (1) completed surveys by a trainee whose phone matches now also create a FollowupEvent (WHATSAPP, RESPONDED, `checkpointDays: 0` = trainee-initiated chat — admin page shows a "Chat" badge instead of "0-day"); (2) unregistered numbers end the conversation at the not-found message instead of continuing an anonymous survey (state can't persist without a trainee row → the consent question looped 30+ times on Vercel serverless). Verified E2E through the real webhook: registered chat → SurveyResponse + FollowupEvent; unknown number → zero ghost rows. Demo trainee **TRN-BOTTEST-01** ("Harsh Panchal", owner's WhatsApp number, ACTIVE in PMKVY-HC Batch 03) exists for live testing.
- **Prior decisions**: don't change `.env` URLs; keep API routes thin (user asked for server actions but API routes kept); trainee detail timeline exists at `/trainees/[public_id]`; `/cohorts` page never existed (only `/cohorts/[id]` + API).

## Overview
SkillsTrack is a longitudinal skilling-outcomes platform. It follows up with trainees via WhatsApp at 30/90/180/365 days post-certification, captures employment claims, enables employer verification, and surfaces cohort-level KPIs with evidence levels.

**Guiding principle**: Trust is the product. Unknown ≠ unemployed. Never overwrite history. Always show numerator/denominator and evidence level.

## Core Concepts

### Programme
- **Identity**: `id` (uuid), `name`, `code` (unique)
- **Course link** (bag #44): `course_id` (nullable FK → Course) — the programme's skill list comes from its linked Course's `skills[]`; seeded programmes are round-robin-linked (`scripts/backfill-programme-courses.ts`, idempotent — only NULL rows)
- **Ownership**: Contains many Cohorts

### SkillAssessment (skills self-assessment, Oct 2026 — bag #44 / ticket #115)
- **Identity**: `id`, `trainee_id` (FK), `skill` (slug from the programme's course), `level` (1–5 int), `assessed_at` — **append-only**: retakes create new rows, history kept, latest per skill shown
- **Level scale**: 1 Never used it · 2 Watched someone use it · 3 Can use it with help · 4 Can work independently · 5 Can teach others (labels in `src/server/skills.ts`, the single source)
- **Integrity model (owner directive)**: level-1 evidence — employers NEVER see it, nothing gates on it; consumers are the trainee's own recommendations + the institute's coaching view (self-assessed card on the trainee detail page). Transparency over anti-fraud: the straight-up disclosure contract renders verbatim above the rating
- **Surfaces**: trainee profile `Skills` card (rating + save), portal `Skills` tab (read-only), institute trainee-detail card; API `GET/POST /api/v1/trainee/skills` (POST validates skills ∈ course.skills, levels 1–5, audit `SKILLS_ASSESSED`)

### Cohort
- **Identity**: `id` (uuid), `programme_id` (FK), `name`, `start_date`, `end_date`
- **Lifecycle**: Trainees enrol → certify → follow-ups triggered

### TrainingCenter (institute identity, Oct 2026)
- **Identity**: `id` (uuid), `name` (unique), `code` (unique), `district` — the institute ROLE maps to ONE TrainingCenter via env `INSTITUTE_CENTER_CODE` + a JWT claim (no Institute table; upgrade path = a full Institute entity with multi-tenant auth)
- **Scoping**: every institute query filters trainees/enrolments through cohorts by `trainingCenterId`; the government admin stays unscoped
- **Ranking**: center scores via the existing scoring engine (placement/academic/volume → overall, peer quartiles)

### Trainee
- **Identity**: `id` (uuid), `public_id` (human-readable, e.g., `TRN-000001`), `full_name`, `phone_e164` (unique, E.164 format), `email`, `district`, `language` (`EN` | `HI`)
- **Gender** (Oct 2026): enum `FEMALE | MALE | NON_BINARY | PREFER_NOT_TO_SAY` + optional self-described text; set at signup (Select), shown/edited on the profile
- **Enrolment**: Links to one Cohort via `enrolments` table
- **Access** (Oct 2026): passwordless — email magic link / 6-digit OTP, or a WhatsApp OTP to the verified phone (covers phone-only trainees added without an email; one Meta-approved authentication template serves both login and the phone-change flow)
- **Privacy**: Phone masked in UI (`+91 XXXXX 3210`), synthetic data only for demo

### Enrolment
- **Identity**: `id` (uuid), `trainee_id` (FK), `cohort_id` (FK), `certification_date` (date)
- **Invariant**: Unique `(trainee_id, cohort_id)`
- **Lifecycle** (Oct 2026): Active → (Dropped out | Completed). The institute may move a trainee to another cohort only while the trainee has zero progress data (checkpoints/followups — audit-logged); after progress exists the move is admin-only. Drop-out: AlertDialog naming the consequence → "Dropped out" + a timeline entry on the trainee detail; re-enrollment is a fresh Enrolment (never a status flip back). Portal access is kept.

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

### Certificates (provenance-only, Oct 2026 — ADR-003 supersedes ADR-002's review model)
- **Identity**: `id`, `trainee_id` (FK), `name`, `issuer`, `issue_date`, `expiry_date` (nullable), `file_url` (nullable — private storage, short-lived signed links; PDF/JPG/PNG, max 1 MB), `file_key` (nullable)
- **Source** (`certificate_source`): `SELF_REPORTED` (the trainee uploads any certificate they hold) | `ISSUED` (institute-issued programme certificate, tied to the trainee's Enrolment) — provenance is the signal; there is **no review workflow** (certificates are not hand-validated, owner decision Oct 13)
- **Status** (`certificate_status`): constant `VERIFIED` on every row (schema retained for stability); `PENDING`/`REJECTED` are no longer produced
- **Issuance effect** (Oct 13 grilling Q13): issuing completion certificates to a cohort IS the act of certification — sets the Enrolment's `certification_date` (defaults to the cert's issue date), flips `ACTIVE → COMPLETED`, audit-logged, idempotent (marker: status COMPLETED — certification_date is pre-seeded non-null)
- **Invariants**: certificates are live immediately at creation; the trainee may edit/delete their own `SELF_REPORTED` certificates any time, while `ISSUED` records are the institute's and immutable to the trainee; employers see applicants' certificates with provenance labels and may open proof files scoped to their own applicants
- **File access**: the owning trainee, the trainee's institute, government admin, and employers scoped to their own applicants

## Enums (Exact Values)

| Enum | Values |
|------|--------|
| `certificate_source` | `SELF_REPORTED`, `ISSUED` |
| `certificate_status` | `PENDING`, `VERIFIED`, `REJECTED` |
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
4. **dnd-kit NOT installed**: no drag use case exists in SkillsTrack (no kanban). Design allowlists it but YAGNI.
5. **Dead footer links**: landing links to /privacy, /terms, /consent, /data-retention, /accessibility — none exist as pages. Options: create minimal pages / remove links. Currently: links kept, unresolved.
6. **CSV export**: dead Export buttons (no backend route) replaced with client-side CSV generation from table data. Confirm OK.
7. **Employer verify redirect**: success on `/employer/verify/[token]` sends the (likely logged-out) verifier to `/dashboard` — existing behavior kept. Confirm intended.
8. **Dark mode**: implemented fully (design `[inferred]`; site had none) — next-themes, toggle in user menu. Confirm wanted.
9. **Sonner replaces Radix toast** (design §4.9 literal); Toaster mounted globally (fixes silent toasts on employer/verify).
10. **Non-functional controls**: decorative search/filter on cohort detail removed (design: no decorative controls); "Add Employment"/"Upload Certificate" on trainee portal removed or disabled-with-tooltip.
11. **Rebrand scope**: product name stays "SkillsTrack"; "Merivo" is the design system name only. Logo = GraduationCap in orange chip treatment.
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
28. **Turbopack build works, not adopted** (UI-13): `next build --turbopack` builds green — compile 2.8min vs webpack's 5+min hangs, no OOM (webpack OOM-killed twice on this 6.7GB machine), Sentry source-map hook still runs (112s). NOT added to `npm run build`: Vercel deploys use that script, turbopack is beta in Next 15.5, and the Sentry webpack config key (treeshake/Vercel-cron) is ignored by turbopack. Use `npx next build --turbopack` as a manual fast gate when memory-pressured; webpack stays the official gate. NOTE (UI-14): prisma `Can't reach database server` errors in dev are transient network blips (coincide with Sentry ECONNRESET noise during compile-heavy stretches) — NOT a turbopack incompatibility; dev has run `--turbo` all session with DB queries succeeding throughout.
29. **404 "Contact support" linked as "Back to home"** (UI-16): §9.10's 404 row wants a [Contact support] link, but no support channel/route/email exists anywhere in the product — linking a fabricated mailto would be a dead link. Linked "Back to home" (`/`) instead; add a real contact route or support email when available.
30. **StrictMode verify double-fire guard** (UI-15): dev double-fires effects (Next 15 defaults reactStrictMode true); the one-time magic-link token's second POST hit TOKEN_USED and race-dependently flipped the loaded profile to the error state. Guarded with a ref key per token/nonce (Retry still re-verifies). Production unaffected (single fire) — guard kept for dev/demo stability.

## Idea Bag — deferred from the UI-16 two-axis code review (Oct 2)
Decisions the review surfaced that need a product call, a bigger refactor round, or data that doesn't exist yet. Confirm or override:
31. **Table column width tokens deviate from §4.5's scale** — KEPT-as-is (decision Oct 11): the documented tokens (`w-col-xs…w-col-3xl`, `h-list`/`h-list-sm`) match the shipped visuals 1:1 with zero layout shift; conforming to §4.5's exact scale would churn every ops table for no user benefit. If the design system ever demands strict §4.5 conformance, re-tune then.
32. **Components >200 lines** (13.1 #15) — DONE (Oct 11, spec #94, lanes #95–#99): 14 fat files componentized via 5 parallel lanes — dashboard-view 918→239, admin analytics 593→229, institute analytics 532→209, jobs-board 637→281, job-management 534→329, post-job 513→105, trainee auth 665→136, signup 477→64, employer register 428→77, simulator 587→313, profile 455→197, trainee detail 433→139 (every targeted UI file now <200; the repo's >200 residue is deliberate: bot state-machine + server/analytics.ts logic, data-table/contracts patterns, and the below-the-line ops pages). Reuse lifted where verified: `patterns/chart-card`, `patterns/time-window-select`, `patterns/programme-select` (byte-identical in both analytics pages), `lib/csv`, `lib/districts` (4 copies deduped), `lib/job-board-labels`, `components/auth/` trio (×2 surfaces), `components/employer/` (new domain folder, verification banner was duplicated verbatim). Zero behavior change — gates (tsc 0 · lint 0 · 146/146) + every touched page loop-checked rendering identically. README "Component organization (src/)" section documents the folder spec.
33. **Missing tabs** (§9.4/§9.5/§9.10): trainees list wants line tabs (All · Active · Archived), trainee detail wants (Overview · Activity · Files · Settings), institute analytics wants tabs — each needs real filtered content behind it (enrolment-state filters, detail-section splits). Product call on what each tab shows.
34. **§9.4 toolbar view toggle + §4.5 pagination**: the [list|grid] view toggle needs a grid view of trainees; DataTable page-numbers (max 5 + ellipsis) and page-size Select (10/25/50) are component work on DataTable plus its call sites.
35. **User menu Settings item** (§3.3 "Settings, Log out"): no settings surface exists for admin/institute/employer (trainees have "My profile"). A dead Settings item would break the no-dead-links rule (#5) — create the surface first.
36. **Workspace switcher is decorative** (§3.3 DD-13): renders `ChevronsUpDown` with no dropdown — single-role demo accounts have nothing to switch to. Build the dropdown when multi-workspace accounts exist.
37. **Benchmark score badges** (admin analytics): `variant="success"` ternary on scores (≥75) — color-coded without StatusBadge; scores aren't domain statuses. A ScoreBadge per §4.10 if you want consistency. — FIXED-this-changeset (quick-wins #86): `ScoreBadge` pattern component (dot + soft-bg, same thresholds) in status-badge.tsx; analytics leaderboard uses it.
38. **Touch targets** (§12 ≥44px on touch): pagination buttons are `size-8` (32px) at all widths; §12 wants ≥44px below lg. The compliant pattern would be `size-11 lg:size-8` — chunkier mobile pagination. — FIXED-this-changeset (quick-wins #85): all pager controls — DataTable client pager + mobile-card pager + the 4 server-paged footers (trainees, audit-logs, conflicts, followups) — now `size-11 lg:size-8`.
39. **EvidenceLevel type** (Primitive Obsession): the evidence ladder in StatusBadge's `EVIDENCE_MAP` is a bare number with a `-1` CONFLICT sentinel; a small branded `EvidenceLevel` type would name the concept. — FIXED-this-changeset (quick-wins #87): `EvidenceLevel` type + `EVIDENCE_CONFLICT` const exported; deliberately a plain-number alias (values cross the API untyped — branding would force casts at 6 call sites for zero runtime safety).

Skipped from the same review as shadcn-standard or already-documented: avatar `dark:brightness-90` (AP-08 borderline — a brightness filter, not a color override; shadcn-standard), FilterBar 6+ → Sheet threshold (documented in the component doc), `kpis/districts` endpoint and dead `/privacy`/`/terms` links (already #19/#5).

## Idea Bag (older items)
- **In-app message thread per application** (employer↔trainee chat): parked — feasible later via a simple polling-based thread; contact reveal on shortlist covers the immediate need.
- **WhatsApp bot apply flow**: trainees apply via web only; bot job prompts/apply deferred.
- **Bot notifications for new jobs**: WhatsApp nudge when a job matching the trainee's district/skills posts — stretch.
- **"Viewed" application state** (employer saw the application): parked; minimal state machine preferred. — IMPLEMENTED-this-changeset (quick-wins #88): `JobApplication.viewedAt` (migration 20261011113000); employer expanding the applicants panel marks that job's unviewed applications (employer-role sessions only — admin peeks don't count); trainee My Applications shows an outline "Viewed" pill. Note: VIEWED is deliberately NOT a JobApplicationStatus — it's orthogonal to the decision state machine.
- **Interview scheduling** (employer↔trainee slot booking): parked.
- **Max open jobs per employer** (spam control): parked until real usage demands it. — IMPLEMENTED-this-changeset (quick-wins #89): `POST /api/v1/employer/jobs` 409s at ≥25 OPEN postings (`TOO_MANY_OPEN_JOBS`); closing a posting frees a slot.
- **Employer profile pages as a metric**: company profiles (sector, size, hiring history) surfaced as their own analytics section — near-future.

## Idea Bag — trainee-section grilling (Oct 13)
40. **UAN-based past-employment retrieval**: trainee supplies their EPFO UAN (+ consent) and the system imports verified past employment into Employment History. Decided Oct 13 (trainee-section grilling Q6): trainees do NOT hand-type employment rows — the hire-created row stays the sole system-written entry, and prior jobs arrive only via UAN retrieval once built. Self-entry of Employment History is explicitly rejected until then.
41. **Institute/admin removal of self-reported certificates** — LANDED Oct 13 (issue #112): with the review workflow gone, the trainee fully controls their self-reported certificates and NOBODY else can remove one — an offensive/wrong upload currently has no remediation path except the trainee's own delete. If ever needed: an audit-logged institute/admin removal (trainee notified), mirroring the old junk-removal rule from ADR-002 §invariants. Do not build until a real incident demands it.
42. **In-browser certificate preview** — LANDED Oct 13 (issue #113): today "View file" downloads/opens via short-lived signed URLs; an embedded PDF/image preview inside the portal/profile would avoid the extra tab. Low priority.
43. **Bulk CSV certificate import** — LANDED Oct 13 (issue #114): institutes with a spreadsheet of legacy certificates could import (name, issuer, issue date, trainee publicId) instead of per-cohort issuance only. Only worth it if institutes actually arrive with legacy data.
44. **Skills self-assessment — LANDED (Oct 13, ticket #115)**: built as specced — `SkillAssessment` append-only model, skills source = **Programme → Course link** (option (a); `Programme.courseId`, seed + idempotent backfill), trainee rates 1–5 with the straight-up disclosure contract verbatim above the rating, real Skills card on profile + Skills tab restored on the portal, institute coaching card on the trainee detail page, `GET/POST /api/v1/trainee/skills`, harness checks. Integrity + disclosure model (owner directive, Oct 13): self-assessment is level-1 evidence — employers NEVER see it, nothing gates on it; consumers = the trainee's own recommendations + the institute's coaching view. Straight-up disclosure contract (rendered verbatim before rating): who sees it (trainee + training center, never employers) · what it decides (course/job suggestions only) · what it doesn't decide (certificates, applications, placement) · retake any time, history kept. Transparency replaces anti-fraud machinery; anomaly detection deliberately deferred.

## Non-Goals (Hackathon)
- Not a replacement for SIDH/NCS/LMS/HRMS
- No scraping, no real PII, no LLM decisions
- No multi-tenant / gov admin dashboard
- No phone encryption at rest (mask in UI only)
- No email channel (WhatsApp only)

### Branding flavors (Oct 12)
One codebase, two faces — `src/lib/branding.ts` + `NEXT_PUBLIC_BRANDING` env:
- **`maharashtra`** → SIH 2026 / Government of Maharashtra / MSSDS-PMKVY attribution on landing, footer, privacy, signup quote, login demo hints (`maharashtra.gov.in`), and WhatsApp bot copy (en/hi/mr substring patches over the neutral templates, `applyBotReplacements` in messages/index.ts warns on a missed match).
- **`default`** (unset) → neutral SkillsTrack copy.
Deployment plan: current Vercel project = `maharashtra` flavor; a second project linked to the same repo with unset branding = the public version. Both auto-deploy on every push to main — features land once, appear on both. Bot message edits must keep both flavors' patch pairs in sync (branding.test.ts covers it).

### Bug Bag — full-app QA walkthrough (Oct 4)
Context: 4-agent role-by-role walkthrough (trainee, institute ×2, employer, admin) + coordinator code-fix pass. Full report + latency table at `shots/walkthrough/QA-REPORT.md`. Statuses: FIXED-this-changeset / CLEARED-not-reproducible / OPEN-needs-decision.
1. **(High) Placement rate 134% — claim-vs-trainee unit mismatch in kpis/overview** — FIXED-this-changeset: verifiedEmployed/employed counted CLAIMS (a trainee with several claims counted twice) while certified/outcome-known counted TRAINEES → both now trainee-based; verified live: Placed 74, rate 90% (was 110/134%). Evidence: shots/walkthrough/admin/01-dashboard-funnel-bug.png, shots/walkthrough/institute/dashboard.png.
2. **(Med) My Applications tab stale right after applying** — FIXED-this-changeset: the jobs board's optimistic update only flipped the badge → fetchAll() refetch after apply. Evidence: shots/walkthrough/trainee/13-job-applied.png, shots/walkthrough/trainee/14-my-applications.png.
3. **(Med) Simulator page crash on ANY API error response** — FIXED-this-changeset: the 404 body `{ error: { code, message } }` was rendered as a React child ("objects are not valid as a React child"); the masked-phone Direct Start crashed to the error boundary → now extracts `.message` and shows the inline bot message. Evidence: shots/walkthrough/admin/10-simulator-crash-invalid-phone.png, shots/walkthrough/admin/15-simulator-masked-phone.png.
4. **(Med) Simulator dead end — picking a trainee gave no way to start a conversation** — FIXED-this-changeset: Send requires `sessionActive`, which only the phone-path set → handleStartSimulation takes a phone override + "Start conversation" button in the trainee card. Evidence: shots/walkthrough/admin/10-simulator-stuck.png, shots/walkthrough/admin/10-simulator.png.
5. **(Low-Med) Raw Zod leak on garbage magic-link tokens** ("token: String must contain at least 32 character(s)" rendered) — FIXED-this-changeset: client-side token-shape guard routes garbage to the recovery form. Evidence: shots/walkthrough/trainee/08-invalid-token-garbage.png.
6. **(Low) decryptPhone roundtrip double-prefixed +91** (encrypt stores digits-only incl. the 91 country code; decrypt prepended +91 again → +91919812000001) — FIXED-this-changeset: now normalizes via normalizePhoneE164. LATENT: no production callers (the profile displays maskPhoneE164(phoneE164) directly).
7. **(Low) Phone maxLength={10} silently truncated a +91-prefixed paste into a valid-looking WRONG number** (demonstrated: it CREATED a trainee with a mangled phone) — FIXED-this-changeset: maxLength removed in add-trainee-form + signup; a pasted 91-prefix is now stripped client-side and the zod regex flags the rest. Evidence: shots/walkthrough/institute/06-trainees-all-tab.png (mangled rows TRN-MUT4UQIO-STLT, TRN-MUT53ADS-HKXR).
8. **(Low) Post-logout stale portal (cookies cleared but no redirect — intermittent, first logout)** — FIXED-this-changeset: hard-navigation fallback after signOut in app-sidebar + command-palette.
9. **(Low) Signup self-describe: native `required` preempted the zod superRefine's styled error with the browser tooltip** — FIXED-this-changeset: native required removed (aria-required kept). Evidence: shots/walkthrough/trainee/02-signup-poke-empty-selfdescribe.png.
10. **404-page "Go to dashboard" loop** — CLEARED-not-reproducible: /institute → 404 → Go to dashboard → /dashboard renders fine. Evidence: shots/walkthrough/institute/404-institute-root.png.
11. **Trainees-list typed search broken** — CLEARED-not-reproducible: "Walk Tr1" → /trainees?q=Walk+Tr1 → 3 total, correct case-insensitive ID+name contains-matches.
12. **Login failure silent bounce** — CLEARED-not-reproducible: the failure path shows friendly errors + the redirect-param guard prevents lockout loops; error banner verified live. Evidence: shots/walkthrough/institute/19-login-error-banner.png.
13. **Pagination "missing" on followups/conflicts/audit-logs** — CLEARED-not-reproducible: verified rendering live: "Page 1 of 50" / "Page 1 of 2" / "Page 1 of 4" with Previous/Next (the walkthrough's snapshots truncated at the bottom of long pages); audit-logs re-verified after one transient empty state. Evidence: shots/walkthrough/admin/07-followups-no-pagination.png.
14. **Analytics tooltips unrounded floats** — CLEARED-not-reproducible: the shared ComparisonChart/LineChart/PeerComparisonChart all round via toFixed(1) formatters.
15. **"Failed to fetch analytics" (Sentry, 4 users) + intermittent profile first-load failure** — CLEARED-not-reproducible: Supabase pooler P1001 outage windows (the move-cohort boundary crash has the same error digest); the direct-connection dev server removes the root cause locally. The production half — no clean 503 — landed Oct 10 (Enhancement Bag #4, merged via PR #83): DB outages now return 503 SERVICE_UNAVAILABLE + Retry-After, distinguishable from real bugs. CLOSED. Evidence: shots/walkthrough/admin/issue-01-analytics-fetch-error.png, shots/walkthrough/institute/08-move-cohort-error-boundary.png.
16. **Conflict queue is a dead end**: rows have no links, no Resolve action exists anywhere — FIXED-this-changeset: new admin-only `POST /api/v1/conflicts/[id]/resolve` (CONFIRM → EMPLOYER_CONFIRMED, REJECT → UNKNOWN — the enum has no REJECTED value, UNKNOWN is the void bucket per PRD §6; decision writes a CONFLICT_RESOLVED audit event; 409 on already-resolved), per-row Confirm/Reject actions opening a CL-18 confirm dialog, trainee names link to the detail page. Verified live: Bhavana Kadam @ Sharma Traders resolved → EMPLOYER_CONFIRMED, left the queue, audit event written; re-resolve 409s cleanly.
17. **Login ?redirect= can point at a nonexistent route → post-login 404** — FIXED-this-changeset: new `isKnownRoute()` allowlist in protected-routes.ts (public pages + protected prefixes; prefixes with no index page carry a trailing slash — `/admin/`, `/institute/`, `/employer/`, `/auth/`, `/trainee/`, `/cohorts/` — so bare 404 prefixes fall back to the role home while real subpage destinations match; `/api/v1/*` excluded so redirects always land on a page).
18. **/cohorts and /verification index routes are 404s** — RESOLVED-no-fix-needed: the real surfaces exist — the Verification queue is the "Verification" tab on /admin/analytics (verified from the walkthrough screenshot), and cohorts are reached at /cohorts/[id], deep-linked from the dashboards' cohort tables. Nothing in the app links to /cohorts or /verification, so they are typed-URL-only 404s handled gracefully by the 404 page.
19. **Admin visiting /employer/dashboard gets the employer sign-in page instead of a denial** — FIXED-this-changeset: `/api/v1/employer/me` required role === "employer" exactly, so the admin passed the middleware (which allows admin on /employer/*) but 401'd the data fetch → the page redirected to /employer/login. The route now allows ["employer", "admin"] — the admin session has no Employers row and lands in the route's existing demo-view fallback ("All Employers (Demo View)"), consistent with how /institute treats admin.
20. **Followups "of 1000" total — verify the count isn't capped** — RESOLVED-no-cap: the DB count is exactly 1000 (the seed created exactly 1000 follow-up events; total trainees 515) and the API's count query is uncapped (`db.followupEvent.count`) — the round number is real data, not a cap.
21. **UX nits** — FIXED-this-changeset (all four): (a) typed password across the login role switch — verified it already survives the switch (RHF keeps `_formValues` across unmount); pinned `shouldUnregister: false` deliberately to guard against config drift; (b) trainee search submitted on Enter only — mouse users had no way to search; icon submit button added to the GET form (server-side kept); (c) date spinbuttons "0"/arrow noise on empty datetime-local filters (followups + audit-logs) — native webkit spin buttons hidden in globals.css, calendar indicator kept as the picker affordance; verified in the served CSS; (d) a dropped trainee's detail rendered a dead corner (no kebab) — actions now render disabled-with-tooltip ("…is dropped out — they can't be moved to another cohort or dropped again."); verified live on Walk Tr6; active trainees unaffected.
22. **Dead footer links /privacy /consent /data-retention /accessibility → 404** (existing Idea Bag #5) — FIXED-this-changeset: all five policy pages created — /privacy, /consent, /data-retention, /accessibility (footer links, lines 44–47) plus /terms (linked from login + signup, not the footer — same Idea Bag). Plain honest content, root layout, prose container, "Back to home" link; all serve 200.
23. **RESEND_API_KEY unused leftover in the Vercel env** (takes effect next deployment) — FIXED-this-changeset: removed from Vercel Production + Preview envs via `vercel env rm --yes` (walkthrough #23).

### Performance Enhancement Bag — full-app QA walkthrough (Oct 4)
Context: measured on the walkthrough dev server (Turbopack, localhost:3000); full latency table at `shots/walkthrough/QA-REPORT.md`. Cold numbers include dev-only compiles (6–107s) — not production issues.
1. **kpis/overview query storm (THE hotspot) — RESOLVED (Oct 9)**: was 7 sequential full-table COUNTs + in-memory aggregation (6.5–8.3s warm on the pooler, 24s+ during flakes). Fixed in two steps: (a) `Promise.all` parallelization (measured A/B: 3.52s → 1.89s on the direct connection), then (b) the `KpiDailySnapshot` table + snapshot-first read path (spec #80, tickets #81/#82): snapshot-present hits read instantly (~1.0–1.5s incl. live recent-activity); the first hit of the day computes + upserts once. Bonus fix surfaced during verification: the follow-up response-rate denominator counted only status=SENT (903% — impossible) → now ever-sent (85%). Deltas/sparklines now honest (Idea Bag #17 unlocked).
2. **Trainees list IN(...) loads — RESOLVED for the API route (Oct 10)**: `GET /api/v1/trainees` was the remaining hotspot (`?limit=500` measured 3.6s / 737KB payload with the deep include chain). Now simulator-scoped `select` (the only GET consumer — 5 fields): **85KB (8.7× smaller), ~1.3s (2.5× faster, at the dev-mode floor — the 1-query health endpoint measures the same)**; also trims PII surface (phoneEncrypted/phoneHash/email never leave the server). The trainees LIST page already queried Prisma directly with a narrow select (5 fields + enrolment statuses) — verified untouched and already optimal. A/B measured on the same dev server.
3. **DB flakiness — DIAGNOSED & FIXED (Supabase MCP + docs, Oct 9)**: root cause was NOT plan limits (max_connections=60, usage 14) and NOT the pooler port — :6543 (transaction mode) is CORRECT for the app on Vercel (Vercel is IPv4-only and cannot reach the IPv6-only direct host). The real config bug: `DIRECT_URL` (migrations) pointed at pooler TRANSACTION mode :6543 with `pgbouncer=true` — the docs-correct value is SESSION mode :5432 (no pgbouncer param); transaction mode stalls the schema engine (>90s hangs, 3/3 attempts) — **FIXED**: DIRECT_URL now session mode :5432; `prisma migrate status` connects in ~19s. The intermittent P1001 windows (Oct 1–4, BOTH local AND Vercel — Sentry "Failed to fetch analytics" 8 events, last seen 5d ago) were a Supabase-side transient outage window (two independent clients failed in the same window) + local Jio-carrier IPv6 (CGNAT) noise; all three paths (direct :5432, pooler :6543, pooler session :5432) verified 12/12 SSL handshakes each, ~210–230ms, zero failures at rest. Working DDL recipe when the pooler misbehaves: `DIRECT_URL="$DATABASE_URL" npx prisma db push` (direct host, 11.5s for the snapshot table). .env gitignored (local-only); Vercel envs keep DATABASE_URL on the transaction pooler (redacted values — update its DIRECT_URL to session :5432 in the dashboard if migrations are ever run from Vercel). NOTE (Oct 11): the snapshot migration (20261009175000) had never been recorded in `_prisma_migrations` (it was db-pushed) — that drift made `prisma migrate dev` demand a full DB reset; healed via `prisma migrate resolve --applied` for both snapshot + the new viewed_at migration. Run `npx prisma migrate status` before any `migrate dev` — "not yet applied" for an existing table = resolve, never reset. NOTE (Oct 12, PREVIEW ENVS): Preview deployments were missing 6 envs Production had — **AUTH_SECRET (preview login 500'd with NextAuth ConfigurationError — every preview was login-broken until fixed), BREVO_API_KEY, EMAIL_FROM, APP_BASE_URL, NEXT_PUBLIC_INTERNAL_API_KEY** + corrected ADMIN/INSTITUTE_EMAIL. All set via `vercel env add … --value … --no-sensitive --force` (CLI 60 stdin-piping is unreliable — use --value; --no-sensitive keeps `env pull` verifiable instead of redacting). APP_BASE_URL on preview = latest production deployment URL (shared DB keeps emailed tokens valid). SENTRY_AUTH_TOKEN still absent on preview (build-time source-maps only, non-blocking).
4. **503 robustness — DONE (Oct 10)**: shared `isDbOutage()` (Prisma P1001/P1002/P2024 + the can't-reach message) + `routeErrorResponse()` in `_utils.ts` — a DB outage now returns **503 SERVICE_UNAVAILABLE + Retry-After: 30** (the retryable code) instead of 500 "bug" / dropped connection. 43 route catch blocks migrated mechanically, plus the health endpoint (503-aware — load balancers key on it). End-to-end verified with a dead-host DATABASE_URL: kpis/districts → clean 503; recovery verified after restore (health 503 on the first cold-connect hit — correctly transient — then 200). 5 new unit tests (`_utils.test.ts`); suite 146/146. Pairs with Bug Bag #15: known-transient outages are now semantically distinguishable from real bugs in monitoring.
5. **Time-series KPI snapshots (existing Idea Bag #17) — DONE (Oct 9)**: the `KpiDailySnapshot` table + snapshot-first read path is built (spec #80, tickets #81/#82) — fixes the overview hotspot (#1) and unlocks honest deltas/sparklines on the dashboard KPI cards.
6. **Turbopack build (existing Idea Bag #28)**: verified working, 2.8min vs 5+min webpack.
7. **Dev-only**: first-hit compiles 6–107s (worst 269.4s for /employer/dashboard) inflate walkthrough cold numbers (not a production issue).