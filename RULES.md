# Project Rules & Conventions

> Keep the codebase consistent, discoverable, and easy to review.

## Structure
- Keep all interfaces in `src/common/interfaces`;
- Keep all utilities in `src/common/utils`;
- Keep enums in `src/common/enums` and reuse them instead of freeform strings.
- Keep DTOs in `src/dtos/`. request/response DTOs live in `src/dtos/request` or `src/dtos/response`.
- New modules follow Nest defaults: `module`, `controller`, `service`, `dto`, `entities` (if unique), and optional `guards/interceptors` per feature.

## Naming & API shape
- Controllers use plural, resource-focused paths (e.g., `/fields`, `/planting-seasons`, `/financial-records`).
- Methods are verb-first inside services (`createX`, `updateX`, `deleteX`, `getX`).
- Keep DTO property names aligned with entity fields where applicable; prefer explicit booleans over truthy values.
- Use ISO 8601 strings for dates in DTOs and responses.

## Validation & Error handling
- Every request DTO must include class-validator decorators; never accept unvalidated input.
- Prefer enums for constrained values (activity types, record types, severities, etc.).
- Keep error responses standardized via the global exception filter; avoid throwing raw errors.
- Validate ownership/authorization via `FieldAccessService` (or equivalent) before mutating data.

## Persistence & Entities
- Use migrations for schema changes; do not rely on sync in production.
- Add indexes for frequently queried fields and composite lookups.
- Keep entity relations bidirectional where helpful, and set `onDelete` behavior explicitly.

## Observability & Logging
- Use the global logging interceptor for request/response visibility; add contextual `Logger` instances in complex services.
- Avoid logging secrets or tokens; redact sensitive values in errors.

## Configuration
- All config lives in `src/config` and must be validated in `env.validation.ts`.
- Default to environment variables, with sane fallbacks only for local development.

## Testing & Quality
- Unit tests for services and utilities; integration/e2e for controllers and flows.
- Run `pnpm lint` and relevant tests before merging; keep lint config in-sync with project patterns.
- Seed scripts must use public API endpoints and valid DTO shapes to stay close to real usage.

## Git & Reviews
- Keep commits scoped and descriptive; avoid mixing refactors with feature changes.
- Update docs (README/TODO/RULES) when workflows or conventions change.
