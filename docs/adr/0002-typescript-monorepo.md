# ADR-0002: TypeScript monorepo with pnpm and Turborepo

- Status: Accepted
- Date: 2026-11-07

## Context

We need a web app now, a mobile app later, an API and shared domain rules (pricing, booking states, validation). The team is small; context switching between languages slows it down. Pricing and cancellation rules must produce identical results in the quote the renter sees and in the refund the API computes.

## Decision

- TypeScript everywhere: Next.js (web), NestJS (API), Expo later (mobile).
- One repository with pnpm workspaces and Turborepo for task orchestration and caching.
- Shared domain code in `packages/shared` (zod schemas, enums, state machine, pricing, money). It has no framework dependencies so it runs in the browser, React Native and Node.
- NestJS for the API because its module system matches the modular monolith ([ADR-0003](0003-modular-monolith.md)), it has first-class OpenAPI, DI and testing support, and it is widely known.

Alternatives considered: Django/DRF (strong admin, but two languages and duplicated rules), .NET (strong typing, smaller hiring pool locally for full-stack), Laravel (fast CRUD, same duplication issue).

## Consequences

- One CI pipeline, atomic cross-app changes, shared types between API and clients.
- Need discipline on package boundaries; Turborepo caching keeps CI fast as the repo grows.
- CPU-heavy work (image processing, recommendations) may later move to a separate service in another language if needed.
