// app/links/provider-support/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  MessageSquare, Phone, Mail, Clock, Users,
  FileText, Video, Download, Shield, CheckCircle,
  ArrowRight, Home as HomeIcon, HelpCircle,
  Settings, CreditCard, BarChart, TrendingUp,
  AlertCircle, Calendar, MapPin, Briefcase
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Provider Support | Help & Resources for Nimart Service Providers',
  description: 'Get comprehensive support as a Nimart service provider. Access help center, contact support, training resources, FAQ, and business tools to succeed on our marketplace.',
  keywords: 'Nimart provider support, service provider help, provider resources, technical support, business tools, training materials, provider FAQ, commission support',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/provider-support',
    title: 'Provider Support | Help & Resources for Nimart Service Providers',
    description: 'Comprehensive support and resources for Nimart service providers',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-provider-support.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Provider Support'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Provider Support | Help & Resources for Nimart Service Providers',
    description: 'Comprehensive support and resources for Nimart service providers',
    images: ['https://nimart.ng/og-provider-support.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/provider-support',
  },
}

export default function ProviderSupportPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Nimart Provider Support',
    description: 'Support and resources for Nimart service providers',
    url: 'https://nimart.ng/links/provider-support',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+2348038887589',
      email: 'providers@nimart.ng',
      contactType: 'technical support',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00'
      }
    }
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
        name: 'Provider Support',
        item: 'https://nimart.ng/links/provider-support'
      }
    ]
  }

  const supportChannels = [
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      icon: Phone,
      contact: '+234 803 888 7589',
      hours: 'Mon-Sun, 8AM-8PM',
      response: 'Immediate',
      bestFor: 'Urgent issues and complex problems'
    },
    {
      title: 'Email Support',
      description: 'Get detailed assistance via email',
      icon: Mail,
      contact: 'providers@nimart.ng',
      hours: '24/7',
      response: 'Within 4 hours',
      bestFor: 'Documentation, detailed queries, non-urgent matters'
    },
    {
      title: 'Live Chat',
      description: 'Instant messaging with support agents',
      icon: MessageSquare,
      contact: 'Chat button on website',
      hours: 'Mon-Fri, 9AM-6PM',
      response: 'Within 5 minutes',
      bestFor: 'Quick questions and technical issues'
    },
    {
      title: 'Help Center',
      description: 'Self-service articles and guides',
      icon: HelpCircle,
      contact: 'Online knowledge base',
      hours: '24/7',
      response: 'Instant',
      bestFor: 'Common questions and how-to guides'
    }
  ]

  const commonIssues = [
    {
      category: 'Account & Registration',
      issues: [
        'How to reset password',
        'Account verification problems',
        'Profile update issues',
        'Login difficulties'
      ]
    },
    {
      category: 'Bookings & Services',
      issues: [
        'Managing booking requests',
        'Rescheduling appointments',
        'Handling cancellations',
        'Service pricing questions'
      ]
    },
    {
      category: 'Payments & Commissions',
      issues: [
        'Payment processing delays',
        'Commission calculation',
        'Bank account updates',
        'Payment history access'
      ]
    },
    {
      category: 'Technical Issues',
      issues: [
        'App not working',
        'Website errors',
        'Notification problems',
        'Profile visibility issues'
      ]
    }
  ]

  const resources = [
    {
      title: 'Provider Handbook',
      description: 'Complete guide to using Nimart as a provider',
      icon: FileText,
      format: 'PDF',
      size: '2.5 MB',
      link: '/resources/provider-handbook.pdf'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all features',
      icon: Video,
      format: 'Video Series',
      size: '15 videos',
      link: '/resources/video-tutorials'
    },
    {
      title: 'Pricing Guide',
      description: 'How to set competitive prices for your services',
      icon: CreditCard,
      format: 'PDF',
      size: '1.2 MB',
      link: '/resources/pricing-guide.pdf'
    },
    {
      title: 'Business Tools',
      description: 'Templates and tools for business management',
      icon: Settings,
      format: 'Toolkit',
      size: 'Various files',
      link: '/resources/business-tools'
    }
  ]

  const trainingTopics = [
    {
      title: 'Profile Optimization',
      description: 'Learn how to create an attractive provider profile',
      duration: '15 minutes',
      level: 'Beginner'
    },
    {
      title: 'Customer Communication',
      description: 'Best practices for interacting with customers',
      duration: '20 minutes',
      level: 'Intermediate'
    },
    {
      title: 'Pricing Strategy',
      description: 'How to set competitive and profitable prices',
      duration: '25 minutes',
      level: 'Intermediate'
    },
    {
      title: 'Business Growth',
      description: 'Strategies to grow your service business',
      duration: '30 minutes',
      level: 'Advanced'
    }
  ]

  const escalationPaths = [
    {
      level: 'Level 1',
      title: 'Support Team',
      description: 'General support and basic troubleshooting',
      resolution: '1-4 hours'
    },
    {
      level: 'Level 2',
      title: 'Technical Specialists',
      description: 'Advanced technical issues and system problems',
      resolution: '4-24 hours'
    },
    {
      level: 'Level 3',
      title: 'Management Team',
      description: 'Complex issues requiring managerial attention',
      resolution: '24-48 hours'
    },
    {
      level: 'Emergency',
      title: 'Critical Response',
      description: 'System-wide outages and critical business issues',
      resolution: 'Immediate'
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
              <MessageSquare className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Provider Support Center
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Comprehensive support and resources for Nimart service providers
            </p>
          </div>
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{channel.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Contact</div>
                    <div className="font-medium">{channel.contact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Hours</div>
                    <div className="font-medium">{channel.hours}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Best For</div>
                    <div className="text-sm">{channel.bestFor}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Common Issues & Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quick answers to frequently asked questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commonIssues.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">{category.category}</h3>
                <ul className="space-y-3">
                  {category.issues.map((issue, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-primary hover:text-green-700 flex items-center text-sm">
                        <ArrowRight className="h-3 w-3 mr-2" />
                        {issue}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Provider Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Downloadable resources and guides for success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <a
                  key={index}
                  href={resource.link}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                      {resource.format}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{resource.size}</span>
                    <Download className="h-4 w-4" />
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Training Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Training & Development
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Enhance your skills and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainingTopics.map((topic, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${topic.level === 'Beginner' ? 'bg-green-100 text-green-800' : topic.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {topic.level}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {topic.duration}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{topic.title}</h3>
                <p className="text-gray-600 mb-4">{topic.description}</p>
                <button className="text-primary font-medium hover:text-green-700 flex items-center">
                  Start Training
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            ))}
          </div>

          {/* Live Training Sessions */}
          <div className="mt-12 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-2/3">
                <h3 className="text-2xl font-bold mb-4">Live Training Sessions</h3>
                <p className="mb-6 opacity-90">
                  Join our weekly live training sessions with industry experts. 
                  Learn best practices, ask questions, and network with other providers.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Every Wednesday, 6 PM</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Virtual via Zoom</span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 mt-6 lg:mt-0 lg:text-right">
                <button className="bg-white text-primary font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors">
                  Register for Next Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Escalation */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Support Escalation Path
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              How we handle and resolve support issues
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {escalationPaths.map((path, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/4 mb-4 md:mb-0">
                      <div className="inline-flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 3 ? 'bg-red-100 text-red-800' : 'bg-primary/10 text-primary'}`}>
                          {path.level}
                        </div>
                        <div className="ml-4">
                          <div className="font-bold text-gray-900">{path.title}</div>
                          <div className="text-sm text-gray-500">Resolution: {path.resolution}</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-3/4">
                      <p className="text-gray-600">{path.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-gray-900 mb-3">Support Service Level Agreement (SLA)</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• First response time: Within 1 hour for urgent issues</li>
                <li>• Resolution time: 24 hours for standard issues, 48 hours for complex issues</li>
                <li>• Availability: 98% uptime for support channels</li>
                <li>• Satisfaction guarantee: Issue escalation if resolution is unsatisfactory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-3/4">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  For critical issues affecting your business operations, system outages, 
                  or urgent security concerns, contact our emergency support line immediately.
                </p>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-bold text-lg">+234 803 888 7589 (24/7 Emergency Line)</span>
                </div>
              </div>
              <div className="lg:w-1/4 mt-6 lg:mt-0 lg:text-right">
                <div className="bg-red-100 text-red-800 rounded-lg p-4 inline-block">
                  <div className="text-sm font-medium">Emergency Only</div>
                  <div className="text-xs">Critical issues affecting business operations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Need More Help?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Our dedicated provider support team is always ready to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+2348038887589"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              <Phone className="h-6 w-6 mr-3" />
              Call Support Now
            </a>
            <a
              href="mailto:providers@nimart.ng"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
            >
              <Mail className="h-6 w-6 mr-3" />
              Email Support
            </a>
          </div>
          
          <div className="mt-8 text-sm opacity-80">
            Office Hours: Monday - Sunday, 8:00 AM - 8:00 PM WAT
          </div>
        </div>
      </div>
    </div>
  )
}