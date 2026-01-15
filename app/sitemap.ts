// app/sitemap.ts - ENHANCED FOR "NIMART" RANKING
import { MetadataRoute } from 'next'

// Nigerian States - Comprehensive list
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

// Service Categories - Expanded with variations
const SERVICE_CATEGORIES = [
  // Primary Keywords: Nimart + Service
  { name: 'Nimart Mechanics', slug: 'nimart-mechanics' },
  { name: 'Nimart Electricians', slug: 'nimart-electricians' },
  { name: 'Nimart Plumbers', slug: 'nimart-plumbers' },
  { name: 'Nimart Carpenters', slug: 'nimart-carpenters' },
  { name: 'Nimart Painters', slug: 'nimart-painters' },
  { name: 'Nimart Tailors', slug: 'nimart-tailors' },
  { name: 'Nimart Cleaners', slug: 'nimart-cleaners' },
  { name: 'Nimart Chefs', slug: 'nimart-chefs' },
  
  // Additional Services with Nimart prefix
  { name: 'Nimart Drivers', slug: 'nimart-drivers' },
  { name: 'Nimart Gardeners', slug: 'nimart-gardeners' },
  { name: 'Nimart Security', slug: 'nimart-security' },
  { name: 'Nimart Makeup Artists', slug: 'nimart-makeup-artists' },
  { name: 'Nimart Photographers', slug: 'nimart-photographers' },
  { name: 'Nimart Videographers', slug: 'nimart-videographers' },
  { name: 'Nimart Tutors', slug: 'nimart-tutors' },
  { name: 'Nimart IT Support', slug: 'nimart-it-support' },
  { name: 'Nimart Web Developers', slug: 'nimart-web-developers' },
  { name: 'Nimart Graphic Designers', slug: 'nimart-graphic-designers' },
  { name: 'Nimart Accountants', slug: 'nimart-accountants' },
  { name: 'Nimart Lawyers', slug: 'nimart-lawyers' },
  { name: 'Nimart Doctors', slug: 'nimart-doctors' },
  { name: 'Nimart Nurses', slug: 'nimart-nurses' },
  { name: 'Nimart Fitness Trainers', slug: 'nimart-fitness-trainers' },
  { name: 'Nimart Caterers', slug: 'nimart-caterers' },
  { name: 'Nimart Event Planners', slug: 'nimart-event-planners' },
  { name: 'Nimart Interior Designers', slug: 'nimart-interior-designers' },
  { name: 'Nimart Architects', slug: 'nimart-architects' },
  { name: 'Nimart Builders', slug: 'nimart-builders' },
  
  // Location-based Nimart services
  { name: 'Nimart Nigeria', slug: 'nimart-nigeria' },
  { name: 'Nimart Lagos', slug: 'nimart-lagos' },
  { name: 'Nimart Abuja', slug: 'nimart-abuja' },
  { name: 'Nimart Port Harcourt', slug: 'nimart-port-harcourt' },
  { name: 'Nimart Ibadan', slug: 'nimart-ibadan' },
  { name: 'Nimart Kano', slug: 'nimart-kano' },
  
  // Service type variations
  { name: 'Nimart Service Providers', slug: 'nimart-service-providers' },
  { name: 'Nimart Professionals', slug: 'nimart-professionals' },
  { name: 'Nimart Verified Providers', slug: 'nimart-verified-providers' },
  { name: 'Nimart Marketplace', slug: 'nimart-marketplace' },
  { name: 'Nimart Booking', slug: 'nimart-booking' },
  { name: 'Nimart Services', slug: 'nimart-services' },
  
  // Common search variations
  { name: 'Nimart Near Me', slug: 'nimart-near-me' },
  { name: 'Nimart Online', slug: 'nimart-online' },
  { name: 'Nimart App', slug: 'nimart-app' },
  { name: 'Nimart Website', slug: 'nimart-website' },
  { name: 'Nimart Contact', slug: 'nimart-contact' },
  { name: 'Nimart Support', slug: 'nimart-support' }
]

// Popular Nigerian Cities
const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Benin City',
  'Kaduna', 'Warri', 'Aba', 'Onitsha', 'Enugu', 'Calabar',
  'Uyo', 'Owerri', 'Abeokuta', 'Akure', 'Ado Ekiti', 'Osogbo',
  'Ilorin', 'Jos', 'Maiduguri', 'Sokoto', 'Yola', 'Bauchi'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nimart.ng'
  const currentDate = new Date()
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // CRITICAL PAGES - Highest Priority
  const criticalPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ]
  
  sitemapEntries.push(...criticalPages)
  
  // AUTH PAGES
  const authPages = [
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/provider/register`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    }
  ]
  
  sitemapEntries.push(...authPages)
  
  // LEGAL PAGES
  const legalPages = [
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    }
  ]
  
  sitemapEntries.push(...legalPages)
  
  // HELP & INFO PAGES
  const infoPages = [
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }
  ]
  
  sitemapEntries.push(...infoPages)
  
  // NIMART-SPECIFIC KEYWORD PAGES - HIGH PRIORITY
  const nimartKeywordPages = [
    {
      url: `${baseUrl}/nimart`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/nimart-services`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nimart-marketplace`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nimart-nigeria`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nimart-online`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }
  ]
  
  sitemapEntries.push(...nimartKeywordPages)
  
  // SERVICE CATEGORY PAGES - All include "Nimart" keyword
  const servicePages = SERVICE_CATEGORIES.map(service => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
  
  // Only add a reasonable number to stay under limits
  sitemapEntries.push(...servicePages.slice(0, 100))
  
  // STATE PAGES with Nimart keyword
  const statePages = NIGERIAN_STATES.map(state => ({
    url: `${baseUrl}/nimart-${state.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
  
  sitemapEntries.push(...statePages)
  
  // CITY PAGES with Nimart keyword
  const cityPages = NIGERIAN_CITIES.map(city => ({
    url: `${baseUrl}/nimart-${city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))
  
  sitemapEntries.push(...cityPages)
  
  // SERVICE + LOCATION COMBINATION PAGES
  // Top 5 services x Top 10 cities = 50 pages
  const topServices = SERVICE_CATEGORIES.slice(0, 5)
  const topCities = NIGERIAN_CITIES.slice(0, 10)
  
  const serviceLocationPages = topServices.flatMap(service => 
    topCities.map(city => ({
      url: `${baseUrl}/nimart-${service.slug}-in-${city.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )
  
  sitemapEntries.push(...serviceLocationPages)
  
  // DYNAMIC FILTER PAGES for SEO
  const filterPages = [
    // Price filters
    {
      url: `${baseUrl}/marketplace?price=affordable`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/marketplace?price=premium`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    
    // Rating filters
    {
      url: `${baseUrl}/marketplace?rating=4+`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/marketplace?rating=5`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    
    // Verification filters
    {
      url: `${baseUrl}/marketplace?verified=true`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    
    // Availability filters
    {
      url: `${baseUrl}/marketplace?available=now`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    }
  ]
  
  sitemapEntries.push(...filterPages)
  
  // SPECIAL COLLECTION PAGES
  const collectionPages = [
    {
      url: `${baseUrl}/top-rated-providers`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/new-providers`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trending-services`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/emergency-services`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }
  ]
  
  sitemapEntries.push(...collectionPages)
  
  // STATIC FAQ PAGES for common questions
  const faqPages = [
    {
      url: `${baseUrl}/faq/what-is-nimart`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq/how-to-book-nimart`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq/nimart-pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq/become-nimart-provider`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq/nimart-safety`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  ]
  
  sitemapEntries.push(...faqPages)
  
  // Return limited to 5000 URLs (Google's limit)
  return sitemapEntries.slice(0, 5000)
}