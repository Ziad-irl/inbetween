# API modules

Each folder is a bounded context (see [architecture overview](../../../../docs/architecture/overview.md#api-modules-bounded-contexts)). Modules talk to each other only through exported services or outbox events.

| Module | Status |
| --- | --- |
| `health` | Done: liveness and readiness |
| `catalog` | Started: category tree, listing search, listing details |
| `booking` | Started: price quotes using `@inbetween/shared` |
| `identity` | M1: phone OTP, email/password, sessions |
| `organizations` | M1: business accounts and members |
| `search` | M1: Postgres FTS + PostGIS + availability |
| `payments` | M2: Paymob provider, ledger, deposits, payouts |
| `messaging` | M2 |
| `notifications` | M2: outbox dispatcher, email/SMS/in-app |
| `trust` | M3: KYC, reviews, disputes, reports |
| `admin` | M3: ops console endpoints |
