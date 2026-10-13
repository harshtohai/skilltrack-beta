# ADR 002: Two-Source Certificate Model (Self-Reported vs Issued)

**Status**: Superseded by ADR-003 (provenance-only; the review workflow was removed by owner decision, Oct 13 — issue #111)
**Date**: 2026-10-13

## Context

Certificates existed as seed-only rows (`prisma/seed.ts`, `backfill-centers.ts`) — no API route and no UI in any role could create one. The trainee portal showed a permanent "coming soon"-grade empty state, and the landing page promised "Upload certificates securely" (unbuilt). Grilling (Oct 13, Q1–Q14) established two distinct entry paths: trainees upload certificates they already hold; institutes issue programme certificates. Treating these as one undifferentiated row loses the trust distinction the platform is built on.

## Decision

One `Certificate` table, two sources, three statuses:

- **Source** (`certificate_source`): `SELF_REPORTED` (trainee-uploaded, proof = attached file, PDF/JPG/PNG ≤ 1 MB, private Supabase Storage bucket, short-lived signed links) | `ISSUED` (institute-created, tied to the trainee's Enrolment, optional file).
- **Status** (`certificate_status`): `SELF_REPORTED` is born `PENDING`; the trainee's institute (admin as unscoped oversight) reviews to `VERIFIED` | `REJECTED` (+ reason). `ISSUED` is born `VERIFIED` — the issuer is the authority.
- **Issuance effect**: issuing completion certificates to a cohort IS the act of certification — sets the Enrolment's `certification_date` (defaults to the cert's issue date), flips `ACTIVE → COMPLETED`, writes audit events, idempotent (already-certified trainees skipped).
- **Trainee lifecycle**: sees own certificates immediately, whatever the status (pending badge, rejected badge + reason). May edit/delete while `PENDING`, delete-and-reupload while `REJECTED`; `VERIFIED`/`ISSUED` are immutable to the trainee (junk removal is an admin/institute audit-logged action).

Rejected alternatives: two separate tables (duplicates display + review logic); self-reported shown with no review at all (junk lands on a government-facing portal); issuance with no enrolment side-effects (certification date drifts from reality, institutes must do two manual steps).

## Consequences

- **Positive**: the trainee certificate surface becomes fillable by its two real owners; the trust ladder stays honest (a pending badge is honest, a fake VERIFIED is not); cohort certification becomes one action; employment/outcome metrics keep a single source of truth for certification date.
- **Negative**: new schema fields + enums + storage bucket; a review workflow exists for institute/admin; file handling introduces a storage dependency (env-gated: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, uploads report "not configured" until set).
- **Migration**: the ~359 seeded demo certificates backfill to `source=ISSUED, status=VERIFIED` (the seed acted as the institute).
