// The only allowed way to change Booking.status. See docs/architecture/booking-lifecycle.md.

export const BOOKING_STATUSES = [
  'REQUESTED',
  'ACCEPTED',
  'CONFIRMED',
  'ACTIVE',
  'RETURNED',
  'DISPUTED',
  'COMPLETED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Request-to-book starts at REQUESTED; instant book starts at ACCEPTED. */
export const INITIAL_BOOKING_STATUSES = ['REQUESTED', 'ACCEPTED'] as const satisfies readonly BookingStatus[];

export type BookingActor = 'RENTER' | 'OWNER' | 'SYSTEM' | 'OPS';

const TRANSITIONS: Readonly<Record<BookingStatus, readonly BookingStatus[]>> = {
  REQUESTED: ['ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: ['CONFIRMED', 'EXPIRED', 'CANCELLED'],
  CONFIRMED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['RETURNED', 'DISPUTED'],
  RETURNED: ['COMPLETED', 'DISPUTED'],
  DISPUTED: ['COMPLETED'],
  COMPLETED: [],
  DECLINED: [],
  EXPIRED: [],
  CANCELLED: [],
};

type TransitionKey = `${BookingStatus}->${BookingStatus}`;

/** Who may trigger each transition. OPS can always intervene, with an audited reason. */
const TRANSITION_ACTORS: Readonly<Partial<Record<TransitionKey, readonly BookingActor[]>>> = {
  'REQUESTED->ACCEPTED': ['OWNER', 'OPS'],
  'REQUESTED->DECLINED': ['OWNER', 'OPS'],
  'REQUESTED->EXPIRED': ['SYSTEM'],
  'REQUESTED->CANCELLED': ['RENTER', 'OPS'],
  'ACCEPTED->CONFIRMED': ['SYSTEM'],
  'ACCEPTED->EXPIRED': ['SYSTEM'],
  'ACCEPTED->CANCELLED': ['RENTER', 'OWNER', 'OPS'],
  'CONFIRMED->ACTIVE': ['RENTER', 'OWNER', 'OPS'],
  'CONFIRMED->CANCELLED': ['RENTER', 'OWNER', 'OPS'],
  'ACTIVE->RETURNED': ['RENTER', 'OWNER', 'OPS'],
  'ACTIVE->DISPUTED': ['RENTER', 'OWNER', 'OPS'],
  'RETURNED->COMPLETED': ['SYSTEM', 'OPS'],
  'RETURNED->DISPUTED': ['OWNER', 'OPS'],
  'DISPUTED->COMPLETED': ['OPS'],
};

export class InvalidBookingTransitionError extends Error {
  constructor(
    readonly from: BookingStatus,
    readonly to: BookingStatus,
    readonly actor?: BookingActor,
  ) {
    super(
      actor
        ? `${actor} cannot move a booking from ${from} to ${to}`
        : `Booking cannot move from ${from} to ${to}`,
    );
    this.name = 'InvalidBookingTransitionError';
  }
}

export function allowedTransitions(from: BookingStatus): readonly BookingStatus[] {
  return TRANSITIONS[from];
}

export function isTerminal(status: BookingStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function canTransition(from: BookingStatus, to: BookingStatus, actor?: BookingActor): boolean {
  if (!TRANSITIONS[from].includes(to)) return false;
  if (!actor) return true;
  return TRANSITION_ACTORS[`${from}->${to}`]?.includes(actor) ?? false;
}

export function assertTransition(from: BookingStatus, to: BookingStatus, actor?: BookingActor): void {
  if (!canTransition(from, to, actor)) {
    throw new InvalidBookingTransitionError(from, to, actor);
  }
}
