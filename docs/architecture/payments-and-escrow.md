# Payments and escrow

## Principles

- **Money is integers.** `bigint` minor units with an ISO-4217 currency. Rounding happens once, in the shared pricing code, using banker's rounding.
- **No card data touches our servers.** Paymob hosted checkout / Unified Checkout keeps us in PCI DSS SAQ-A scope.
- **Every movement is a balanced ledger transaction.** Balances are derived, never stored as mutable columns.
- **Webhooks are the source of truth** for payment status, verified by HMAC and processed idempotently. Redirect callbacks are only for UX.

## Provider abstraction

```ts
interface PaymentProvider {
  createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntent>; // returns hosted checkout URL
  authorizeHold(input: HoldInput): Promise<PaymentIntent>;               // deposit pre-auth (cards only)
  capture(providerRef: string, amountMinor: bigint): Promise<void>;
  void(providerRef: string): Promise<void>;
  refund(providerRef: string, amountMinor: bigint): Promise<void>;
  parseWebhook(headers: Headers, rawBody: string): VerifiedWebhookEvent;  // throws if HMAC invalid
}
```

`PaymobProvider` is the first implementation ([ADR-0005](../adr/0005-payments-escrow-paymob.md)). Payment methods: cards (Visa/Mastercard/Meeza), mobile wallets (Vodafone Cash, etc.), Fawry/Aman kiosks, InstaPay where supported, and Valu (BNPL) later.

## Ledger accounts

| Account | Type | Purpose |
| --- | --- | --- |
| `psp_clearing` | asset | Money at Paymob not yet settled to our bank |
| `bank` | asset | Our operating bank account |
| `escrow` | liability | Renter money we hold until release |
| `deposits_held` | liability | Captured deposits we hold for longer rentals |
| `owner_payable:{ownerId}` | liability | Released money owed to an owner |
| `platform_revenue` | revenue | Renter service fee + owner commission |
| `refunds_payable:{userId}` | liability | Refunds due but not yet executed |
| `psp_fees` | expense | Paymob processing fees |

## Flow: a 3-day camera rental

Rental 3 × 300 EGP = 900 EGP. Renter fee 10% = 90 EGP. Owner commission 10% = 90 EGP. Deposit 2,000 EGP (card pre-auth).

| Event | Ledger entries (EGP) |
| --- | --- |
| Payment succeeded (990) | `psp_clearing` +990 / `escrow` −990 |
| Deposit pre-authorized (2,000) | No ledger entry; tracked as a `Payment` of kind `DEPOSIT_HOLD` |
| Check-out + 24h: release | `escrow` +990 / `owner_payable:owner` −810 / `platform_revenue` −180 |
| Returned, no claim in 48h | Deposit hold voided at Paymob, no ledger entry |
| Payout batch | `owner_payable:owner` +810 / `bank` −810 |

Each row is one `LedgerTransaction` whose entries sum to zero (signed amounts: debits positive, credits negative).

## Deposits

Card pre-authorizations usually expire after about 7 days, and wallets and kiosks can't pre-authorize at all. So:

| Case | Deposit method |
| --- | --- |
| Card payment, rental ends ≤ 5 days after the hold | Pre-authorization, then void or partial capture |
| Longer rental, or non-card method | Capture the deposit into `deposits_held`, refund after the claim window |
| HIGH/RESTRICTED tier | Always captured; may require a bank guarantee or offline contract for very high values |

## Refunds and cancellations

Refund amounts come from the cancellation policy in `packages/shared` (the same code that produced the quote). A refund is a ledger transaction that reverses escrow into `refunds_payable`, then a provider refund call, then settlement once the webhook confirms it.

## Payouts

- Owners add a payout method (bank account IBAN or mobile wallet) after passing ID verification.
- MVP: ops runs a daily payout batch (export + manual bank/wallet transfer), then marks payouts as paid with the transfer reference.
- Later: automated disbursement via the Paymob payouts API or a bank API.

## Reconciliation

A nightly job matches Paymob transactions and settlement reports against `Payment` rows and `psp_clearing` balances, and flags mismatches for ops. The ledger must always balance (`SUM(amount) = 0` per transaction, checked by a DB constraint trigger and a nightly check).

## Compliance (open items, before handling real money)

- **Holding funds:** collecting money for third parties may fall under Central Bank of Egypt rules for payment facilitators. Confirm with Paymob and legal counsel whether the marketplace/split-payment product covers our escrow model, or whether funds must sit with the PSP until release.
- **E-invoicing and VAT:** Egyptian Tax Authority e-invoice/e-receipt obligations apply to our service fees and commission.
- **Business payouts:** collect commercial registration and tax card for organizations.
