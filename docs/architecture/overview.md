# Architecture overview

## Guiding principles

1. **Modular monolith first.** One deployable API with strict module boundaries. Split a module into a service only when scaling or team ownership requires it ([ADR-0003](../adr/0003-modular-monolith.md)).
2. **Money and bookings are correct before they are fast.** Database constraints, a double-entry ledger, idempotent webhooks and a single state machine.
3. **One language end to end.** TypeScript across web, API and shared domain code ([ADR-0002](../adr/0002-typescript-monorepo.md)).
4. **Arabic first.** RTL and Arabic search are part of the core design ([ADR-0006](../adr/0006-i18n-rtl.md)).
5. **Providers behind interfaces.** Payments, SMS, KYC, storage and search can be swapped without touching domain code.

## System context (C4 level 1)

```mermaid
flowchart LR
    renter([Renter])
    owner([Owner: individual or business])
    ops([inBetween ops])

    subgraph inBetween
      platform[inBetween platform]
    end

    paymob[(Paymob<br/>cards, wallets, Fawry, InstaPay)]
    sms[(SMS provider<br/>OTP and alerts)]
    email[(Email provider)]
    kyc[(KYC provider<br/>ID + selfie)]
    maps[(Maps / geocoding)]

    renter --> platform
    owner --> platform
    ops --> platform
    platform --> paymob
    paymob -- webhooks --> platform
    platform --> sms
    platform --> email
    platform --> kyc
    kyc -- webhooks --> platform
    platform --> maps
```

## Containers (C4 level 2)

```mermaid
flowchart TB
    browser[Browser / future Expo app]

    subgraph edge[Edge]
      cdn[CDN + WAF]
    end

    subgraph app[Application]
      web[Web app<br/>Next.js 16, SSR + RSC]
      api[API<br/>NestJS modular monolith]
      worker[Worker<br/>same codebase, BullMQ consumers]
    end

    subgraph data[Data]
      pg[(PostgreSQL 17 + PostGIS)]
      redis[(Redis<br/>cache, rate limits, queues)]
      s3[(Object storage<br/>listing photos, inspection photos, KYC docs)]
    end

    browser --> cdn --> web
    cdn --> api
    web -- server-side fetch --> api
    api --> pg
    api --> redis
    api -- presigned URLs --> s3
    browser -- direct upload --> s3
    worker --> pg
    worker --> redis
    worker --> s3
```

- **Web** renders pages on the server for SEO (listing and search pages must be indexable) and calls the API. It holds no business logic.
- **API** exposes versioned REST endpoints (`/api/v1/...`) documented with OpenAPI. The same image runs as **worker** with a different entrypoint to process queues (notifications, booking expiry, payout batches, image processing, outbox publishing).
- **Postgres** is the system of record, including the ledger. PostGIS handles location search.
- **Redis** handles caching, rate limiting, OTP throttling and BullMQ queues.
- **Object storage**: clients upload directly with presigned URLs. KYC documents go to a separate private bucket with stricter access.

## API modules (bounded contexts)

| Module | Owns | Key tables |
| --- | --- | --- |
| `identity` | Users, auth, sessions, OTP, roles | `User`, `Session` |
| `organizations` | Business accounts and members | `Organization`, `OrganizationMember` |
| `catalog` | Categories, listings, media, pricing, availability | `Category`, `Listing`, `ListingPrice`, `ListingMedia`, `AvailabilityBlock`, `Location` |
| `search` | Search queries and ranking (reads catalog) | Postgres FTS indexes / later a search engine |
| `booking` | Quotes, bookings, state machine, inspections | `Booking`, `BookingStatusEvent`, `HandoverInspection` |
| `payments` | Payment provider integration, ledger, deposits, payouts, refunds | `Payment`, `LedgerTransaction`, `LedgerEntry`, `LedgerAccount`, `Payout` |
| `trust` | KYC, reviews, disputes, reports, fraud rules | `KycVerification`, `Review`, `Dispute`, `Report` |
| `messaging` | Conversations and messages | `Conversation`, `Message` |
| `notifications` | Email, SMS, in-app delivery and preferences | `Notification` |
| `admin` | Ops endpoints (moderation, support) | uses the others' public services |
| `platform` | Config, outbox, audit log, health | `OutboxEvent`, `AuditLog` |

**Boundary rules**

- A module talks to another only through that module's exported service (never its repository or tables directly).
- Cross-module side effects (for example "booking confirmed → notify owner, block calendar, post ledger entries") go through domain events written to the **transactional outbox** in the same database transaction, then dispatched by the worker. This keeps the monolith ready to split later.
- Lint rules (`eslint-plugin-boundaries` or dependency-cruiser) will enforce this in M0.

## Request flow example: booking a camera

```mermaid
sequenceDiagram
    participant R as Renter (web)
    participant A as API
    participant DB as Postgres
    participant P as Paymob
    participant W as Worker

    R->>A: POST /v1/bookings/quote {listingId, dates}
    A->>DB: load listing, prices, availability
    A-->>R: quote (rental, fees, deposit, total)
    R->>A: POST /v1/bookings {quoteId}  (Idempotency-Key)
    A->>DB: tx: insert booking (REQUESTED or ACCEPTED), availability hold, outbox event
    A-->>R: booking
    Note over A: owner accepts (if request-to-book)
    R->>A: POST /v1/bookings/{id}/payment
    A->>P: create payment intention
    A-->>R: hosted checkout URL
    R->>P: pays
    P->>A: webhook (HMAC verified, idempotent)
    A->>DB: tx: payment SUCCEEDED, ledger entries, booking CONFIRMED, outbox event
    W->>DB: poll outbox
    W-->>R: email/SMS "booking confirmed" to both sides
```

## Cross-cutting concerns

| Concern | Approach |
| --- | --- |
| Validation | zod schemas in `packages/shared`, used by both web forms and API pipes |
| Errors | RFC 9457 problem+json responses with stable `code` values |
| Idempotency | `Idempotency-Key` header on all money-moving POSTs, stored in Redis/Postgres |
| Time | All timestamps in UTC (`timestamptz`); display in `Africa/Cairo` |
| Money | `bigint` minor units + ISO currency, see [payments](payments-and-escrow.md) |
| Logging | Structured JSON (pino) with request IDs; PII redaction |
| Observability | OpenTelemetry traces and metrics, Sentry for errors |
| Feature flags | Config table + env overrides in the MVP; a flag service later |
| Background jobs | BullMQ on Redis, at-least-once delivery, idempotent handlers |

## Related documents

- [Domain model](domain-model.md)
- [Booking lifecycle](booking-lifecycle.md)
- [Payments and escrow](payments-and-escrow.md)
- [Trust and safety](trust-and-safety.md)
- [Security](security.md)
- [Deployment](deployment.md)
