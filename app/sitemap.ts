// app/sitemap.ts - UPDATED TO MATCH YOUR ACTUAL FOLDER STRUCTURE
import { MetadataRoute } from 'next'

// Nigerian States - Comprehensive list
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

// Service Categories - Based on your actual services
const SERVICE_CATEGORIES = [
  'Mechanics', 'Electricians', 'Plumbers', 'Carpenters', 'Painters',
  'Tailors', 'Cleaners', 'Chefs', 'Home Services', 'Professional Services'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nimart.ng'
  const currentDate = new Date()
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // CRITICAL PAGES - Highest Priority (HOME)
  sitemapEntries.push({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 1.0,
  })

  // AUTH PAGES - ACTUAL PAGES
  sitemapEntries.push(
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
  )

  // LEGAL PAGES - From /links folder
  sitemapEntries.push(
    {
      url: `${baseUrl}/links/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/links/terms-conditions`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/links/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/links/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    }
  )

  // INFO PAGES - From /links folder
  sitemapEntries.push(
    {
      url: `${baseUrl}/links/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/links/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/links/help-center`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/links/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/links/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/links/careers`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }
  )

  // PROVIDER-RELATED PAGES - From /links folder
  sitemapEntries.push(
    {
      url: `${baseUrl}/links/become-a-provider`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/links/provider-benefits`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/links/provider-support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }
  )

  // MARKETPLACE PAGE
  sitemapEntries.push({
    url: `${baseUrl}/links/marketplace`,
    lastModified: currentDate,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  })

  // USER PAGES
  sitemapEntries.push(
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/messages`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/notifications`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bookings`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bookings/new`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  )

  // PROVIDER DASHBOARD PAGES
  sitemapEntries.push(
    {
      url: `${baseUrl}/provider/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/provider/bookings`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/provider/settings`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }
  )

  // ADMIN PAGES
  sitemapEntries.push({
    url: `${baseUrl}/admin/verifications`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  })

  // DYNAMIC PROVIDER PAGES
  // Note: These would be generated dynamically from your database
  // For now, we'll add the base provider page pattern
  sitemapEntries.push({
    url: `${baseUrl}/providers`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })

  // SERVICE CATEGORY PAGES - Based on your actual service categories
  SERVICE_CATEGORIES.forEach(service => {
    sitemapEntries.push({
      url: `${baseUrl}/links/marketplace?service=${encodeURIComponent(service)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  })

  // STATE-SPECIFIC MARKETPLACE PAGES
  NIGERIAN_STATES.slice(0, 10).forEach(state => {
    sitemapEntries.push({
      url: `${baseUrl}/links/marketplace?state=${encodeURIComponent(state)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  })

  // NIMART-SPECIFIC KEYWORD PAGES
  sitemapEntries.push(
    {
      url: `${baseUrl}/nimart`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nimart-sitemap.xml`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.3,
    }
  )

  // Return limited to 5000 URLs (Google's limit)
  // Currently we have about 50-60 URLs, well within limits
  return sitemapEntries
}