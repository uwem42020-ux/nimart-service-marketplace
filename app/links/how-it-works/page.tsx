// app/links/how-it-works/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Search, UserCheck, MessageSquare, Calendar, 
  Star, Shield, CheckCircle, ArrowRight,
  Users, Briefcase, Heart, Clock,
  Home as HomeIcon, Phone, Mail
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'How Nimart Works | Find & Hire Service Providers in Nigeria',
  description: 'Learn how Nimart works. Simple 4-step process to find and hire verified service providers in Nigeria. Search, compare, book, and pay safely.',
  keywords: 'how Nimart works, find service providers Nigeria, hire professionals, book services online, service marketplace Nigeria, verified providers, safe booking',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/how-it-works',
    title: 'How Nimart Works | Find & Hire Service Providers',
    description: 'Simple 4-step process to find and hire verified service providers in Nigeria',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-how-it-works.png',
      width: 1200,
      height: 630,
      alt: 'How Nimart Works'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Nimart Works | Find & Hire Service Providers',
    description: 'Simple 4-step process to find and hire verified service providers',
    images: ['https://nimart.ng/og-how-it-works.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/how-it-works',
  },
}

export default function HowItWorksPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Use Nimart Service Marketplace',
    description: 'Step-by-step guide to finding and hiring service providers on Nimart',
    totalTime: 'PT15M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'NGN',
      value: '0'
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Search for Service',
        text: 'Browse or search for the service you need (e.g., mechanics, electricians, plumbers)',
        url: 'https://nimart.ng/links/marketplace'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Compare Providers',
        text: 'View provider profiles, ratings, reviews, and prices to make an informed choice',
        url: 'https://nimart.ng/links/marketplace'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Book Service',
        text: 'Select your preferred provider and schedule an appointment',
        url: 'https://nimart.ng/bookings'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Get Service Done',
        text: 'Provider arrives and completes the service to your satisfaction',
        url: 'https://nimart.ng/bookings'
      }
    ],
    supply: ['Smartphone or Computer', 'Internet Connection'],
    tool: ['Nimart Website or Mobile App']
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Nimart free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Nimart is completely free for customers to search, compare, and book services. Providers pay a small commission only after successfully completing a job.'
        }
      },
      {
        '@type': 'Question',
        name: 'How are providers verified?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All providers undergo a strict verification process including ID verification, business registration checks, and customer reviews before being listed on our platform.'
        }
      },
      {
        '@type': 'Question',
        name: 'What if I\'m not satisfied with the service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a satisfaction guarantee. If you\'re not happy with the service, contact our support team within 24 hours and we\'ll help resolve the issue or find you another provider.'
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
        name: 'How It Works',
        item: 'https://nimart.ng/links/how-it-works'
      }
    ]
  }

  const steps = [
    {
      number: '01',
      title: 'Search & Find',
      description: 'Browse or search for the service you need. Filter by location, ratings, and service type.',
      icon: Search,
      color: 'bg-blue-100 text-blue-600',
      details: [
        'Search across 50+ service categories',
        'Filter by location, ratings, and availability',
        'View provider profiles and portfolios'
      ]
    },
    {
      number: '02',
      title: 'Compare & Choose',
      description: 'Compare providers based on ratings, reviews, experience, and pricing.',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      details: [
        'Read customer reviews and ratings',
        'Compare experience and qualifications',
        'Check response time and availability'
      ]
    },
    {
      number: '03',
      title: 'Book & Schedule',
      description: 'Book your preferred provider and schedule a convenient time.',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      details: [
        'Book instantly online',
        'Schedule for any date and time',
        'Receive instant confirmation'
      ]
    },
    {
      number: '04',
      title: 'Enjoy & Review',
      description: 'Get your service done and leave a review to help others.',
      icon: Star,
      color: 'bg-orange-100 text-orange-600',
      details: [
        'Track provider arrival',
        'Pay securely after service',
        'Leave honest reviews'
      ]
    }
  ]

  const benefits = [
    {
      title: 'Verified Providers',
      description: 'All providers undergo strict verification including ID and business registration checks.',
      icon: Shield
    },
    {
      title: 'Safe & Secure',
      description: 'Secure payments and customer protection guarantee for every booking.',
      icon: CheckCircle
    },
    {
      title: 'Quick Response',
      description: 'Most providers respond within 1 hour and can be scheduled same-day.',
      icon: Clock
    },
    {
      title: 'Customer Reviews',
      description: 'Read genuine reviews from previous customers before making your choice.',
      icon: Heart
    }
  ]

  const faqs = [
    {
      question: 'Is Nimart free to use?',
      answer: 'Yes, Nimart is completely free for customers to search, compare, and book services. Providers pay a small commission only after successfully completing a job.'
    },
    {
      question: 'How are providers verified?',
      answer: 'All providers undergo a strict verification process including ID verification, business registration checks, and customer reviews before being listed on our platform.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We offer a satisfaction guarantee. If you\'re not happy with the service, contact our support team within 24 hours and we\'ll help resolve the issue or find you another provider.'
    },
    {
      question: 'How do I pay for services?',
      answer: 'You can pay providers directly after service completion using cash, bank transfer, or mobile money. Some providers may offer online payment options.'
    },
    {
      question: 'Can I book services for someone else?',
      answer: 'Yes, you can book services for friends, family, or as a gift. Just specify the details during booking.'
    },
    {
      question: 'How quickly can I get a service provider?',
      answer: 'Many providers offer same-day service. You can filter by availability to find providers who can come immediately.'
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              How Nimart Works
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Simple 4-step process to find and hire trusted service professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/links/marketplace"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              >
                Browse Services
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
              <Link
                href="/provider/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                <Briefcase className="h-6 w-6 mr-3" />
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Simple 4-Step Process
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From finding the right provider to getting your service completed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold z-10">
                  {step.number}
                </div>
                
                {/* Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 h-full relative overflow-hidden">
                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} mb-6 relative z-10`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  
                  {/* Details */}
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Choose Nimart?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our customer-first approach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Find answers to common questions about using Nimart
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-3 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Nimart for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/links/marketplace"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              Find a Provider Now
              <ArrowRight className="h-6 w-6 ml-3" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
            >
              <MessageSquare className="h-6 w-6 mr-3" />
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}