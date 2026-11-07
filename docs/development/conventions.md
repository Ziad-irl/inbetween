# Engineering conventions

## Git

- Trunk-based: short-lived branches off `main`, merged by squash after review and green CI.
- Branch names: `feat/<issue>-<slug>`, `fix/...`, `chore/...`, `docs/...`.
- [Conventional Commits](https://www.conventionalcommits.org/) with a scope: `feat(booking): ...`, `fix(web): ...`. Scopes: `api`, `web`, `shared`, `db`, `infra`, `ci`, `docs`, or a module name.
- `main` is protected: PR required, CI must pass, no force pushes.

## Code

- TypeScript strict mode everywhere, including `noUncheckedIndexedAccess`.
- Domain rules (pricing, states, policies) live in `packages/shared` as pure functions with unit tests.
- API modules follow `controller → service → Prisma`. Controllers only validate and delegate.
- Validation with zod schemas from `@inbetween/shared` via `ZodValidationPipe`.
- Errors: throw Nest HTTP exceptions with `{ code, message }`. `code` is UPPER_SNAKE and stable; clients depend on it.
- No `any` without a comment explaining why.
- Files: `kebab-case.ts`; classes `PascalCase`; React components `PascalCase` exported from `kebab-case.tsx`.

## API design

- REST, plural nouns, versioned under `/api/v1`.
- JSON fields `camelCase`; money as strings of minor units with a `currency` field; timestamps ISO 8601 UTC.
- Pagination: `page` + `pageSize` now; cursor-based for feeds later.
- Money-moving `POST`s require an `Idempotency-Key` header.
- Every endpoint documented in OpenAPI (Swagger decorators).

## Testing

| Level | Tool | Where |
| --- | --- | --- |
| Unit (domain) | Vitest | `packages/shared/src/**/*.test.ts` |
| Unit / integration (API) | Jest + Nest testing module | `apps/api/src/**/*.spec.ts` |
| E2E API against Postgres | Jest + Testcontainers (M1) | `apps/api/test/` |
| Web E2E | Playwright (M1), run in both `ar` and `en` | `apps/web/e2e/` |

Every bug fix comes with a test that fails without the fix.

## Definition of done

- Acceptance criteria met, tests pass, CI green
- Works in Arabic (RTL) and English, on mobile width
- Docs or ADR updated if behaviour or architecture changed
- Observability: meaningful logs and error codes for new failure paths
