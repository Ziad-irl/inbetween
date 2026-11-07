# ADR-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-11-07

## Context

inBetween will grow from a small founding team. Decisions made early (stack, payment model, data model) will be questioned later, and the reasons behind them get lost.

## Decision

We keep Architecture Decision Records in `docs/adr/`, one Markdown file per decision, reviewed through pull requests like code.

## Consequences

- New team members can read why things are the way they are.
- Changing a major decision requires writing a superseding ADR, which forces the trade-offs to be stated.
