/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage
      {
        protocol: 'https',
        hostname: 'jauxqeahsxxlcabjxdvb.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // All Supabase subdomains
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      // ui-avatars.com for SVG avatars
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      // Google
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      // GitHub
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '/**',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
        ],
      },
    ]
  },
  
  // Production optimizations
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-forgot-password',
        destination: '/forgot-password',
        permanent: true,
      },
      {
        source: '/old-reset-password',
        destination: '/auth/reset-password',
        permanent: true,
      },
    ]
  },
  
  // Production source maps
  productionBrowserSourceMaps: false,
  
  // REMOVED: Webpack configuration that was causing issues
  // Next.js 14 handles CSS imports automatically
}

module.exports = nextConfig