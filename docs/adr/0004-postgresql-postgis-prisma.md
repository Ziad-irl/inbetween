# ADR-0004: PostgreSQL + PostGIS with Prisma

- Status: Accepted
- Date: 2026-11-07

## Context

The data is relational (users, listings, bookings, ledger) and needs strong consistency, geo queries ("within 10 km"), range overlap checks for availability, and full-text search in Arabic and English.

## Decision

- PostgreSQL 17 as the single system of record.
- PostGIS for location search; `btree_gist` exclusion constraints on `tstzrange` for availability; `pg_trgm` and full-text search for listing search.
- Prisma as ORM for schema, migrations and typed queries. Features Prisma can't express (exclusion constraints, `geography` columns, GIN indexes, check constraints) are added with raw SQL inside Prisma migrations, and complex queries use `$queryRaw` tagged templates.

## Consequences

- One database to operate, back up and reason about.
- Prisma gives fast iteration and typed access; we accept some raw SQL for advanced features.
- If Prisma becomes a bottleneck for complex queries, Kysely can be introduced for the read side without changing the schema.
