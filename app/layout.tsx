// app/layout.tsx - COMPLETE FIXED VERSION (SessionChecker commented out)
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
// import SessionChecker from '@/components/SessionChecker' // COMMENTED OUT

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
    images: ['https://nimart.ng/logo-square.png'],
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
  
  // Icons - Use only files that exist in your public folder
  icons: {
    icon: '/favicon.ico',
    apple: '/logo-square.png',
  },
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
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Character Set & Viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="Nimart - Nigeria's #1 Service Marketplace | Find Verified Professionals" />
        <meta name="description" content="Find trusted and verified service providers in Nigeria. Connect with mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs, and 50+ other services." />
        <meta name="keywords" content="Nimart, service providers Nigeria, mechanics near me, electricians near me, plumbers near me, carpenters near me, painters near me, tailors near me, cleaners near me, chefs near me, service marketplace, Nigeria services, verified professionals, home services, professional services, nimart.ng" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nimart.ng" />
        <meta property="og:title" content="Nimart - Nigeria's #1 Service Marketplace" />
        <meta property="og:description" content="Find trusted and verified service providers in Nigeria. Connect with mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs, and 50+ other services." />
        <meta property="og:image" content="https://nimart.ng/logo-square.png" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:image:alt" content="Nimart Logo" />
        <meta property="og:site_name" content="Nimart" />
        <meta property="og:locale" content="en_NG" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://nimart.ng" />
        <meta name="twitter:title" content="Nimart - Nigeria's #1 Service Marketplace" />
        <meta name="twitter:description" content="Find trusted and verified service providers in Nigeria" />
        <meta name="twitter:image" content="https://nimart.ng/logo-square.png" />
        <meta name="twitter:site" content="@nimartng" />
        <meta name="twitter:creator" content="@nimartng" />
        
        {/* Nimart-specific meta tags */}
        <meta name="brand" content="Nimart" />
        <meta name="application-name" content="Nimart" />
        <meta property="og:site_name" content="Nimart" />
        <meta name="twitter:site" content="@nimartng" />

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Nimart",
              "image": "https://nimart.ng/logo.png",
              "@id": "https://nimart.ng",
              "url": "https://nimart.ng",
              "telephone": "+2348038887589",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "",
                "addressLocality": "Nigeria",
                "addressRegion": "NG",
                "postalCode": "",
                "addressCountry": "NG"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 9.081999,
                "longitude": 8.675277
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              },
              "sameAs": [
                "https://facebook.com/nimart",
                "https://instagram.com/nimart",
                "https://twitter.com/nimartng",
                "https://youtube.com/@nimart"
              ]
            })
          }}
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Theme Color */}
        <meta name="theme-color" content="#008751" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nimart" />
        
        {/* Mobile Web App Config */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Nimart" />
        
        {/* MS Application */}
        <meta name="msapplication-TileColor" content="#008751" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Nimart" />
        <meta name="copyright" content="Nimart" />
        <meta name="language" content="English" />
        
        {/* Geo Tags for Nigeria */}
        <meta name="geo.region" content="NG" />
        <meta name="geo.placename" content="Nigeria" />
        <meta name="geo.position" content="9.081999;8.675277" />
        <meta name="ICBM" content="9.081999, 8.675277" />
        
        {/* Business/Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Nimart',
              url: 'https://nimart.ng',
              logo: 'https://nimart.ng/logo.png',
              description: 'Nigeria\'s premier service marketplace connecting customers with trusted professionals',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'Nigeria',
                addressRegion: 'Federal Capital Territory',
                addressLocality: 'Abuja'
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+2348038887589',
                contactType: 'customer service',
                email: 'info@nimart.ng',
                availableLanguage: 'English'
              },
              sameAs: [
                'https://facebook.com/nimart',
                'https://instagram.com/nimart',
                'https://twitter.com/nimartng',
                'https://youtube.com/@nimart'
              ]
            })
          }}
        />
        
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Structured Data - Service Catalog */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceCatalogData)
          }}
        />
        
        {/* Preconnect to CDNs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://jauxqeahsxxlcabjxdvb.supabase.co" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://nimart.ng" />
        <link rel="dns-prefetch" href="https://jauxqeahsxxlcabjxdvb.supabase.co" />
        
        {/* Performance Hints */}
        <meta httpEquiv="x-ua-compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Mobile Optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        
        {/* PWA Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2732-2048.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        
        {/* Performance Monitoring Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Performance monitoring
                window.nimartStartTime = Date.now();
                
                // Error tracking
                window.addEventListener('error', function(e) {
                  console.error('Nimart Error:', e.error);
                });
                
                // Page load tracking
                window.addEventListener('load', function() {
                  var loadTime = Date.now() - window.nimartStartTime;
                  console.log('Nimart Page loaded in', loadTime, 'ms');
                });
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {/* Session Checker - COMMENTED OUT TEMPORARILY */}
        {/* <SessionChecker /> */}
        
        {/* Navbar Component */}
        <Navbar />
        
        {/* Main Content - REMOVED pt-16 to fix white gap */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Global Loading Overlay */}
        <div id="global-loading" className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center hidden">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            <p className="mt-6 text-lg font-semibold text-gray-700">Loading...</p>
            <p className="mt-2 text-sm text-gray-500">Please wait while we load the best service providers for you</p>
          </div>
        </div>
        
        {/* Global Error Modal */}
        <div id="global-error" className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" id="error-title">Something went wrong</h3>
              <p className="text-gray-600 mb-6" id="error-message">Please try again later.</p>
              <div className="flex gap-3">
                <button 
                  id="dismiss-error-btn"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  id="reload-page-btn"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Global Success Modal */}
        <div id="global-success" className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" id="success-title">Success!</h3>
              <p className="text-gray-600 mb-6" id="success-message">Operation completed successfully.</p>
              <button 
                id="dismiss-success-btn"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
        
        {/* Global Toast Notification */}
        <div id="global-toast" className="fixed bottom-4 right-4 z-[55] max-w-sm hidden">
          <div className="bg-gray-800 text-white rounded-lg shadow-xl p-4 animate-slide-up">
            <div className="flex items-start">
              <div id="toast-icon" className="mr-3 mt-0.5"></div>
              <div className="flex-1">
                <h4 className="font-medium" id="toast-title">Notification</h4>
                <p className="text-sm text-gray-300 mt-1" id="toast-message">This is a toast message</p>
              </div>
              <button 
                id="close-toast-btn"
                className="ml-4 text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Global Utility Scripts - FIXED VERSION */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global utility functions
              window.Nimart = window.Nimart || {};
              
              // Global DOM element references
              let loadingOverlay = null;
              let errorModal = null;
              let successModal = null;
              let toast = null;
              
              // Initialize everything when DOM is ready
              function initializeNimart() {
                // Get DOM references
                loadingOverlay = document.getElementById('global-loading');
                errorModal = document.getElementById('global-error');
                successModal = document.getElementById('global-success');
                toast = document.getElementById('global-toast');
                
                // Ensure loading overlay is hidden on initial load
                if (loadingOverlay) {
                  loadingOverlay.classList.add('hidden');
                }
                
                // Setup event listeners
                setupEventListeners();
                
                console.log('✅ Nimart utilities initialized');
              }
              
              // Event handler setup
              function setupEventListeners() {
                // Error modal buttons
                const dismissErrorBtn = document.getElementById('dismiss-error-btn');
                const reloadPageBtn = document.getElementById('reload-page-btn');
                const dismissSuccessBtn = document.getElementById('dismiss-success-btn');
                const closeToastBtn = document.getElementById('close-toast-btn');
                
                if (dismissErrorBtn) {
                  dismissErrorBtn.addEventListener('click', function() {
                    if (errorModal) errorModal.classList.add('hidden');
                  });
                }
                
                if (reloadPageBtn) {
                  reloadPageBtn.addEventListener('click', function() {
                    window.location.reload();
                  });
                }
                
                if (dismissSuccessBtn) {
                  dismissSuccessBtn.addEventListener('click', function() {
                    if (successModal) successModal.classList.add('hidden');
                  });
                }
                
                if (closeToastBtn) {
                  closeToastBtn.addEventListener('click', function() {
                    if (toast) toast.classList.add('hidden');
                  });
                }
              }
              
              // Show loading overlay
              Nimart.showLoading = function(message) {
                if (!loadingOverlay) {
                  loadingOverlay = document.getElementById('global-loading');
                }
                if (loadingOverlay) {
                  if (message) {
                    const messageEl = loadingOverlay.querySelector('p:nth-child(2)');
                    if (messageEl) messageEl.textContent = message;
                  }
                  loadingOverlay.classList.remove('hidden');
                }
              };
              
              // Hide loading overlay
              Nimart.hideLoading = function() {
                if (!loadingOverlay) {
                  loadingOverlay = document.getElementById('global-loading');
                }
                if (loadingOverlay) {
                  loadingOverlay.classList.add('hidden');
                }
              };
              
              // Show error modal
              Nimart.showError = function(title, message) {
                if (!errorModal) {
                  errorModal = document.getElementById('global-error');
                }
                if (errorModal) {
                  const titleEl = document.getElementById('error-title');
                  const messageEl = document.getElementById('error-message');
                  if (titleEl) titleEl.textContent = title || 'Something went wrong';
                  if (messageEl) messageEl.textContent = message || 'Please try again later.';
                  errorModal.classList.remove('hidden');
                }
              };
              
              // Show success modal
              Nimart.showSuccess = function(title, message) {
                if (!successModal) {
                  successModal = document.getElementById('global-success');
                }
                if (successModal) {
                  const titleEl = document.getElementById('success-title');
                  const messageEl = document.getElementById('success-message');
                  if (titleEl) titleEl.textContent = title || 'Success!';
                  if (messageEl) messageEl.textContent = message || 'Operation completed successfully.';
                  successModal.classList.remove('hidden');
                }
              };
              
              // Show toast notification
              Nimart.showToast = function(options) {
                if (!toast) {
                  toast = document.getElementById('global-toast');
                }
                if (!toast) return;
                
                const { 
                  title = 'Notification', 
                  message, 
                  type = 'info', 
                  duration = 5000 
                } = options || {};
                
                // Set icon based on type
                const iconEl = document.getElementById('toast-icon');
                if (iconEl) {
                  let iconSvg = '';
                  switch(type) {
                    case 'success':
                      iconSvg = '<svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                      break;
                    case 'error':
                      iconSvg = '<svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                      break;
                    case 'warning':
                      iconSvg = '<svg class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>';
                      break;
                    default:
                      iconSvg = '<svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                  }
                  iconEl.innerHTML = iconSvg;
                }
                
                // Set content
                const titleEl = document.getElementById('toast-title');
                const messageEl = document.getElementById('toast-message');
                if (titleEl) titleEl.textContent = title;
                if (messageEl) messageEl.textContent = message;
                
                // Show toast
                toast.classList.remove('hidden');
                
                // Auto-hide after duration
                if (duration > 0) {
                  setTimeout(() => {
                    if (toast) toast.classList.add('hidden');
                  }, duration);
                }
              };
              
              // Initialize when DOM is ready
              document.addEventListener('DOMContentLoaded', function() {
                initializeNimart();
              });
              
              // REMOVED PROBLEMATIC CLICK HANDLER - This was causing infinite loading
              // No automatic loading on link clicks - let Next.js handle navigation
            `
          }}
        />
        
        {/* Service Worker Registration (PWA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
        
        {/* Performance Observer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('PerformanceObserver' in window) {
                try {
                  const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime, 'ms');
                      }
                    }
                  });
                  observer.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                  console.log('PerformanceObserver not supported');
                }
              }
            `
          }}
        />
      </body>
    </html>
  )
}