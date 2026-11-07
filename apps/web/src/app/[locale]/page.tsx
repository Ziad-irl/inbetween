import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { apiGet, type CategoryNode } from '@/lib/api';

const STEPS = ['find', 'book', 'return'] as const;
const TRUST = ['escrow', 'deposit', 'verified'] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const categories = await apiGet<CategoryNode[]>('/v1/categories');

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{t('heroTitle')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">{t('heroSubtitle')}</p>

          <form action={`/${locale}/search`} method="get" className="mx-auto mt-8 flex max-w-xl gap-2">
            <label htmlFor="q" className="sr-only">
              {t('searchLabel')}
            </label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder={t('searchPlaceholder')}
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 text-ink shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
            >
              {t('searchButton')}
            </button>
          </form>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            {TRUST.map((key) => (
              <li key={key} className="flex items-center gap-1.5">
                <span aria-hidden className="text-brand-600">
                  ✓
                </span>
                {t(`trust.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">{t('categoriesTitle')}</h2>
        {categories && categories.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={{ pathname: '/search', query: { category: category.slug } }}
                  className="block rounded-xl border border-line bg-surface-muted p-4 hover:border-brand-500"
                >
                  <span className="font-medium">{locale === 'ar' ? category.nameAr : category.nameEn}</span>
                  <span className="mt-1 block text-xs text-ink-muted">
                    {category.children
                      .slice(0, 3)
                      .map((child) => (locale === 'ar' ? child.nameAr : child.nameEn))
                      .join(' · ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-ink-muted">{t('categoriesUnavailable')}</p>
        )}
      </section>

      <section className="border-t border-line bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">{t('howTitle')}</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step} className="rounded-xl bg-surface p-5 shadow-sm">
                <span className="text-sm font-semibold text-accent-500">{index + 1}</span>
                <h3 className="mt-1 font-semibold">{t(`steps.${step}.title`)}</h3>
                <p className="mt-2 text-sm text-ink-muted">{t(`steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
