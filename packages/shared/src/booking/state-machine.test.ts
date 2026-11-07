import { describe, expect, it } from 'vitest';
import {
  BOOKING_STATUSES,
  InvalidBookingTransitionError,
  allowedTransitions,
  assertTransition,
  canTransition,
  isTerminal,
} from './state-machine.js';

describe('booking state machine', () => {
  it('follows the happy path', () => {
    const path = ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'ACTIVE', 'RETURNED', 'COMPLETED'] as const;
    for (let i = 1; i < path.length; i++) {
      expect(canTransition(path[i - 1]!, path[i]!)).toBe(true);
    }
  });

  it('rejects skipping payment', () => {
    expect(canTransition('ACCEPTED', 'ACTIVE')).toBe(false);
    expect(() => assertTransition('ACCEPTED', 'ACTIVE')).toThrow(InvalidBookingTransitionError);
  });

  it('enforces who may act', () => {
    expect(canTransition('REQUESTED', 'ACCEPTED', 'OWNER')).toBe(true);
    expect(canTransition('REQUESTED', 'ACCEPTED', 'RENTER')).toBe(false);
    expect(canTransition('ACCEPTED', 'CONFIRMED', 'RENTER')).toBe(false); // only payment webhooks confirm
    expect(canTransition('DISPUTED', 'COMPLETED', 'OPS')).toBe(true);
  });

  it('has terminal states with no exits', () => {
    for (const status of ['COMPLETED', 'DECLINED', 'EXPIRED', 'CANCELLED'] as const) {
      expect(isTerminal(status)).toBe(true);
    }
  });

  it('can reach a terminal state from every status', () => {
    for (const status of BOOKING_STATUSES) {
      const seen = new Set<string>();
      const queue = [status];
      let reachesTerminal = false;
      while (queue.length) {
        const current = queue.shift()!;
        if (isTerminal(current)) reachesTerminal = true;
        for (const next of allowedTransitions(current)) {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      expect(reachesTerminal, status).toBe(true);
    }
  });
});
