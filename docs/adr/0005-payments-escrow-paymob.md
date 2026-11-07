# ADR-0005: Escrow payments with Paymob behind a provider interface

- Status: Accepted
- Date: 2026-11-07

## Context

Renters and owners are strangers. Owners fear not being paid and damage; renters fear paying for something that never shows up. In Egypt, many users pay with mobile wallets, kiosks (Fawry) or InstaPay, not only cards. Stripe is not available for Egyptian merchants.

## Decision

- inBetween collects the full payment, keeps it in escrow (tracked in our double-entry ledger), and releases the owner's share after the handover. Deposits are pre-authorized on cards for short rentals, otherwise captured and refunded.
- Paymob is the first provider: it covers cards, Meeza, wallets, kiosks and InstaPay, with hosted checkout (keeps us in PCI SAQ-A scope).
- All provider calls go through a `PaymentProvider` interface so we can add Fawry, Kashier, or Gulf providers (Tap, Checkout.com) for MENA expansion.

## Consequences

- Strong protection for both sides; a clear basis for disputes.
- We carry regulatory and reconciliation responsibilities; legal review of the fund-holding model with Paymob is required before going live (see [payments and escrow](../architecture/payments-and-escrow.md#compliance-open-items-before-handling-real-money)).
- Manual payouts in the MVP mean ops workload; automation is planned after beta.
