// app/links/help-center/page.tsx - FIXED VERSION
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Search, HelpCircle, MessageSquare, Phone, Mail,
  User, Shield, Briefcase, CreditCard, Clock,
  FileText, AlertCircle, CheckCircle, ArrowRight,
  Home as HomeIcon, Users, Settings, Calendar, Eye // ✅ Added Calendar and Eye
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Help Center | Customer Support & FAQ | Nimart',
  description: 'Get help with Nimart. Find answers to common questions, contact support, and learn how to use our service marketplace effectively.',
  keywords: 'Nimart help, customer support, service marketplace help, FAQ, contact support, troubleshooting, how to use Nimart',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/help-center',
    title: 'Help Center | Customer Support & FAQ',
    description: 'Get help with Nimart. Find answers to common questions and contact support',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-help-center.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Help Center'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Customer Support & FAQ',
    description: 'Get help with Nimart. Find answers to common questions',
    images: ['https://nimart.ng/og-help-center.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/help-center',
  },
}

export default function HelpCenterPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I create an account on Nimart?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can create an account by clicking "Sign Up" on the homepage, entering your email and phone number, and verifying your email address.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I find service providers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the search bar on the homepage or browse the marketplace. You can filter by service type, location, ratings, and availability.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Nimart safe to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all providers are verified through ID checks and customer reviews. We also offer customer protection for every booking.'
        }
      }
    ]
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://nimart.ng'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Help Center',
        item: 'https://nimart.ng/links/help-center'
      }
    ]
  }

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Nimart Help Center',
    description: 'Contact Nimart customer support',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+2348038887589',
      email: 'support@nimart.ng',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  }

  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn how to create an account and use Nimart',
      icon: User,
      color: 'bg-blue-100 text-blue-600',
      articles: [
        'How to create an account',
        'How to find service providers',
        'How to book a service',
        'How to pay for services'
      ]
    },
    {
      title: 'Account & Profile',
      description: 'Manage your account settings and profile',
      icon: Settings,
      color: 'bg-green-100 text-green-600',
      articles: [
        'How to update profile information',
        'How to change password',
        'How to manage notifications',
        'How to delete account'
      ]
    },
    {
      title: 'Booking & Services',
      description: 'Learn about booking and service process',
      icon: Calendar, // ✅ Now Calendar is imported and will work
      color: 'bg-purple-100 text-purple-600',
      articles: [
        'How to schedule a service',
        'How to cancel a booking',
        'How to reschedule a service',
        'How to rate a provider'
      ]
    },
    {
      title: 'Safety & Security',
      description: 'Learn about safety features and guidelines',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
      articles: [
        'How we verify providers',
        'Safety tips for customers',
        'How to report issues',
        'Customer protection policy'
      ]
    },
    {
      title: 'Payment & Pricing',
      description: 'Information about payments and pricing',
      icon: CreditCard,
      color: 'bg-yellow-100 text-yellow-600',
      articles: [
        'Payment methods accepted',
        'How to get price estimates',
        'Understanding service fees',
        'Refund policy'
      ]
    },
    {
      title: 'For Providers',
      description: 'Help for service providers',
      icon: Briefcase,
      color: 'bg-indigo-100 text-indigo-600',
      articles: [
        'How to register as provider',
        'How to manage bookings',
        'How to get verified',
        'Provider commission rates'
      ]
    }
  ]

  const popularArticles = [
    {
      title: 'How to create an account on Nimart',
      category: 'Getting Started',
      views: '1.2k'
    },
    {
      title: 'How to find and book service providers',
      category: 'Booking & Services',
      views: '980'
    },
    {
      title: 'Understanding provider verification',
      category: 'Safety & Security',
      views: '850'
    },
    {
      title: 'Payment methods and security',
      category: 'Payment & Pricing',
      views: '720'
    },
    {
      title: 'How to cancel or reschedule a booking',
      category: 'Booking & Services',
      views: '650'
    },
    {
      title: 'How to register as a service provider',
      category: 'For Providers',
      views: '580'
    }
  ]

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: Mail,
      contact: 'support@nimart.ng',
      response: 'Within 24 hours'
    },
    {
      title: 'Phone Support',
      description: 'Call our support team',
      icon: Phone,
      contact: '+234 803 888 7589',
      response: 'Mon-Fri, 9AM-6PM'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our team',
      icon: MessageSquare,
      contact: 'Click chat button',
      response: 'Within 15 minutes'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              How can we help you?
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Find answers, guides, and contact information
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find help articles organized by topic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${category.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <Link href="#" className="text-primary hover:text-green-700 flex items-center text-sm">
                        <ArrowRight className="h-3 w-3 mr-2" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Popular Articles */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Popular Help Articles
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Most frequently viewed articles by our users
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" /> {/* ✅ Now Eye is imported and will work */}
                      {article.views} views
                    </div>
                  </div>
                  <Link href="#" className="text-primary hover:text-green-700 ml-4">
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Still need help?
            </h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
              Contact our support team for personalized assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                  <p className="opacity-90 mb-4">{option.description}</p>
                  <div className="space-y-2">
                    <div className="text-lg font-medium">{option.contact}</div>
                    <div className="text-sm opacity-80">Response: {option.response}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Quick Links
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Other resources you might find helpful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/links/how-it-works"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
                How It Works
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how to use Nimart to find and book service providers
              </p>
              <div className="text-primary font-medium flex items-center">
                Learn more
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/provider/register"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
                Become a Provider
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how to register and start offering services on Nimart
              </p>
              <div className="text-primary font-medium flex items-center">
                Get started
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/links/privacy-policy"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
                Privacy Policy
              </h3>
              <p className="text-gray-600 mb-4">
                Read about how we protect your data and privacy
              </p>
              <div className="text-primary font-medium flex items-center">
                Read policy
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}