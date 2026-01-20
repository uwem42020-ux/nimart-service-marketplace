// app/links/provider-benefits/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  DollarSign, Users, Shield, TrendingUp, Clock,
  MapPin, Award, Zap, Star, Briefcase,
  MessageSquare, Phone, Mail, ArrowRight,
  Home as HomeIcon, CheckCircle, BarChart,
  Heart, Globe, Lock, Download
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Provider Benefits | Advantages of Joining Nimart Marketplace',
  description: 'Discover the benefits of becoming a Nimart service provider. Get verified, reach more customers, earn competitively, flexible scheduling, business growth support, and professional tools.',
  keywords: 'Nimart provider benefits, service provider advantages, verified professional benefits, earn more Nigeria, flexible work schedule, business growth support, professional tools providers',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/provider-benefits',
    title: 'Provider Benefits | Advantages of Joining Nimart Marketplace',
    description: 'Discover the benefits of becoming a Nimart service provider',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-provider-benefits.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Provider Benefits'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Provider Benefits | Advantages of Joining Nimart Marketplace',
    description: 'Discover the benefits of becoming a Nimart service provider',
    images: ['https://nimart.ng/og-provider-benefits.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/provider-benefits',
  },
}

export default function ProviderBenefitsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Nimart Provider Benefits',
    description: 'Comprehensive list of benefits for service providers on Nimart marketplace',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          name: 'Increased Earnings',
          description: 'Competitive pricing and high demand services'
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          name: 'Verification Badge',
          description: 'Build trust with customers through verification'
        }
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          name: 'Flexible Scheduling',
          description: 'Work when you want, control your schedule'
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
        name: 'Provider Benefits',
        item: 'https://nimart.ng/links/provider-benefits'
      }
    ]
  }

  const mainBenefits = [
    {
      icon: DollarSign,
      title: 'Increased Earnings',
      description: 'Set competitive prices and earn what you deserve',
      stats: 'Average 40% increase in monthly income',
      features: [
        'Competitive pricing recommendations',
        'No price caps - set your own rates',
        'Weekly direct bank payments',
        'Bonus opportunities for top performers'
      ]
    },
    {
      icon: Users,
      title: 'Access to Customers',
      description: 'Reach thousands of customers looking for your services',
      stats: '5,000+ daily customer searches',
      features: [
        'Featured provider listings',
        'Customer reviews and ratings',
        'Direct booking requests',
        'Repeat customer opportunities'
      ]
    },
    {
      icon: Shield,
      title: 'Verification Badge',
      description: 'Build trust and credibility with customers',
      stats: '90% higher booking rate for verified providers',
      features: [
        'Official verification badge',
        'Priority in search results',
        'Customer protection guarantee',
        'Enhanced business credibility'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Business Growth',
      description: 'Tools and support to grow your business',
      stats: 'Average 200% growth in first year',
      features: [
        'Marketing and promotion support',
        'Business analytics dashboard',
        'Customer feedback system',
        'Growth strategy guidance'
      ]
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Work when you want, control your own time',
      stats: 'Complete control over your availability',
      features: [
        'Set your own working hours',
        'Accept or decline bookings',
        'Schedule management tools',
        'Time-off requests system'
      ]
    },
    {
      icon: MapPin,
      title: 'Local Exposure',
      description: 'Get discovered by customers in your area',
      stats: 'Target customers within 10km radius',
      features: [
        'Local search optimization',
        'Area-specific promotions',
        'Community recognition',
        'Neighborhood partnerships'
      ]
    }
  ]

  const toolsFeatures = [
    {
      icon: BarChart,
      title: 'Analytics Dashboard',
      description: 'Track your earnings, bookings, and customer reviews'
    },
    {
      icon: MessageSquare,
      title: 'Communication Tools',
      description: 'Built-in messaging and notification system'
    },
    {
      icon: Briefcase,
      title: 'Portfolio Management',
      description: 'Showcase your work with photos and descriptions'
    },
    {
      icon: Star,
      title: 'Review System',
      description: 'Collect and manage customer reviews'
    },
    {
      icon: Globe,
      title: 'Online Presence',
      description: 'Professional profile visible to thousands'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Safe and reliable payment processing'
    }
  ]

  const successStories = [
    {
      name: 'Chinedu Okafor',
      service: 'Electrician',
      location: 'Lagos',
      story: 'Increased monthly earnings from ₦80,000 to ₦250,000',
      duration: '6 months on Nimart'
    },
    {
      name: 'Amina Yusuf',
      service: 'Tailor',
      location: 'Abuja',
      story: 'Grew customer base from 20 to 150+ regular clients',
      duration: '8 months on Nimart'
    },
    {
      name: 'Emeka Nwosu',
      service: 'Mechanic',
      location: 'Port Harcourt',
      story: 'Expanded business and hired 3 assistants',
      duration: '1 year on Nimart'
    },
    {
      name: 'Fatima Bello',
      service: 'Cleaner',
      location: 'Kano',
      story: 'Started with 2 clients, now manages 8 weekly contracts',
      duration: '4 months on Nimart'
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <Award className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Why Choose Nimart?
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Discover the benefits of joining Nigeria's #1 service marketplace
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/provider/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              >
                Join Now
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
              <Link
                href="/links/become-a-provider"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                How to Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">40%</div>
              <div className="text-gray-600">Average Income Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">90%</div>
              <div className="text-gray-600">Higher Booking Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-gray-600">Daily Customer Searches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">200%</div>
              <div className="text-gray-600">Average Business Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Benefits */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Comprehensive Benefits Package
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed as a service professional
            </p>
          </div>

          <div className="space-y-8">
            {mainBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="lg:w-1/4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Impact</div>
                          <div className="font-bold text-primary">{benefit.stats}</div>
                        </div>
                      </div>
                      
                      <div className="lg:w-3/4">
                        <p className="text-lg text-gray-600 mb-6">{benefit.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {benefit.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Professional Tools */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Professional Tools & Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed specifically for service providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsFeatures.map((tool, index) => {
              const Icon = tool.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{tool.title}</h3>
                  <p className="text-gray-600">{tool.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
              Real providers sharing their Nimart success journeys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="mb-4">
                  <div className="text-lg font-bold">{story.name}</div>
                  <div className="text-sm opacity-90">{story.service} • {story.location}</div>
                </div>
                <p className="mb-4">{story.story}</p>
                <div className="text-sm opacity-80">{story.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support & Training */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Support & Training
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're with you every step of the way
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">24/7 Support</h3>
              <p className="text-gray-600 mb-4">Dedicated provider support team available round the clock</p>
              <a href="tel:+2348038887589" className="text-primary font-medium hover:underline">
                Call: +234 803 888 7589
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Training Resources</h3>
              <p className="text-gray-600 mb-4">Free training materials and guides for success</p>
              <Link href="/provider/resources" className="text-primary font-medium hover:underline">
                Access Resources
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Community</h3>
              <p className="text-gray-600 mb-4">Join our provider community for networking and support</p>
              <Link href="/provider/community" className="text-primary font-medium hover:underline">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary to-green-600 rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Experience These Benefits?
            </h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful providers on Nimart today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/provider/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              >
                Start Registration
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
              <a
                href="mailto:providers@nimart.ng"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                <Mail className="h-6 w-6 mr-3" />
                Email Questions
              </a>
            </div>
            
            <div className="mt-8 text-sm opacity-80">
              Have questions? Our team is here to help. Contact us anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}