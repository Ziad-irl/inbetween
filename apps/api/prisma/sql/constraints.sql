-- Constraints and triggers Prisma can't express. Appended to the initial migration.

-- Exactly one owner: an individual user or an organization.
ALTER TABLE "locations" ADD CONSTRAINT "locations_one_owner"
  CHECK (("ownerUserId" IS NULL) <> ("ownerOrgId" IS NULL));
ALTER TABLE "listings" ADD CONSTRAINT "listings_one_owner"
  CHECK (("ownerUserId" IS NULL) <> ("ownerOrgId" IS NULL));
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_one_owner"
  CHECK (("ownerUserId" IS NULL) <> ("ownerOrgId" IS NULL));
ALTER TABLE "payout_methods" ADD CONSTRAINT "payout_methods_one_owner"
  CHECK (("ownerUserId" IS NULL) <> ("ownerOrgId" IS NULL));
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_one_owner"
  CHECK (("ownerUserId" IS NULL) <> ("ownerOrgId" IS NULL));

-- Sanity checks on values.
ALTER TABLE "listings" ADD CONSTRAINT "listings_quantity_positive" CHECK ("quantity" >= 1);
ALTER TABLE "listings" ADD CONSTRAINT "listings_deposit_non_negative" CHECK ("depositMinor" >= 0);
ALTER TABLE "listing_prices" ADD CONSTRAINT "listing_prices_non_negative" CHECK ("amountMinor" >= 0);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_valid_range" CHECK ("endsAt" > "startsAt");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_amounts_balance"
  CHECK ("renterPaysMinor" = "ownerReceivesMinor" + "renterServiceFeeMinor" + "ownerCommissionMinor");
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_valid_range" CHECK ("endsAt" > "startsAt");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_positive" CHECK ("amountMinor" > 0);
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_amount_positive" CHECK ("amountMinor" > 0);

-- No double booking: blocks for the same listing unit may not overlap.
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_no_overlap"
  EXCLUDE USING gist (
    "listingId" WITH =,
    "unitIndex" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  );

-- Ledger: every transaction's entries must sum to zero, checked at commit.
CREATE FUNCTION ledger_assert_balanced() RETURNS trigger AS $$
DECLARE
  tx_id uuid := COALESCE(NEW."transactionId", OLD."transactionId");
  total numeric;
BEGIN
  SELECT COALESCE(SUM("amountMinor"), 0) INTO total
  FROM "ledger_entries" WHERE "transactionId" = tx_id;
  IF total <> 0 THEN
    RAISE EXCEPTION 'Ledger transaction % is unbalanced (sum = %)', tx_id, total;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "ledger_entries_balanced"
  AFTER INSERT OR UPDATE OR DELETE ON "ledger_entries"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION ledger_assert_balanced();

-- Ledger entries are append-only.
CREATE FUNCTION ledger_forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries is append-only; post a reversing transaction instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ledger_entries_append_only"
  BEFORE UPDATE OR DELETE ON "ledger_entries"
  FOR EACH ROW EXECUTE FUNCTION ledger_forbid_mutation();

-- Keep locations.geo in sync with latitude/longitude.
CREATE FUNCTION locations_sync_geo() RETURNS trigger AS $$
BEGIN
  NEW."geo" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "locations_sync_geo"
  BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "locations"
  FOR EACH ROW EXECUTE FUNCTION locations_sync_geo();
