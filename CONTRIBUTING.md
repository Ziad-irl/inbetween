# Contributing to inBetween

## Workflow

1. Pick an issue from the current milestone and assign yourself.
2. Branch from `main`: `feat/<issue-number>-short-name`, `fix/...`, `docs/...`, `chore/...`.
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat(booking): add owner approval endpoint`.
4. Open a pull request using the template. CI (lint, typecheck, test, build) must pass.
5. At least one approving review before merging. Squash-merge; the PR title becomes the commit message.

## Ground rules

- Architecture changes need an ADR in `docs/adr/` (copy `template.md`).
- Money is always an integer number of minor units (`bigint`, piastres for EGP). Never use floats for money.
- Every user-facing string goes through i18n (`apps/web/messages/{ar,en}.json`). Check the page in Arabic (RTL) before opening a PR.
- Database changes go through Prisma migrations; never edit an applied migration.
- Booking status changes go through the shared state machine (`packages/shared/src/booking`), never a raw `UPDATE`.
- Don't log personal data (national IDs, phone numbers, card data, addresses).

More detail: [docs/development/conventions.md](docs/development/conventions.md).
