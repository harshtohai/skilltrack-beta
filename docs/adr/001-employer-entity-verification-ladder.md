# ADR 001: Employer Entity with Verification Ladder (Job Board)

**Status**: Accepted
**Date**: 2026-09-29

## Context

Spec #23 (Analytics Board) recorded: "Employer identity: group by normalized employer name (trimmed/uppercased); no Employer model (approved Option A)." This worked for historical self-reported claims from trainees, but is insufficient for the Job Board (F25) where employers must:
- Post jobs directly (requires login identity)
- Confirm hires (requires verified identity for evidence level 3)
- Be accountable for retention (requires stable, trackable entity)

## Decision

Introduce a first-class `Employers` entity with a verification ladder:

- **Identity**: `id` (uuid), `company_name`, `contact_email` (unique, login identity), `sector`, `district`, `registration_no` (GSTIN/CIN for verification), `verification_status`
- **Verification Status**: `PENDING` → `VERIFIED` | `REJECTED`; `SUSPENDED` for repeat offenders (chronically low retention)
- **Rule**: Only `VERIFIED` employers can post jobs
- **Signup**: Unlisted page (`/employer/register`), never linked from landing/login/signup — direct URL only
- **Session resolution**: Employer login resolves to the `Employers` row by session email

This supersedes the name-normalization approach for the Job Board. Historical claims continue to use name normalization; new employer-verified hires attach to the `Employers` entity.

## Consequences

- **Positive**: Verified hires feed outcomes pipeline at evidence level 3 (`EMPLOYER_CONFIRMED`); per-employer retention computed via existing `computeEmployerRetention`; repeat offenders can be suspended; trust transparency on trainee job cards.
- **Negative**: New schema models; admin verification queue required; PENDING recruiters can log in but not post.
- **Migration**: Seed demo employer ("TechCorp", `hr@company.com`) as `VERIFIED` so the existing demo login works end-to-end.