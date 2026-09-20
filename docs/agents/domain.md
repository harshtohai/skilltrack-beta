# Domain Docs: Single-Context

Layout:
- `CONTEXT.md` — root domain model (terminology, concepts, invariants)
- `docs/adr/` — Architecture Decision Records

Consumer rules:
- Agents read `CONTEXT.md` first for shared vocabulary
- ADRs are append-only; never edit past decisions
- Use `domain-modeling` skill to update `CONTEXT.md`