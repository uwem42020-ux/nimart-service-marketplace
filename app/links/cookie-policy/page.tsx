// app/links/cookie-policy/page.tsx - FIXED VERSION
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Search, Filter, MapPin, Star, Shield, CheckCircle, 
  Grid, List, ArrowRight, ChevronRight, ChevronDown,
  Car, Zap, Droplets, Hammer, Palette, Scissors,
  Sparkles, ChefHat, Briefcase, Users, Clock,
  Home as HomeIcon, Phone, Mail, Map,
  HelpCircle, MessageSquare, CreditCard, Settings,
  User, FileText, AlertTriangle, Info, BookOpen, // ✅ Added AlertTriangle
  Download, Share2, Globe, Smartphone, Laptop,
  ShieldCheck, Lock, Eye, Bell, BarChart,
  TrendingUp, Award, Target, Heart, ThumbsUp,
  ChevronLeft, X, Menu, Cookie,
  Database, Server, Fingerprint, Shield as ShieldIcon,
  EyeOff, Settings as SettingsIcon, RefreshCw
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cookie Policy | Nimart Cookie Usage & Privacy',
  description: 'Learn how Nimart uses cookies and similar technologies. Understand cookie types, purposes, and how to manage your cookie preferences for optimal browsing experience.',
  keywords: 'Nimart cookie policy, cookie usage, privacy cookies, tracking technologies, cookie management, GDPR compliance, Nigeria cookie law',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/cookie-policy',
    title: 'Cookie Policy | Nimart Cookie Usage & Privacy',
    description: 'Learn how Nimart uses cookies and similar technologies',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-cookie-policy.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Cookie Policy'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | Nimart Cookie Usage & Privacy',
    description: 'Learn how Nimart uses cookies and similar technologies',
    images: ['https://nimart.ng/og-cookie-policy.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/cookie-policy',
  },
}

export default function CookiePolicyPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cookie Policy',
    description: 'Nimart cookie usage and privacy policy',
    url: 'https://nimart.ng/links/cookie-policy',
    publisher: {
      '@type': 'Organization',
      name: 'Nimart',
      logo: 'https://nimart.ng/logo.png'
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
        name: 'Cookie Policy',
        item: 'https://nimart.ng/links/cookie-policy'
      }
    ]
  }

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'Required for basic website functionality',
      purpose: 'Enable core features like security, network management, and accessibility',
      duration: 'Session or persistent',
      examples: ['Authentication cookies', 'Security tokens', 'Load balancing cookies'],
      icon: Shield,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: 'Performance Cookies',
      description: 'Collect anonymous data for website improvement',
      purpose: 'Help understand how visitors interact with our website',
      duration: 'Up to 2 years',
      examples: ['Google Analytics', 'Heat mapping tools', 'Error tracking'],
      icon: BarChart,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: 'Functional Cookies',
      description: 'Remember your preferences and choices',
      purpose: 'Provide enhanced, more personal features',
      duration: 'Up to 1 year',
      examples: ['Language preferences', 'Region settings', 'Customized content'],
      icon: Settings,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      name: 'Targeting/Advertising Cookies',
      description: 'Used to deliver relevant advertisements',
      purpose: 'Track browsing habits to display relevant ads',
      duration: 'Up to 1 year',
      examples: ['Social media cookies', 'Advertising network cookies', 'Retargeting cookies'],
      icon: Target,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ]

  const thirdPartyCookies = [
    {
      provider: 'Google Analytics',
      purpose: 'Website analytics and performance measurement',
      cookies: ['_ga', '_gid', '_gat'],
      privacy: 'https://policies.google.com/privacy'
    },
    {
      provider: 'Facebook',
      purpose: 'Social media integration and advertising',
      cookies: ['fr', 'xs', 'c_user'],
      privacy: 'https://www.facebook.com/policies/cookies/'
    },
    {
      provider: 'Stripe',
      purpose: 'Payment processing and fraud prevention',
      cookies: ['__stripe_mid', '__stripe_sid'],
      privacy: 'https://stripe.com/privacy'
    }
  ]

  const browserInstructions = [
    {
      browser: 'Google Chrome',
      steps: [
        'Click the three dots menu in the top right',
        'Select "Settings" then "Privacy and security"',
        'Click "Cookies and other site data"',
        'Choose your preferred cookie settings'
      ]
    },
    {
      browser: 'Mozilla Firefox',
      steps: [
        'Click the menu button and select "Settings"',
        'Select "Privacy & Security" panel',
        'Under "Cookies and Site Data", choose your settings',
        'Click "Manage Data" to remove specific cookies'
      ]
    },
    {
      browser: 'Safari',
      steps: [
        'Choose Safari > Preferences',
        'Click "Privacy"',
        'Under "Cookies and website data", select your option',
        'Click "Manage Website Data" to see stored cookies'
      ]
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
              <Cookie className="h-10 w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Cookie Policy
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Last updated: January 1, 2024
            </p>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#what-are-cookies" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                What are Cookies?
              </a>
              <a href="#types-of-cookies" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Cookie Types
              </a>
              <a href="#manage-cookies" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Manage Cookies
              </a>
              <a href="#contact" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                This Cookie Policy explains how Nimart ("we", "us", or "our") uses cookies and similar technologies on our website and mobile application. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
              <p className="text-gray-700 mb-4">
                In some cases, we may use cookies to collect personal information, or information that becomes personal information if we combine it with other information. For more information about how we protect your personal information, please see our <Link href="/links/privacy-policy" className="text-primary hover:text-green-700">Privacy Policy</Link>.
              </p>
            </div>
          </section>

          {/* What are Cookies */}
          <section id="what-are-cookies" className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Database className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">How Cookies Work</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Store small amounts of data on your device</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Recognize your device on return visits</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Enable certain website functionalities</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">Cookie Duration</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Session Cookies:</span> Temporary, deleted when you close browser
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Persistent Cookies:</span> Remain until expiry or manual deletion
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Types of Cookies */}
          <section id="types-of-cookies" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {cookieTypes.map((type, index) => {
                const Icon = type.icon
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-lg ${type.color} mr-3`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                        <p className="text-gray-600">{type.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Purpose</h4>
                        <p className="text-gray-700">{type.purpose}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Duration</h4>
                        <p className="text-gray-700">{type.duration}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-bold text-gray-900 mb-2">Examples</h4>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Essential Cookies Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-yellow-100 mr-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" /> {/* ✅ Now AlertTriangle will work */}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Essential Cookies</h4>
                  <p className="text-gray-700 mt-1">
                    Essential cookies cannot be disabled as they are necessary for the website to function properly. These cookies do not store any personally identifiable information.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide other services on our website.
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example Cookies</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privacy Policy</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {thirdPartyCookies.map((service, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.provider}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {service.purpose}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex flex-wrap gap-1">
                            {service.cookies.map((cookie, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {cookie}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <a href={service.privacy} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-green-700">
                            View Policy
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Manage Cookies */}
          <section id="manage-cookies" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">How to Manage Cookies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Browser Settings</h3>
                <p className="text-gray-700 mb-6">
                  Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may affect your experience on our website.
                </p>
                
                <div className="space-y-6">
                  {browserInstructions.map((browser, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3">{browser.browser}</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                        {browser.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cookie Preferences</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Essential Cookies</h4>
                        <p className="text-sm text-gray-600">Required for basic functionality</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="opacity-0 w-0 h-0" checked disabled />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-green-600 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Performance Cookies</h4>
                        <p className="text-sm text-gray-600">Help us improve our website</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="opacity-0 w-0 h-0" defaultChecked />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full transition-transform"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Functional Cookies</h4>
                        <p className="text-sm text-gray-600">Remember your preferences</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="opacity-0 w-0 h-0" defaultChecked />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full transition-transform"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Advertising Cookies</h4>
                        <p className="text-sm text-gray-600">Show relevant advertisements</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="opacity-0 w-0 h-0" />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full transition-transform"></span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Updates</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-gray-700">
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies and similar technologies.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-primary mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
            </div>
            <p className="text-gray-700 mb-4">
              If you have any questions about our Cookie Policy, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">privacy@nimart.ng</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">+234 803 888 7589</span>
              </div>
              <div className="flex items-center">
                <Map className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Nimart Nigeria, Privacy Team</span>
              </div>
            </div>
          </section>
        </div>

        {/* Related Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/links/privacy-policy"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
              Privacy Policy
            </h3>
            <p className="text-gray-600 mb-4">
              Learn how we protect your personal information and data
            </p>
            <div className="text-primary font-medium flex items-center">
              Read policy
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/links/terms-conditions"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
              Terms & Conditions
            </h3>
            <p className="text-gray-600 mb-4">
              Read our terms of service and user agreements
            </p>
            <div className="text-primary font-medium flex items-center">
              Read terms
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/links/help-center"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
              Help Center
            </h3>
            <p className="text-gray-600 mb-4">
              Get help with using Nimart and find answers to common questions
            </p>
            <div className="text-primary font-medium flex items-center">
              Get help
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Need Help with Cookie Settings?
          </h2>
          <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Contact our privacy team for assistance with cookie management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@nimart.ng"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105"
            >
              <Mail className="h-6 w-6 mr-3" />
              Email Privacy Team
            </a>
            <Link
              href="/links/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}