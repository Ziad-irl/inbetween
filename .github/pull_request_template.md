## What and why

<!-- What does this change and why? Link the issue: Closes #123 -->

## How to test

<!-- Steps a reviewer can follow locally. -->

## Checklist

- [ ] Tests cover the change (or explain why not)
- [ ] UI strings added to both `ar.json` and `en.json`; checked in Arabic (RTL)
- [ ] Money handled as bigint minor units
- [ ] Booking status changes go through the shared state machine
- [ ] Prisma migration added for schema changes (and raw SQL for constraints if needed)
- [ ] No personal data in logs
- [ ] ADR added or updated for architecture changes
