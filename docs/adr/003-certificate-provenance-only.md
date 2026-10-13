# ADR 003: Provenance-Only Certificates (Review Model Removed)

**Status**: Accepted — supersedes ADR-002
**Date**: 2026-10-13

## Context

ADR-002 gave SELF_REPORTED certificates a born-PENDING state reviewed by the institute (admin oversight), mirroring the employer verification ladder. The product owner's call (issue #111): *"remove the verification part — as in most of the places, certificates are not validated by hand."* In the deployment reality (PMKVY-style skilling centres), nobody hand-validates uploaded certificates; a review workflow that never runs would leave every trainee upload stuck at PENDING and add review toil for institutes. The two-source distinction stays — provenance is the signal, not a curation gate.

## Decision

- **No review workflow.** SELF_REPORTED certificates are born VERIFIED and live immediately, exactly like ISSUED ones. The `status` column survives as a constant VERIFIED (schema stability; no destructive migration) and `reviewCertificate`/the review route are deleted.
- **Provenance is the label.** Every surface shows `Institute-issued` vs `Self-reported` — who stands behind the certificate, not an endorsement claim.
- **Trainee lifecycle collapses to provenance**: owner may edit/delete SELF_REPORTED certificates any time; ISSUED certificates are the institute's record and stay immutable.
- **Employer visibility (issue #111)**: the applicants payload carries all certificates with provenance labels, and employers may open the proof file — scoped to trainees who applied to their own jobs (admin may peek). This extends file access to a fourth party beyond spec #102 US 24, by owner decision.

## Consequences

- **Positive**: matches operational reality (no unreviewed backlog); the employer hiring surface sees everything with honest provenance; institutes lose review toil; the trust story shifts to what the platform actually verifies — employment outcomes via the evidence ladder — not certificate curation.
- **Negative**: low-quality or false self-reported certificates render next to issued ones; the differentiator is only the provenance label. If abuse appears, the review model can be reinstated from ADR-002 (schema fields retained).
- **Migration**: rows from the brief review era backfilled to VERIFIED with rejection reasons cleared (`scripts/backfill-certificate-verified.ts`).
