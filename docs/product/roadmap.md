# Roadmap

Each milestone below is a GitHub milestone, and its items are GitHub issues. The durations are rough estimates for a team of 3–4 engineers.

## M0 – Foundation (weeks 1–2)

Goal: anyone can clone the repo and run the whole stack locally; CI is green.

- Monorepo, tooling, CI, Docker Compose *(done in the initial commits)*
- Architecture docs and ADRs *(done)*
- Prisma schema v1 and first migration, with exclusion constraint for availability
- API foundation: config validation, logging, error format, OpenAPI, health checks
- Web foundation: i18n with RTL, design tokens, layout shell
- Staging environment and deploy pipeline
- Error tracking (Sentry) and uptime monitoring

## M1 – Identity & Catalog (weeks 3–6)

Goal: users can sign up and publish listings that others can find.

- Phone OTP and email/password auth, sessions with rotating refresh tokens
- Profiles and business organizations with members
- Category tree with attributes and risk tiers (seeded, admin-editable)
- Listing CRUD, photo upload (presigned S3 URLs, image processing)
- Availability calendar and owner blocks
- Search: Postgres full-text (Arabic + English) + PostGIS radius + availability filter
- Listing page and search results page

## M2 – Booking & Payments (weeks 7–11)

Goal: a renter can book, pay, receive the item and return it; the owner gets paid.

- Price quote engine (shared package)
- Booking state machine, request/instant book, expiry jobs
- Paymob integration (payment intent, webhook, refunds), behind a `PaymentProvider` interface
- Double-entry ledger for escrow, fees and payouts
- Deposits: pre-auth and capture-and-refund flows
- Handover inspections (check-out/check-in with photos)
- Cancellations and refunds per policy
- Messaging
- Email/SMS/in-app notifications via outbox + BullMQ

## M3 – Trust & Safety + Ops (weeks 12–14)

Goal: the platform can be operated safely with real money.

- National ID KYC with a provider (selfie + ID check)
- Reviews (two-way, blind until both submitted)
- Disputes and deposit claims
- Admin console: moderation queues, users, bookings, disputes, payouts, reports
- Payout batches and reconciliation against Paymob settlements
- Rate limiting, fraud rules (velocity, new-account limits for HIGH tier)

## M4 – Private beta, Cairo (weeks 15–18)

- Seed supply: onboard 20–50 rental businesses plus individual owners
- Analytics (product events), funnels
- Performance and security review, pen test
- Legal: terms of service, privacy policy, rental agreement templates, payment flow sign-off with Paymob and counsel
- Beta launch, then fixes from feedback

## M5 – Growth (after beta)

- Expo mobile app (iOS/Android)
- Business tools: bulk import, inventory, analytics, subscriptions
- Damage protection add-on with an insurance partner
- Delivery partners
- Expansion to Alexandria, then the Gulf (multi-currency, new payment providers)
