# ADR-0007: Search on Postgres first, dedicated engine later

- Status: Accepted
- Date: 2026-11-07

## Context

Search combines keyword, category, location radius, date availability and price. At launch we expect tens of thousands of listings, not millions.

## Decision

Implement search in PostgreSQL: full-text `tsvector` (simple config plus our Arabic normalization) with `pg_trgm` for typos, PostGIS `ST_DWithin` for radius, and an anti-join on `AvailabilityBlock` for dates. Search logic sits behind a `SearchService` interface.

## Consequences

- No extra infrastructure or sync pipeline in the MVP; results are always consistent with the database.
- When relevance tuning, facets or volume demand it, we add Meilisearch or OpenSearch fed by outbox events, behind the same interface.
