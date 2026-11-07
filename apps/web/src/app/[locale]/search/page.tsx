import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { formatMoney } from '@inbetween/shared/money';
import type { PriceUnit } from '@inbetween/shared/enums';
import { routing } from '@/i18n/routing';
import { apiGet, type ListingCard, type Paginated } from '@/lib/api';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const UNIT_PREFERENCE: PriceUnit[] = ['DAY', 'HOUR', 'WEEK', 'MONTH'];

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Search' });
  return { title: t('titleAll'), robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Search');

  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  const category = typeof query.category === 'string' ? query.category : '';

  const apiQuery = new URLSearchParams();
  if (q) apiQuery.set('q', q);
  if (category) apiQuery.set('categorySlug', category);
  const result = await apiGet<Paginated<ListingCard>>(`/v1/listings?${apiQuery.toString()}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{q ? t('title', { query: q }) : t('titleAll')}</h1>

      {!result ? (
        <p className="mt-6 text-ink-muted">{t('unavailable')}</p>
      ) : result.items.length === 0 ? (
        <p className="mt-6 text-ink-muted">{t('empty')}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-muted">{t('count', { count: result.total })}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((listing) => {
              const price = UNIT_PREFERENCE.map((unit) =>
                listing.prices.find((p) => p.unit === unit),
              ).find(Boolean);
              return (
                <li key={listing.id} className="rounded-xl border border-line p-4">
                  <p className="text-xs text-ink-muted">
                    {locale === 'ar' ? listing.category.nameAr : listing.category.nameEn} ·{' '}
                    {listing.location.city}
                  </p>
                  <h2 className="mt-1 font-semibold">{listing.title}</h2>
                  {price && (
                    <p className="mt-2 text-brand-700">
                      {t('from', {
                        price: formatMoney(
                          { amountMinor: BigInt(price.amountMinor), currency: listing.currency },
                          locale,
                        ),
                      })}{' '}
                      <span className="text-sm text-ink-muted">{t(`perUnit.${price.unit}`)}</span>
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {BigInt(listing.depositMinor) > BigInt(0) && (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-ink-muted">
                        {t('deposit', {
                          amount: formatMoney(
                            { amountMinor: BigInt(listing.depositMinor), currency: listing.currency },
                            locale,
                          ),
                        })}
                      </span>
                    )}
                    {listing.instantBook && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">
                        {t('instantBook')}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
