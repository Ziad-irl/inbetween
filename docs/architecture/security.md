# Security and privacy

## Authentication

- Phone OTP (6 digits, 5-minute expiry, max 5 attempts, rate-limited per phone and IP) or email + password.
- Passwords hashed with Argon2id.
- Short-lived access token (JWT, 15 min, `sub`, `roles`, `sid`) and a rotating refresh token (opaque, hashed in `Session`, 30 days). Reusing a rotated refresh token revokes the whole session family.
- Web: tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies; CSRF protection on cookie-authenticated mutations. Mobile later: tokens in secure storage, sent as a bearer header.
- Optional TOTP 2FA for business owners and required for ops staff.

## Authorization

- Platform roles: `USER`, `SUPPORT`, `ADMIN`.
- Organization roles: `OWNER`, `MANAGER`, `STAFF`, checked per request against the listing's `ownerOrgId`.
- Resource ownership checks live in each module's service layer; controllers declare intent with guards and decorators (`@Roles`, `@OrgRole`).
- Ops actions are always written to `AuditLog`.

## Application security

- Input validation with zod on every endpoint; unknown fields rejected
- Prisma parameterized queries; raw SQL only through tagged templates
- `helmet` headers, strict CORS allow-list, CSP on the web app
- Rate limiting (Redis) on auth, search and messaging
- Webhooks: HMAC verification, replay protection by event ID, raw body preserved
- Uploads: presigned URLs restricted by content type and size; images re-encoded server-side (strips EXIF GPS data); KYC docs in a private bucket with short-lived signed reads
- Secrets in the cloud secret manager; never in the repo. `gitleaks` in CI.
- Dependency scanning (Dependabot) and SAST (CodeQL)

## Privacy (Egypt PDPL, Law 151 of 2020)

- Collect only what each feature needs; national ID images are kept only as long as the KYC provider and law require, then deleted.
- Consent captured at signup for terms and privacy policy, with versions stored.
- Users can export and delete their data; bookings and the ledger are retained for legal and tax periods, but PII is anonymized.
- PII fields are redacted from logs by the pino redaction config.
- Data processing agreements with every sub-processor (Paymob, SMS, KYC, hosting).
- Register with the Personal Data Protection Center and appoint a data protection officer as the law requires.

## Threats specific to rentals

| Threat | Mitigation |
| --- | --- |
| Renter steals the item | ID verification by tier, deposits, check-out photos, police report support, insurance later |
| Owner fakes damage | Check-out/check-in photos signed by both, dispute review |
| Off-platform payment scams | Message scanning, warnings, deposit protection only on-platform |
| Fake listings to collect payments | Escrow (owner paid after handover), new-owner limits, moderation |
| Account takeover | OTP rate limits, session family revocation, new-device alerts, payout method change cooldown (72h) |
