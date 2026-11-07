# @inbetween/shared

Framework-free domain code used by the API, the web app and the future mobile app:

- `enums.ts`: client-facing enums and risk-tier rules
- `money.ts`: bigint money helpers, half-even rounding, formatting
- `schemas.ts`: zod schemas for requests shared by forms and API validation
- `booking/state-machine.ts`: allowed booking transitions and who may trigger them
- `booking/pricing.ts`: cheapest unit-price combination and full quotes
- `booking/cancellation.ts`: refunds per cancellation policy

Rules: no framework imports, no I/O, pure functions, every rule covered by a unit test (`pnpm --filter @inbetween/shared test`).
