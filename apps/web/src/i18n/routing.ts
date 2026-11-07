import { DEFAULT_LOCALE, LOCALES } from '@inbetween/shared/enums';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Always show the locale in the URL (/ar, /en) so each language is indexable.
  localePrefix: 'always',
});

export const RTL_LOCALES = new Set<string>(['ar']);
