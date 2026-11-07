import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';

export async function SiteHeader() {
  const t = await getTranslations('Header');

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label={t('home')} className="text-xl font-bold tracking-tight text-brand-700">
          in<span className="text-accent-500">B</span>etween
        </Link>
        <nav className="flex items-center gap-3">
          <LocaleSwitcher />
          <span className="hidden text-sm text-ink-muted sm:inline">{t('signIn')}</span>
          <span className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white">
            {t('listItem')}
          </span>
        </nav>
      </div>
    </header>
  );
}
