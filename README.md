# inBetween

**Rent anything, from a needle to a rocket.**

inBetween is an online rental marketplace where individuals and businesses list things they own and other people rent them by the hour, day, week or month. The platform handles discovery, booking, escrowed payments, security deposits, handover checks, reviews and disputes, so both sides can trust a stranger with their stuff.

Launch market: **Egypt** (EGP, Arabic + English), then the wider MENA region.

## Status

Foundation phase (milestone **M0**). The architecture, domain model and a runnable monorepo skeleton are in place; product features are tracked as GitHub issues per milestone. See the [roadmap](docs/product/roadmap.md).

## Tech stack

| Layer | Choice |
| --- | --- |
| Web app | Next.js 16 (App Router, React 19), Tailwind CSS 4, next-intl (Arabic RTL + English) |
| API | NestJS 11 (modular monolith), REST + OpenAPI |
| Database | PostgreSQL 17 + PostGIS, Prisma ORM |
| Cache / queues | Redis (BullMQ for background jobs) |
| Object storage | S3-compatible (SeaweedFS locally, S3/R2 in production) |
| Payments | Paymob (cards, wallets, Fawry/kiosk, InstaPay), behind a provider interface |
| Tooling | pnpm workspaces, Turborepo, TypeScript 5.9, ESLint, Prettier, Vitest/Jest, GitHub Actions |

Why each choice was made is recorded in [Architecture Decision Records](docs/adr/).

## Repository layout

```
apps/
  api/          NestJS API (modular monolith) + Prisma schema
  web/          Next.js web app (ar/en, RTL)
packages/
  shared/       Domain types, zod schemas, booking state machine, pricing, money
docs/
  product/      Vision, MVP scope, roadmap
  architecture/ System overview, domain model, booking, payments, trust & safety, security, deployment
  adr/          Architecture Decision Records
  development/  Getting started, conventions
infra/          Local infrastructure helpers
```

## Quick start

Prerequisites: Node.js 24 (see `.nvmrc`), pnpm 10 (`corepack enable`), Docker.

```bash
cp .env.example .env
docker compose up -d          # Postgres+PostGIS, Redis, S3 (SeaweedFS), Mailpit
pnpm install
pnpm db:migrate               # apply Prisma migrations
pnpm db:seed                  # seed the category tree
pnpm dev                      # api on :4000, web on :3000
```

- Web: http://localhost:3000 (redirects to `/ar`)
- API docs (Swagger): http://localhost:4000/docs
- Health: http://localhost:4000/api/health
- Mailpit (dev inbox): http://localhost:8025

Full setup notes: [docs/development/getting-started.md](docs/development/getting-started.md).

## Documentation

- Product: [vision](docs/product/vision.md) · [MVP scope](docs/product/mvp-scope.md) · [roadmap](docs/product/roadmap.md)
- Architecture: [overview](docs/architecture/overview.md) · [domain model](docs/architecture/domain-model.md) · [booking lifecycle](docs/architecture/booking-lifecycle.md) · [payments & escrow](docs/architecture/payments-and-escrow.md) · [trust & safety](docs/architecture/trust-and-safety.md) · [security](docs/architecture/security.md) · [deployment](docs/architecture/deployment.md)
- Decisions: [ADR index](docs/adr/README.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

## License

No license has been chosen yet. Until one is added, all rights are reserved by the authors.
