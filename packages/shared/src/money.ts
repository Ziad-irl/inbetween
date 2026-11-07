import type { Currency, Locale } from './enums.js';

/** Number of minor units per major unit, as a power of ten (EGP: 100 piastres). */
export const CURRENCY_EXPONENT: Readonly<Record<Currency, number>> = {
  EGP: 2,
};

export interface Money {
  readonly amountMinor: bigint;
  readonly currency: Currency;
}

export function money(amountMinor: bigint, currency: Currency = 'EGP'): Money {
  return { amountMinor, currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return money(a.amountMinor + b.amountMinor, a.currency);
}

/**
 * Integer division rounding half to even (banker's rounding).
 * This is the single place where money is rounded.
 */
export function divRoundHalfEven(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError('denominator must be positive');
  const negative = numerator < 0n;
  const abs = negative ? -numerator : numerator;
  const quotient = abs / denominator;
  const twiceRemainder = (abs % denominator) * 2n;
  let rounded = quotient;
  if (twiceRemainder > denominator || (twiceRemainder === denominator && quotient % 2n === 1n)) {
    rounded = quotient + 1n;
  }
  return negative ? -rounded : rounded;
}

/** Applies a rate in basis points (1000 = 10%) to an amount. */
export function applyBps(amountMinor: bigint, bps: number): bigint {
  if (!Number.isInteger(bps) || bps < 0) throw new RangeError('bps must be a non-negative integer');
  return divRoundHalfEven(amountMinor * BigInt(bps), 10_000n);
}

/** Converts major units given as a decimal string ("1250.50") to minor units. */
export function parseMajor(value: string, currency: Currency = 'EGP'): bigint {
  const exponent = CURRENCY_EXPONENT[currency];
  const match = /^(-)?(\d+)(?:\.(\d+))?$/.exec(value.trim());
  if (!match) throw new RangeError(`Invalid amount: ${value}`);
  const [, sign, whole = '0', fraction = ''] = match;
  if (fraction.length > exponent) throw new RangeError(`Too many decimals for ${currency}: ${value}`);
  const minor = BigInt(whole + fraction.padEnd(exponent, '0'));
  return sign ? -minor : minor;
}

/** JSON-safe serialization: amounts travel as strings. */
export function toMinorString(amountMinor: bigint): string {
  return amountMinor.toString();
}

export function fromMinorString(value: string): bigint {
  if (!/^-?\d+$/.test(value)) throw new RangeError(`Invalid minor amount: ${value}`);
  return BigInt(value);
}

const INTL_LOCALE: Readonly<Record<Locale, string>> = {
  // Western digits by default (ADR-0006); switch to 'ar-EG' for Arabic-Indic digits.
  ar: 'ar-EG-u-nu-latn',
  en: 'en-EG',
};

/** Display formatting only. Never parse the output back into money. */
export function formatMoney(value: Money, locale: Locale): string {
  const exponent = CURRENCY_EXPONENT[value.currency];
  const major = Number(value.amountMinor) / 10 ** exponent;
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: value.amountMinor % BigInt(10 ** exponent) === 0n ? 0 : exponent,
    maximumFractionDigits: exponent,
  }).format(major);
}
