import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Picks up src/i18n/request.ts
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Local SeaweedFS; production CDN host is added per environment.
      { protocol: 'http', hostname: 'localhost', port: '8333' },
    ],
  },
};

export default withNextIntl(nextConfig);
