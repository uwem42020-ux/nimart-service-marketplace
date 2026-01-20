// app/links/about/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Target, Users, Globe, Award, TrendingUp,
  Heart, Shield, Clock, CheckCircle, ArrowRight,
  Home as HomeIcon, Phone, Mail, MapPin,
  Briefcase, Star, Zap, Car, Droplets,
  Hammer, Palette, Scissors, Sparkles, ChefHat
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'About Nimart | Nigeria\'s #1 Service Marketplace Story',
  description: 'Learn about Nimart\'s mission to transform Nigeria\'s service industry. Our story, values, team, and commitment to connecting customers with verified professionals.',
  keywords: 'about Nimart, Nigeria service marketplace, company story, our mission, team Nigeria, service industry transformation, verified professionals platform, Nigerian entrepreneurship',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/about',
    title: 'About Nimart | Nigeria\'s #1 Service Marketplace Story',
    description: 'Learn about Nimart\'s mission to transform Nigeria\'s service industry',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-about.png',
      width: 1200,
      height: 630,
      alt: 'About Nimart'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Nimart | Nigeria\'s #1 Service Marketplace Story',
    description: 'Learn about Nimart\'s mission to transform Nigeria\'s service industry',
    images: ['https://nimart.ng/og-about.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/about',
  },
}

export default function AboutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Nimart',
    description: 'Nigeria\'s premier service marketplace connecting customers with trusted professionals',
    url: 'https://nimart.ng/links/about',
    publisher: {
      '@type': 'Organization',
      name: 'Nimart',
      foundingDate: '2024',
      foundingLocation: 'Abuja, Nigeria',
      numberOfEmployees: '50-100',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Banex Junction',
        addressLocality: 'Wuse',
        addressRegion: 'Abuja Municipal Area Council',
        postalCode: '900001',
        addressCountry: 'Nigeria'
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
        name: 'About Nimart',
        item: 'https://nimart.ng/links/about'
      }
    ]
  }

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'We verify every provider and ensure secure transactions for complete peace of mind'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Our platform is designed with customer satisfaction as the top priority'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Creating economic opportunities and supporting local service professionals'
    },
    {
      icon: Globe,
      title: 'National Reach',
      description: 'Connecting customers and providers across all 36 states in Nigeria'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Setting the highest standards for service quality and professionalism'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology'
    }
  ]

  const milestones = [
    { year: '2023', title: 'Founded', description: 'Nimart was established in Abuja' },
    { year: '2024 Q1', title: 'Platform Launch', description: 'Beta version launched with 500 providers' },
    { year: '2024 Q2', title: 'National Expansion', description: 'Expanded to all 36 states in Nigeria' },
    { year: '2024 Q3', title: '5,000 Providers', description: 'Reached 5,000 verified service providers' },
    { year: '2024 Q4', title: 'Mobile App', description: 'Launched iOS and Android applications' },
    { year: '2025', title: 'Future Goals', description: 'Targeting 50,000 providers and international expansion' }
  ]

  const teamMembers = [
    { name: 'Chinedu Okoro', role: 'CEO & Founder', expertise: 'Tech Entrepreneurship', experience: '10+ years' },
    { name: 'Amina Bello', role: 'COO', expertise: 'Operations Management', experience: '8+ years' },
    { name: 'Emeka Nwankwo', role: 'CTO', expertise: 'Software Development', experience: '12+ years' },
    { name: 'Fatima Abdullahi', role: 'Head of Marketing', expertise: 'Digital Marketing', experience: '7+ years' },
    { name: 'Oluwaseun Adeyemi', role: 'Head of Partnerships', expertise: 'Business Development', experience: '9+ years' },
    { name: 'Ngozi Eze', role: 'Customer Success Lead', expertise: 'Customer Experience', experience: '6+ years' }
  ]

  const impactStats = [
    { value: '5,000+', label: 'Verified Providers', icon: Users },
    { value: '36', label: 'States Covered', icon: MapPin },
    { value: '₦500M+', label: 'Earned by Providers', icon: TrendingUp },
    { value: '50+', label: 'Service Categories', icon: Briefcase },
    { value: '98%', label: 'Customer Satisfaction', icon: Star },
    { value: '24/7', label: 'Support Available', icon: Clock }
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
              Transforming Nigeria's Service Industry
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Connecting customers with trusted professionals across Nigeria
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To empower service professionals and make quality services accessible to every Nigerian 
                by creating Africa's most trusted service marketplace.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Create economic opportunities for service professionals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Make quality services accessible and affordable</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Build trust through verification and quality assurance</span>
                </li>
              </ul>
            </div>
            
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-6">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-6">
                To become Nigeria's #1 service marketplace and the preferred platform for 
                all service needs, recognized for trust, quality, and innovation.
              </p>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3">By 2026, We Aim To:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span>Serve 1 million customers monthly</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span>Empower 50,000 service providers</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span>Expand to 5 additional African countries</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span>Launch advanced AI-powered matching</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transforming lives and businesses across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Our Journey */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From startup to Nigeria's leading service marketplace
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20 hidden lg:block"></div>
            
            <div className="space-y-12 lg:space-y-0">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'} lg:w-1/2 ${index % 2 === 0 ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 lg:left-auto lg:transform-none lg:right-0 w-4 h-4 bg-primary rounded-full border-4 border-white z-10"></div>
                  
                  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'}`}>
                    <div className="text-primary font-bold text-lg mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Leadership Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the passionate team driving Nimart's mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-bold mb-1 text-gray-900">{member.name}</h3>
                <div className="text-primary font-medium mb-2">{member.role}</div>
                <div className="text-sm text-gray-600 mb-3">{member.expertise}</div>
                <div className="text-xs text-gray-500">Experience: {member.experience}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Services We Connect
            </h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
              50+ professional service categories across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Mechanics', icon: Car },
              { name: 'Electricians', icon: Zap },
              { name: 'Plumbers', icon: Droplets },
              { name: 'Carpenters', icon: Hammer },
              { name: 'Painters', icon: Palette },
              { name: 'Tailors', icon: Scissors },
              { name: 'Cleaners', icon: Sparkles },
              { name: 'Chefs', icon: ChefHat },
              { name: 'Drivers', icon: Car },
              { name: 'Technicians', icon: Zap },
              { name: 'Tutors', icon: Users },
              { name: 'Lawyers', icon: Briefcase }
            ].map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium">{service.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-green-600 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Join Our Mission
            </h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you're a customer looking for services or a provider ready to grow your business, 
              join us in transforming Nigeria's service industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/links/marketplace"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              >
                Find Services
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
              <Link
                href="/links/become-a-provider"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                <Briefcase className="h-6 w-6 mr-3" />
                Become a Provider
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Our Office</h3>
              <p className="text-gray-600">
                Banex Junction, Wuse<br />
                Abuja Municipal Area Council<br />
                900001 Federal Capital Territory<br />
                Nigeria
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600">
                Phone: +234 803 888 7589<br />
                Email: info@nimart.ng<br />
                Hours: Mon-Sun, 9AM-6PM
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Stay Connected</h3>
              <p className="text-gray-600">
                Follow our journey and get updates<br />
                on new services and features
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <a href="https://facebook.com/nimart" className="text-primary hover:text-green-700">
                  <span className="sr-only">Facebook</span>
                  <Users className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/nimartng" className="text-primary hover:text-green-700">
                  <span className="sr-only">Twitter</span>
                  <Globe className="h-5 w-5" />
                </a>
                <a href="https://instagram.com/nimart" className="text-primary hover:text-green-700">
                  <span className="sr-only">Instagram</span>
                  <Heart className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}