// app/layout.tsx - SIMPLIFIED & CORRECTED
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import SessionChecker from '@/components/SessionChecker'

const inter = Inter({ subsets: ['latin'] })

// Service categories for structured data
const SERVICE_CATEGORIES = [
  'Mechanics', 'Electricians', 'Plumbers', 'Carpenters', 'Painters',
  'Tailors', 'Cleaners', 'Chefs', 'Home Services', 'Professional Services'
]

export const metadata: Metadata = {
  title: 'Nimart - Nigeria\'s #1 Service Marketplace | Find Verified Professionals',
  description: 'Find trusted and verified service providers in Nigeria. Connect with mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs, and 50+ other services.',
  keywords: [
    'Nimart', 'service providers Nigeria', 'mechanics near me', 'electricians near me',
    'plumbers near me', 'carpenters near me', 'painters near me', 'tailors near me',
    'cleaners near me', 'chefs near me', 'service marketplace', 'Nigeria services',
    'verified professionals', 'home services', 'professional services', 'nimart.ng',
    'find service provider', 'hire professionals Nigeria', 'book service online',
    'Lagos service providers', 'Abuja service providers', 'Port Harcourt services',
    'Ibadan professionals', 'Kano service providers'
  ].join(', '),
  
  // Open Graph
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng',
    title: 'Nimart - Nigeria\'s #1 Service Marketplace',
    description: 'Find trusted and verified service providers in Nigeria. Connect with mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs, and 50+ other services.',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [
      {
        url: 'https://nimart.ng/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nimart - Nigeria\'s Service Marketplace',
      },
      {
        url: 'https://nimart.ng/logo-square.png',
        width: 300,
        height: 300,
        alt: 'Nimart Logo',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@nimartng',
    creator: '@nimartng',
    title: 'Nimart - Nigeria\'s #1 Service Marketplace',
    description: 'Find trusted and verified service providers in Nigeria',
    images: ['https://nimart.ng/twitter-image.png'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Alternates
  alternates: {
    canonical: 'https://nimart.ng',
  },
  
  // Verification
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    // yandex: 'YOUR_YANDEX_VERIFICATION', // Remove if not using
    // yahoo: 'YOUR_YAHOO_VERIFICATION', // Remove if not using
  },
  
  // Other meta
  authors: [{ name: 'Nimart' }],
  publisher: 'Nimart',
  formatDetection: {
    telephone: true,
    date: false,
    address: false,
    email: false,
  },
  metadataBase: new URL('https://nimart.ng'),
}

// Structured Data for homepage
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Nimart',
  description: 'Nigeria\'s premier service marketplace connecting customers with trusted professionals',
  url: 'https://nimart.ng',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://nimart.ng/marketplace?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

// Service catalog structured data
const serviceCatalogData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Nimart Service Marketplace',
  description: 'Find and book verified service providers in Nigeria',
  provider: {
    '@type': 'Organization',
    name: 'Nimart',
    url: 'https://nimart.ng',
    logo: 'https://nimart.ng/logo.png',
  },
  serviceType: SERVICE_CATEGORIES,
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria',
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'NGN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
  {/* WhatsApp-specific tags - MUST BE FIRST in <head> */}
  <meta property="og:image" content="https://nimart.ng/logo-square.png" />
  <meta property="og:image:width" content="300" />
  <meta property="og:image:height" content="300" />
  <meta property="og:image:alt" content="Nimart Logo" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:title" content="Nimart - Nigeria's #1 Service Marketplace" />
  <meta property="og:description" content="Find trusted service providers in Nigeria" />
  <meta property="og:url" content="https://nimart.ng" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Open Graph Meta Tags (Critical for WhatsApp/Facebook) */}
        <meta property="og:title" content="Nimart - Nigeria's #1 Service Marketplace" />
        <meta property="og:description" content="Find trusted and verified service providers in Nigeria. Connect with mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs, and 50+ other services." />
        <meta property="og:url" content="https://nimart.ng" />
        <meta property="og:site_name" content="Nimart" />
        <meta property="og:type" content="website" />
        
        {/* Image for WhatsApp - MUST BE ABSOLUTE URL */}
        <meta property="og:image" content="https://nimart.ng/logo-square.png" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:image:alt" content="Nimart Logo" />
        
        {/* Additional image for Facebook */}
        <meta property="og:image" content="https://nimart.ng/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nimartng" />
        <meta name="twitter:creator" content="@nimartng" />
        <meta name="twitter:title" content="Nimart - Nigeria's #1 Service Marketplace" />
        <meta name="twitter:description" content="Find trusted and verified service providers in Nigeria" />
        <meta name="twitter:image" content="https://nimart.ng/twitter-image.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Nimart" />
        <meta name="geo.region" content="NG" />
        <meta name="geo.placename" content="Nigeria" />
        <meta name="ICBM" content="9.081999, 8.675277" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceCatalogData)
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionChecker />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        
        {/* Loading overlay */}
        <div id="global-loading" className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center hidden">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </body>
    </html>
  )
}