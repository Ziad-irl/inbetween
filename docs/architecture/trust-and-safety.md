# Trust and safety

## Verification levels

| Level | How | Required for |
| --- | --- | --- |
| `L0_PHONE` | SMS OTP | Any account action beyond browsing |
| `L1_ID` | National ID (or passport) photo, checked by a KYC provider | Renting MEDIUM tier; publishing any listing that receives payouts |
| `L2_ID_SELFIE` | ID + liveness selfie match | Renting or listing HIGH tier |
| `L3_BUSINESS` | Commercial registration + tax card + authorized signatory ID, reviewed manually | Business accounts; listing RESTRICTED tier |

## Category risk tiers

Category tiers drive:

- Minimum verification level for renter and owner
- Mandatory deposit and its minimum as a percentage of declared item value
- Whether instant book is allowed (not for HIGH/RESTRICTED)
- Moderation: HIGH and RESTRICTED listings are always reviewed manually
- Prohibited items (weapons, drugs, counterfeit goods, items needing a licence without a licensed operator) can't be listed at all

## Moderation

- Automated checks on listing creation: banned keywords (ar/en), image classification later, duplicate detection, price outliers
- Review queue for ops with approve / reject (with reason) / request changes
- Report flow for users on listings, profiles and messages

## Fraud controls (MVP)

- Velocity limits: bookings per new account per day, failed payments per card fingerprint
- New accounts can't book HIGH tier until they have one completed rental or L2 verification
- Messaging: detect phone numbers, emails and payment links before booking confirmation, and warn (moving off-platform removes deposit protection)
- Device and IP signals stored on sessions for investigations

## Reviews

- Both sides can review within 14 days after `COMPLETED`.
- Reviews are hidden until both are submitted or the window closes (blind reviews prevent retaliation).
- Ratings: overall plus accuracy, communication, condition (renter → owner), and care, punctuality (owner → renter).

## Disputes

1. The owner opens a claim within 48h of `RETURNED`, with evidence (check-in photos vs check-out photos, receipts).
2. The renter responds within 48h.
3. Ops decides: no charge, partial deposit capture, or full deposit capture; anything above the deposit is handled offline or by insurance later.
4. The decision and reasoning are stored and audited; both parties are notified.
