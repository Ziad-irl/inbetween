# ADR-0008: Money as bigint minor units

- Status: Accepted
- Date: 2026-11-07

## Context

Floating-point money causes rounding errors. 32-bit integers in piastres cap at about 21.4 million EGP, which high-value rentals (vehicles, heavy machinery, "the rocket") can exceed in a single booking or deposit.

## Decision

- Store money as `BIGINT` minor units with a `currency` column (`EGP` now; ISO-4217).
- In TypeScript, use `bigint` in the domain (`packages/shared/src/money.ts`). In JSON, send amounts as strings (`"amountMinor": "99000"`) to avoid precision loss in JavaScript clients.
- Percentages are basis points (`1000` = 10%), integer math with explicit rounding (half-even) at one place.

## Consequences

- Correct arithmetic at any scale; explicit serialization step required at the API boundary.
- Multi-currency later needs per-currency minor unit exponents (already part of the money helper).
