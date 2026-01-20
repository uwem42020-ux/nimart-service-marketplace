// app/links/contact/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Mail, Phone, MapPin, MessageSquare, Clock,
  CheckCircle, ArrowRight, Home as HomeIcon,
  Facebook, Instagram, Youtube, Twitter,
  HelpCircle, Briefcase, Users
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Contact Us | Get in Touch with Nimart Support',
  description: 'Contact Nimart customer support. Get help with bookings, provider registration, or general inquiries. We\'re here to help you 7 days a week.',
  keywords: 'contact Nimart, customer support, help center, service marketplace support, provider support, booking help, Nigeria service support',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/contact',
    title: 'Contact Us | Get in Touch with Nimart Support',
    description: 'Contact Nimart customer support for help with bookings, provider registration, or general inquiries',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-contact.png',
      width: 1200,
      height: 630,
      alt: 'Contact Nimart'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Get in Touch with Nimart Support',
    description: 'Contact Nimart customer support for help with bookings or provider registration',
    images: ['https://nimart.ng/og-contact.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/contact',
  },
}

export default function ContactPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Nimart Contact Page',
    description: 'Contact Nimart customer support',
    url: 'https://nimart.ng/links/contact',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+2348038887589',
      email: 'support@nimart.ng',
      contactType: 'customer service',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '18:00'
      }
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Banex Junction',
      addressLocality: 'Wuse',
      addressRegion: 'Abuja Municipal Area Council',
      postalCode: '900001',
      addressCountry: 'Nigeria'
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
        name: 'Contact Us',
        item: 'https://nimart.ng/links/contact'
      }
    ]
  }

  const contactInfo = [
    {
      title: 'Customer Support',
      description: 'For customer inquiries and support',
      icon: HelpCircle,
      details: [
        { type: 'Email', value: 'support@nimart.ng', icon: Mail },
        { type: 'Phone', value: '+234 803 888 7589', icon: Phone },
        { type: 'Hours', value: 'Mon-Sun, 9AM-6PM', icon: Clock }
      ]
    },
    {
      title: 'Provider Support',
      description: 'For service provider inquiries',
      icon: Briefcase,
      details: [
        { type: 'Email', value: 'providers@nimart.ng', icon: Mail },
        { type: 'Phone', value: '+234 803 888 7589', icon: Phone },
        { type: 'Hours', value: 'Mon-Fri, 9AM-5PM', icon: Clock }
      ]
    },
    {
      title: 'Business Inquiries',
      description: 'For partnerships and business opportunities',
      icon: Users,
      details: [
        { type: 'Email', value: 'business@nimart.ng', icon: Mail },
        { type: 'Phone', value: '+234 803 888 7589', icon: Phone },
        { type: 'Hours', value: 'Mon-Fri, 10AM-4PM', icon: Clock }
      ]
    }
  ]

  const socialMedia = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/nimart', handle: '@nimart' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/nimart', handle: '@nimart' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/nimartng', handle: '@nimartng' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@nimart', handle: '@nimart' }
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Get in Touch
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              We're here to help you with any questions or concerns
            </p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{info.title}</h3>
                <p className="text-gray-600 mb-6">{info.description}</p>
                <div className="space-y-4">
                  {info.details.map((detail, idx) => {
                    const DetailIcon = detail.icon
                    return (
                      <div key={idx} className="flex items-start">
                        <div className="p-2 rounded-lg bg-gray-50 mr-3">
                          <DetailIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">{detail.type}</div>
                          <div className="font-medium text-gray-900">{detail.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact Form & Address */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
                Send us a message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="+234 800 000 0000"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="customer-support">Customer Support</option>
                    <option value="provider-support">Provider Support</option>
                    <option value="business-inquiry">Business Inquiry</option>
                    <option value="technical-issue">Technical Issue</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Send Message
                  <ArrowRight className="h-5 w-5 ml-2 inline" />
                </button>
              </form>
            </div>

            {/* Address & Social */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
                Visit Our Office
              </h2>
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 mr-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Office Address</h3>
                    <address className="not-italic text-gray-600 space-y-2">
                      <p>Banex Junction</p>
                      <p>Wuse, Abuja Municipal Area Council</p>
                      <p>900001 Federal Capital Territory</p>
                      <p>Nigeria</p>
                    </address>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-gray-100 mr-3">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Business Hours</div>
                      <div className="font-medium text-gray-900">Monday - Sunday: 9:00 AM - 6:00 PM</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-gray-100 mr-3">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Phone Number</div>
                      <div className="font-medium text-gray-900">+234 803 888 7589</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 text-gray-900">Connect With Us</h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialMedia.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-primary/10 transition-colors mr-3">
                            <Icon className="h-5 w-5 text-gray-600 group-hover:text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                              {social.name}
                            </div>
                            <div className="text-sm text-gray-500">{social.handle}</div>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-8 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-white/20 mr-4">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Need immediate help?</h3>
                    <p className="opacity-90 mb-4">Check our FAQ for quick answers to common questions</p>
                  </div>
                </div>
                <Link
                  href="/links/help-center"
                  className="inline-flex items-center justify-center w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors mt-4"
                >
                  Visit Help Center
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              Find Us on the Map
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our office is located in the heart of Abuja, easily accessible from all parts of the city
            </p>
          </div>
          
          {/* Map Container */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative">
              {/* Map placeholder - replace with actual map component */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Banex Junction, Wuse, Abuja</p>
                  <p className="text-sm text-gray-500 mt-2">Interactive map would be displayed here</p>
                </div>
              </div>
              
              {/* Map pin */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Distance from Airport</div>
                <div className="font-bold text-gray-900">40 minutes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Parking Available</div>
                <div className="font-bold text-gray-900">Yes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Nearest Metro</div>
                <div className="font-bold text-gray-900">10 minutes walk</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}