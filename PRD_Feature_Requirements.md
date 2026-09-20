# OutcomeTrack — Hackathon PRD & Feature Requirements (v1.0)

> Skilling Outcomes & Impact Intelligence Platform. Hackathon submission: **23 September 2026**.
> This file is written to be grilled (`/grill-me`): decisions already made are in §12, open questions in §13.
> Companion files: `Team_Integration_Guide.pdf`, `contracts/schema.sql`, `contracts/openapi.yaml`, `contracts/bot_service.openapi.yaml`.

---

## 1. One-paragraph pitch

Training systems record enrolment and certification well, but nobody reliably knows what happens to trainees **after** training: did they get a job, keep it, earn more? OutcomeTrack is an **outcome-evidence layer**: it follows up with trainees on WhatsApp at 30/90/180/365 days, turns their answers into employment claims, lets employers verify those claims in one click, and shows programme owners **coverage, verified employment, retention and wage progression** with the evidence level behind every number.

Core loop: `Training → Certification → Outcome claim → Employer verification → Follow-up (30/90/180/365) → Retention/wage → Analytics`

Guiding principle: **trust is the product.** Unknown ≠ unemployed. Never overwrite history. Always show numerator/denominator and evidence level.

## 2. Team, constraints, and why integration is the #1 risk

| Person | Owns | Delivers |
|---|---|---|
| **Me (integration lead)** | Integration, DevOps, backend, frontend | Next.js app (UI + `/api/v1`), conversation logic, deployment, env/config, integration testing, demo |
| **Teammate A — Database** | PostgreSQL schema, seed data, analytics views | Live DB (Supabase Postgres), `schema.sql`/migrations, `seed.sql`, views `v_*` |
| **Teammate B — WhatsApp bot** | WhatsApp transport only | Service exposing `POST /send`; forwards inbound messages to backend `POST /api/v1/bot/inbound` |

Constraints:
- **3 days left** (20 → 23 Sep). Three people, three separately-built parts that must snap together at the end.
- Therefore: **contract first**. Names, endpoints, JSON shapes, enums and env vars are frozen *before* anyone builds (see the Integration Guide + `contracts/`).
- Design rule: **"dumb bot, smart backend."** All conversation logic lives in the backend, so the bot teammate only moves text between WhatsApp and one endpoint.
- Design rule: **every part can run alone with mocks** (`BOT_MODE=mock`, a web-based WhatsApp simulator page, seed data), so nobody is blocked by anybody.

## 3. Users (hackathon-scope)

| Role | Interface | What they do in the demo |
|---|---|---|
| Programme admin | Web dashboard | Imports cohort, triggers follow-ups, watches KPIs, reviews conflicts |
| Trainee | WhatsApp (or simulator page) | Answers short questions: status, employer, role, salary band |
| Employer | Mobile-friendly link page | Confirms/rejects the claim in <30 seconds |

(Provider officers, district officers, analysts, system admin from the full blueprint are **out of scope** for the hackathon except as optional role-login.)

## 3b. Non-goals

Not a replacement for SIDH/NCS/LMS/HRMS. Not a job portal. No scraping of government systems. Non-response is never treated as unemployment. No real personal data — **synthetic data only**. No LLM making decisions about funding/fraud/eligibility.

---

## 4. Feature tiers (the "cut-line" plan)

The project is built as **layers**. Each layer is demoable on its own. If time runs out, we stop at the last fully-working layer and demo that — nothing half-built goes on stage.

### TIER 0 — CORE / MUST HAVE (this alone is a complete demo)

| ID | Feature | Acceptance criteria |
|---|---|---|
| **F01** | Seeded programme + cohorts; list cohorts | Dashboard lists ≥2 cohorts from DB seed |
| **F02** | Trainee import (JSON/CSV → `POST /trainees/import`) | Uploading a CSV with columns `full_name,phone_e164,email,district,language` creates trainees + enrolments; duplicates (same phone) skipped and reported |
| **F03** | Trainee 360 page | Shows profile, cohort/course, and an ordered timeline (certification, follow-ups, claims, verifications) |
| **F04** | Trigger follow-up | Admin clicks "Send 30-day follow-up" for one trainee or a whole cohort → `followup_events` created → backend calls bot `POST /send` (or logs in mock mode) |
| **F05** | Conversational status capture | Trainee replies (numbers or text) → backend walks the flow: status → (if working) employer name → role → salary band → creates `employment_claims` row with `verification_status = SELF_REPORTED` and an `outcome_events` row |
| **F06** | Employer verification page | Auto-generated single-use link `/employer/verify/{token}` shows minimal claim info; Confirm → claim becomes `EMPLOYER_CONFIRMED`; Reject → `CONFLICT`. Both append `outcome_events`; neither overwrites history |
| **F07** | Dashboard KPIs | Cards for Trainees, Outcome coverage, Verified employment, Conflicts + funnel (Certified → Outcome known → Employed → Verified). Every rate shows numerator/denominator |
| **F08** | WhatsApp simulator page | A web chat page that calls the **same** `POST /bot/inbound` endpoint, so the full loop is demoable even if WhatsApp setup fails |

### TIER 1 — IMPORTANT (build after Tier 0 works end-to-end)

| ID | Feature | Acceptance criteria |
|---|---|---|
| **F09** | 90-day retention follow-up | "Still with the same employer? / changed / no longer working" + wage band; retention chart from `v_retention` |
| **F10** | Conflict queue | List of `CONFLICT` claims (trainee says employed, employer rejects) with both sources shown |
| **F11** | Audit log viewer | Table of `audit_events` (who/what/when) |
| **F12** | Follow-up operations table | Due/sent/responded/failed with filters |

### TIER 2 — OPTIONAL (nice if time allows)

| ID | Feature |
|---|---|
| **F13** | Consent capture (bot asks consent on first contact) + consent history on Trainee 360 |
| **F14** | Adaptive questionnaire branches (self-employed, apprentice, looking, not working) |
| **F15** | Wage-band progression chart + training-relevance metric |
| **F16** | English/Hindi toggle for bot messages (`trainees.language`) |
| **F17** | Simple role login (admin / employer view) |
| **F18** | No-response handling: retry → `EXPIRED` → outcome `UNKNOWN`; "advance demo clock" button |
| **F19** | CSV export of cohort results |

### TIER 3 — STRETCH (only if everything above is solid)

| ID | Feature |
|---|---|
| **F20** | "Impact insight" text generated from computed metrics (rule-based first; LLM summary grounded only in the numbers) |
| **F21** | Mock SIDH-style adapter (CSV/JSON import + export contract) |
| **F22** | Duplicate-trainee detection (name + district similarity) → data-quality case |
| **F23** | Employer "Edit" option on verification page |
| **F24** | Email channel adapter |

### Demo-safe fallbacks

| If this is late… | Then… |
|---|---|
| WhatsApp bot not working | Use F08 simulator page (same endpoint, same logic) — demo is unaffected |
| Bot can't send outbound | `BOT_MODE=mock`: backend shows the outbound message in the UI/logs; reply through the simulator |
| DB views incomplete | Backend computes KPIs with plain SQL/aggregations instead of views |
| Tier 1 unfinished | Demo Tier 0 only; mention Tier 1–3 as roadmap slide |

---

## 5. Key flows

**A. Follow-up & claim (F04–F06)**
1. Admin triggers 30-day follow-up → backend creates `followup_events` (status `SCHEDULED`), calls bot `POST /send` with the first question → status `SENT`.
2. Trainee replies `1` (Employed) → bot forwards to `POST /bot/inbound` → backend loads `bot_sessions` state, validates, stores response, returns next question in `replies[]`.
3. After salary band, backend creates `employment_claims` (`SELF_REPORTED`, level 1), appends `outcome_events`, auto-creates a `verification_requests` row + link, writes `audit_events`, closes session, marks `followup_events.status = RESPONDED`.

**B. Employer verification (F06)**
Employer opens `/employer/verify/{token}` → sees candidate first name, employer, role, start date only → Confirm/Reject → backend updates claim (`EMPLOYER_CONFIRMED` level 3, or `CONFLICT`), appends `outcome_events`, writes audit event, invalidates token (single use).

**C. Retention (F09)** — 90-day follow-up asks whether still employed + salary band; new `outcome_events` with `checkpoint_days = 90`; `v_retention` compares against the 30-day baseline.

**Bot message flow (backend-owned, P0):**
`AWAITING_STATUS → [EMPLOYED | SELF_EMPLOYED | APPRENTICE] → AWAITING_EMPLOYER_NAME → AWAITING_ROLE → AWAITING_SALARY_BAND → DONE`
`AWAITING_STATUS → [LOOKING | NOT_WORKING] → DONE`
Invalid input → repeat question once with hint; unknown phone → polite generic reply, `matched:false`.

## 6. Verification ladder (evidence model)

`0 UNKNOWN` (never means unemployed) → `1 SELF_REPORTED` → `2 PROVIDER_CONFIRMED` → `3 EMPLOYER_CONFIRMED` → `4 DOCUMENT_VERIFIED` → `5 SYSTEM_VERIFIED`; plus `CONFLICT` when sources disagree. Hackathon uses levels 1, 3 and CONFLICT. Rules: never overwrite contradictory history; append new events; keep source + timestamp + verifier for every claim.

## 7. Metric definitions (always show numerator, denominator, period)

| Metric | Definition |
|---|---|
| Outcome coverage | trainees with a known (non-UNKNOWN) latest outcome ÷ certified trainees |
| Verified employment | employed/self-employed/apprentice with `EMPLOYER_CONFIRMED` ÷ trainees with outcome known |
| Retention at T | employed at 30-day checkpoint and still employed at T ÷ employed at 30-day checkpoint |
| Follow-up response rate | follow-ups `RESPONDED` ÷ follow-ups `SENT` |

## 8. INTEGRATION CONTRACT (summary — full detail in `contracts/`)

**Conventions (non-negotiable after freeze)**
- **snake_case everywhere**: DB columns = API JSON fields = CSV headers. No camelCase anywhere.
- IDs: uuid `id`; foreign keys `<entity>_id`; human-readable `public_id` (`TRN-000001`) for trainees.
- Timestamps `*_at` ISO-8601 UTC; dates `*_date` `YYYY-MM-DD`; phones E.164 `phone_e164` (`+91…`).
- Enums: `UPPER_SNAKE_CASE` strings (exact lists in `schema.sql`): `outcome_status`, `verification_status`, `salary_band`, `followup status`, `channel`.
- API base `/api/v1`; errors: `{"error":{"code","message"}}`; service-to-service auth: `X-API-Key: $INTERNAL_API_KEY`.
- Contract change protocol: additive changes allowed if announced with prefix `CONTRACT CHANGE:`; renames/removals need the integration lead's OK.

**Who calls whom**
```
Trainee (WhatsApp) ⇄ [Bot service] ── POST /api/v1/bot/inbound ──▶ [Backend + Frontend (Next.js)] ⇄ [Postgres]
                        ▲                                                   │
                        └────────── POST {BOT_BASE_URL}/send ◀──────────────┘
```
- Bot → Backend: `POST /api/v1/bot/inbound` `{provider, provider_message_id, from_phone_e164, text, received_at}` → returns `{matched, trainee_id, session_state, replies:[{text, options[]}]}`
- Backend → Bot: `POST {BOT_BASE_URL}/send` `{message_id, to_phone_e164, text, options[], language}` → `202 {status:"queued", provider_message_id}`
- Optional: Bot → Backend `POST /api/v1/bot/delivery-status`.

**Database ↔ backend boundary**
- Teammate A owns tables/columns/views; backend only reads views `v_trainee_latest_outcome`, `v_cohort_overview`, `v_retention`, `v_wage_bands` and reads/writes tables by the exact names in `schema.sql`.
- `outcome_events` is append-only (no UPDATE/DELETE).
- Seed data must include teammates' real WhatsApp test numbers as trainees.

**Environment variables (agreed names)**
`DATABASE_URL`, `INTERNAL_API_KEY`, `BOT_BASE_URL`, `BOT_MODE` (`real`|`mock`), `APP_BASE_URL`, `BACKEND_BASE_URL` (used by bot).

## 9. Non-functional requirements

- Server-side validation of every request; never trust the UI.
- Employer page exposes minimum data (first name, claim fields) — no phone, no full record.
- Verification tokens: random, hashed in DB, single-use, expiring.
- Mask phone numbers in dashboard tables.
- Synthetic data only; a visible "demo data" label.
- Mobile-friendly employer page; dashboard usable on a laptop projector.
- Bot inbound endpoint is idempotent on `provider_message_id`.

## 10. Demo script (5 minutes)

1. Admin opens dashboard → cohort shows certified trainees, coverage low.
2. Import a small CSV → new trainees appear.
3. Open one trainee → timeline shows training + certification.
4. Trigger 30-day follow-up → WhatsApp message arrives on a phone (or simulator).
5. Reply "Employed", employer, role, salary → claim appears `SELF_REPORTED`.
6. Open the employer link on a phone → tap Confirm → `EMPLOYER_CONFIRMED`.
7. Dashboard KPIs update live (coverage, verified employment).
8. *(Tier 1)* Create a conflict (employer rejects) → conflict queue + audit log. Show 90-day retention chart.
9. Close with the principle: unknown ≠ unemployed; every number has evidence behind it.

## 11. Timeline (suggested)

| When | Milestone |
|---|---|
| Sun 20 Sep | Contract frozen (all three ack). Repo + folders created. Backend skeleton deployed with stub endpoints |
| Mon 21 Sep | Teammate A: schema applied + seed loaded on shared Postgres. Teammate B: `/send` reaches a real phone. Me: real endpoints for Tier 0. Evening: **integration test #1** (both directions bot↔backend) |
| Tue 22 Sep | Morning: full Tier 0 loop on real stack. **Feature freeze at noon.** Afternoon: bug-fix, Tier 1 only if Tier 0 is stable. Evening: demo rehearsal + backup screen recording |
| Wed 23 Sep | No new features. README, demo video, submission checklist. Submit early |

## 12. Decisions already made (challenge these)

1. Stack: Next.js (UI + API routes) + Postgres (Supabase) + separate bot service.
2. Bot is a thin transport; backend owns the conversation state machine (`bot_sessions`).
3. snake_case everywhere, shared names across DB/API/CSV.
4. Numbered replies (`1`–`5`) as the primary WhatsApp input (works with any provider); free text accepted where sensible.
5. Salary as bands, not exact amounts.
6. Verification link is auto-generated when a claim is created; dashboard can copy/resend it.
7. Tier 0 is a complete demo; Tiers 1–3 are additive.
8. Synthetic data only.

## 13. Open questions (please grill me on these)

1. Does the hackathon judge on working demo, business impact, or technical depth? (changes what Tier 2/3 are worth)
2. WhatsApp provider: Twilio sandbox vs Meta Cloud API vs an unofficial library — and does the sandbox require every tester to join first?
3. Where will each service be hosted (Vercel for web; Render/Railway/ngrok for bot) and who owns secrets?
4. Is Supabase confirmed for the database, or is Teammate A planning plain Postgres/other?
5. Is the follow-up scheduler needed live (cron), or is a manual "Trigger" button + demo clock enough?
6. Language: is Hindi/English toggle valuable for the judges or noise?
7. How will the employer receive the link in the demo — WhatsApp message to employer phone, or copy-link in dashboard?
8. What is the submission format (repo link, video, deck, live URL) and the cut-off time on the 23rd?
9. What is the single sentence that shows this is more than a dashboard?
10. Which Tier 1/2 feature would impress judges most per hour of effort?
