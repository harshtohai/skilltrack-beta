# OutcomeTrack — Domain Model

## Implementation State (as of Sep 2026)
- **Bot integration**: Kapso (WhatsApp Business API via `https://api.kapso.ai/meta/whatsapp/v24.0`), NOT the standalone bot service. No `BOT_BASE_URL`. Inbound webhook at `/api/webhook` (GET verify + HMAC POST), zod-validated payload.
- **Conversation flow** (`src/lib/bot/conversation.ts`): consent-first, in-memory Map store (dev/demo simplicity). Steps: `WELCOME` → `CONSENT` → `IDENTITY_VERIFY` → `EMPLOYMENT_STATUS` → `EMPLOYER_DETAILS` → `ROLE_DETAILS` → `SALARY_RANGE` → `JOB_SATISFACTION` → `TRAINING_RELEVANCE` → `SKILL_GAPS` → `ADDITIONAL_TRAINING` → `CAREER_GOALS` → `CHALLENGES` → `RECOMMENDATIONS` → `COMPLETE`. `startConversation(phone, name)` fires post-login (trainee magic-link verify).
- **Consent**: `Trainee.consentGiven` + `consentGivenAt` + `consentMethod` (`WHATSAPP` | `SEED`); recorded by the WhatsApp consent handler (source of truth). Magic-link no longer 403s without consent.
- **DB access**: pure Prisma ORM (`src/server/db.ts`, single client, pooled `DATABASE_URL` 6543). No raw SQL, no `db-direct.ts`. `DIRECT_URL` (pooler :5432) unreachable from Node — do not use.
- **API routes**: only 20 remain; unused ones deleted (data-quality, email, export, insights, kpis/retention, kpis/wage-progression, sidh, trainees/import, trainees/[public_id]). List endpoints paginated (`page`/`limit`). Analytics routes no longer gate on `X-API-Key` (frontend never sent it; middleware protects `/admin` by session role).
- **Analytics** (`src/server/analytics.ts`): shared `getMonthlyOutcomes()` — 3 flat Prisma queries + in-memory monthly aggregation, `limit` param (max 60 months).
- **Timeline**: per-trainee timeline on `/trainees/[public_id]`; dashboard Recent Activity timeline fed by `recentActivity` in `kpis/overview`.
- **Auth**: admin `admin@maharashtra.gov.in`/`admin123` (env-overridable), trainee magic-link, employer login via verificationRequest match.
- **Seeded** (confirmed): trainees 501, cohorts 15, programmes 5, enrolments 500, followups 1000, outcomes 155. Test user `+0000000000` (Test User, consent given).
- **Path alias**: `~/*` → `./src/*` only (NOT `@/*`).
- **Pending**: endpoint loop-testing after refactor; external WhatsApp testing needs ngrok/production URL.

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
- **snake_case everywhere**: DB columns = API JSON fields = CSV headers. No camelCase.
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
- **Tier 1 (Important)**: F09–F12 — Retention, conflicts, audit, operations
- **Tier 2 (Optional)**: F13–F19 — Consent, adaptive flows, i18n, demo clock, export
- **Tier 3 (Stretch)**: F20–F24 — LLM insights, SIDH adapter, deduplication, employer edit, email

## Non-Goals (Hackathon)
- Not a replacement for SIDH/NCS/LMS/HRMS
- Not a job portal
- No scraping, no real PII, no LLM decisions
- No multi-tenant / gov admin dashboard
- No phone encryption at rest (mask in UI only)
- No email channel (WhatsApp only)