import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 90],
  },
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize bundle size - tree-shake unused exports
  experimental: {
    optimizePackageImports: [
      '@supabase/ssr',
      '@supabase/supabase-js',
      'next-intl',
      '@paypal/react-paypal-js',
    ],
  },
  // Optimize webpack for faster builds
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // Optimize client bundle
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        usedExports: true,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
