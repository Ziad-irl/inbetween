# ADR-0003: Modular monolith for the API

- Status: Accepted
- Date: 2026-11-07

## Context

Bookings, payments, availability and the ledger must change together atomically. Microservices would force distributed transactions or sagas on day one, plus separate deployments, observability and on-call for a team of 3–4.

## Decision

One NestJS application, split into modules by bounded context (identity, organizations, catalog, search, booking, payments, trust, messaging, notifications, admin, platform). Rules:

- Modules expose a public service; other modules may not import their internals or query their tables.
- Cross-module side effects go through domain events stored in a transactional outbox and dispatched by a worker process (same codebase, different entrypoint).
- Boundaries are enforced by lint rules in CI.

## Consequences

- Simple deployment and local development; ACID transactions where money is involved.
- A module can later be extracted into a service by replacing in-process calls with HTTP/queue calls, because communication already goes through narrow interfaces and events.
- Risk: boundaries erode under deadline pressure. Mitigated by lint enforcement and code review.
