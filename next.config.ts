import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'roitdmoxjmapffclbpud.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'robohash.org',
        pathname: '/**',
      },
    ],
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
      // Note: @react-pdf/renderer excluded from optimization as it needs special handling for SSR
    ],
  },
  // Optimize webpack for faster builds
  webpack: (config, { isServer, dev }) => {
    // Configure @react-pdf/renderer for server-side rendering
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      // Ensure @react-pdf/renderer works in Node.js environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }

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
