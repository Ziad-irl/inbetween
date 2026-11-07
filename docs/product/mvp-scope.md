# MVP scope

The MVP is a web app (responsive, mobile-first) for **Greater Cairo**, in **Arabic and English**, with **EGP** only.

## In scope

### Accounts and identity
- Sign up and sign in with phone number (OTP via SMS) or email + password
- Profile: name, photo, preferred language, bio
- Phone verification (all users); national ID verification for MEDIUM+ tier rentals and for payouts
- Business accounts: organization profile, commercial registration number, team members with roles (owner, manager, staff)

### Listings
- Create, edit, pause and archive a listing: title and description (ar/en), category, category attributes, photos, condition, location (shown approximately until booked)
- Pricing per hour / day / week / month, minimum and maximum rental duration, security deposit
- Quantity (for businesses with several identical units)
- Fulfillment options: pickup, owner delivery (with fee), operator included
- Availability calendar with owner blocks
- Instant book on/off; cancellation policy (flexible, moderate, strict)
- Moderation: new listings from unverified owners and all HIGH/RESTRICTED listings go to review

### Discovery
- Category browsing (tree with ar/en names)
- Search with keyword (Arabic and English), category, location radius, date range availability and price range
- Listing page with photos, price breakdown, owner profile and reviews

### Booking
- Price quote for selected dates (rental, renter fee, delivery, deposit)
- Request to book (owner accepts/declines within 24h) or instant book
- Payment through Paymob, then confirmation to both sides
- Cancellation by either side, with refunds per policy
- Check-out and check-in handover inspections with photos
- Messaging between renter and owner, tied to a booking or listing inquiry

### Payments
- Card, mobile wallet and kiosk payments via Paymob
- Escrow ledger: funds held until handover; owner payout after release
- Deposit: card pre-authorization for short rentals, captured-and-refunded deposit for longer ones
- Payouts to bank account or mobile wallet (manual batch by ops in the MVP)
- Refunds for cancellations and resolved disputes

### Trust
- Two-way reviews after completion (both sides' reviews revealed together)
- Disputes: open within 48h of return, ops resolves with deposit capture/partial refund
- Report a listing or user

### Operations (admin)
- Review queue: listings and ID verifications
- User and listing search; suspend/ban
- Booking lookup with full status history and ledger entries
- Dispute handling
- Payout batch export and reconciliation report

### Notifications
- Email and SMS for key booking events; in-app notification center

## Out of scope for the MVP (planned later)

- Native mobile apps (Expo, reusing the API and `packages/shared`)
- Multiple currencies and countries
- Automated payouts via API
- Damage protection / insurance product
- Dynamic pricing, discounts and promo codes
- Delivery logistics partners
- Business tools: bulk listing import, inventory sync, analytics dashboard
- Real-time chat over WebSockets (MVP uses polling)

## Non-functional requirements

| Area | Target |
| --- | --- |
| Performance | Search p95 < 500 ms, listing page LCP < 2.5 s on a mid-range Android over 4G |
| Availability | 99.5% monthly for the MVP |
| Security | OWASP ASVS level 2 for auth and payments; no card data stored (PCI scope SAQ-A via hosted Paymob checkout) |
| Privacy | Compliance with Egypt's Personal Data Protection Law (Law 151 of 2020) |
| Accessibility | WCAG 2.2 AA on the web app, including RTL |
| Localization | Every string in ar and en; Arabic is the default locale |
