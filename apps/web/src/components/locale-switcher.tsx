'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Header');
  const other = locale === 'ar' ? 'en' : 'ar';

  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted hover:border-brand-500 hover:text-brand-700"
    >
      {t('switchLocale')}
    </Link>
  );
}
