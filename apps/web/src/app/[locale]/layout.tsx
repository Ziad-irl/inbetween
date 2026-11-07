import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { RTL_LOCALES, routing } from '@/i18n/routing';
import '../globals.css';

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<LayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: { default: t('title'), template: '%s · inBetween' },
    description: t('description'),
    alternates: { languages: { ar: '/ar', en: '/en' } },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Footer');

  return (
    <html
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'}
      className={`${plexArabic.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-surface font-sans text-ink antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line py-6 text-center text-sm text-ink-muted">
            <p>{t('tagline')}</p>
            <p>{t('rights', { year: new Date().getFullYear() })}</p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
