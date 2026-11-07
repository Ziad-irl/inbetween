# Raw SQL that Prisma can't express

These statements are appended to the Prisma migration that creates the tables they touch. Prisma doesn't track CHECK constraints, exclusion constraints or triggers, so they don't cause schema drift.

- [`constraints.sql`](constraints.sql): ownership CHECKs, range CHECKs, the availability exclusion constraint, the ledger balance trigger, and the `locations.geo` sync trigger.

GiST/GIN indexes for geo and full-text search are added together with the search work (milestone M1), since Prisma reports indexes it doesn't know about as drift. Options to evaluate there: declaring them in `schema.prisma` where supported, or a generated `search_vector` column.
