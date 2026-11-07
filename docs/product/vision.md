# Product vision

## One line

inBetween lets anyone rent anything, from a needle to a rocket, from someone nearby they can trust.

## The problem

- **Owners** have things that sit idle most of the time: a camera, a drill, a tent, a generator, a car, a forklift. Renting them out informally (Facebook groups, WhatsApp) means no payment guarantee, no deposit protection and no recourse when something breaks.
- **Renters** need something for a few hours or days and either buy it (expensive, wasteful) or hunt through fragmented, untrusted channels.
- **Rental businesses** (equipment, event gear, vehicles, costumes) run on phone calls, paper contracts and cash, and have no shared marketplace to reach demand.

## What inBetween provides

1. **Discovery**: search by category, location, dates and price, in Arabic or English.
2. **Booking**: request-to-book or instant book, with availability calendars that prevent double booking.
3. **Escrowed payments**: the renter pays inBetween; the owner is paid out after the handover, minus commission.
4. **Security deposits**: held on the renter's card (or in escrow) and released after the item is returned in good condition.
5. **Handover checks**: photo-based check-out and check-in inspections signed by both sides in the app.
6. **Trust**: verified phone and national ID, reviews in both directions, dispute resolution, and stricter rules for higher-risk categories.

## "Needle to rocket": scaling trust with risk

The same flow cannot cover a sewing needle and a crane. Every category has a **risk tier** that sets the rules:

| Tier | Examples | Rules |
| --- | --- | --- |
| LOW | Books, tools, party supplies | Phone-verified users, optional deposit |
| MEDIUM | Cameras, laptops, camping gear | National ID verification, deposit required |
| HIGH | Vehicles, generators, heavy equipment | ID + selfie verification, mandatory deposit, insurance add-on, business owners preferred |
| RESTRICTED | Anything needing a licence or operator (cranes, boats, aircraft) | Business listers only, manual review, offline contract, operator included |

See [trust & safety](../architecture/trust-and-safety.md).

## Users

| Persona | Need |
| --- | --- |
| **Renter** (individual) | Find the item, book with confidence, pay with the method they have (card, wallet, Fawry, InstaPay) |
| **Individual owner** | Earn from idle items without being cheated |
| **Business owner** | List inventory (with quantities), manage staff, get paid reliably, reach new customers |
| **inBetween ops** | Moderate listings, verify users, resolve disputes, reconcile payments |

## Business model

- **Renter service fee**: a percentage on top of the rental price (starting assumption 10%).
- **Owner commission**: a percentage taken from the owner payout (starting assumption 10% for individuals, negotiable for businesses).
- Later: paid listing boosts, damage protection add-on (with an insurance partner), business subscriptions (inventory tools, analytics).

Fee percentages are configuration, not code.

## Success metrics for the beta

- Listings live in Greater Cairo, and their spread across categories
- Booking request → confirmed conversion rate
- Completed rentals without a dispute (target > 97%)
- Repeat renters within 60 days
- Gross booking value (GBV) and take rate
