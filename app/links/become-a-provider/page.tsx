// app/links/become-a-provider/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Briefcase, CheckCircle, Shield, Users, Clock,
  DollarSign, TrendingUp, MapPin, ArrowRight,
  Home as HomeIcon, Mail, Phone, Star, Award,
  Zap, Car, Droplets, Hammer, Palette,
  Scissors, Sparkles, ChefHat, Calculator
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Become a Service Provider | Join Nimart Marketplace Nigeria',
  description: 'Register as a service provider on Nimart. Earn money offering services like mechanics, electricians, plumbers, carpenters, painters, tailors, cleaners, chefs & more. Verified professionals only.',
  keywords: 'become service provider Nigeria, register as service provider, join Nimart marketplace, earn money Nigeria, professional services Nigeria, verified providers, mechanic registration, electrician registration, plumber registration',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/become-a-provider',
    title: 'Become a Service Provider | Join Nimart Marketplace',
    description: 'Register as a service provider and start earning on Nigeria\'s #1 service marketplace',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-become-provider.png',
      width: 1200,
      height: 630,
      alt: 'Become a Nimart Service Provider'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Service Provider | Join Nimart Marketplace',
    description: 'Register as a service provider and start earning on Nigeria\'s #1 service marketplace',
    images: ['https://nimart.ng/og-become-provider.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/become-a-provider',
  },
}

export default function BecomeProviderPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Become a Service Provider on Nimart',
    description: 'Step-by-step guide to registering as a service provider on Nimart marketplace',
    totalTime: 'PT30M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'NGN',
      value: '0'
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Account',
        text: 'Sign up with your email and phone number',
        url: 'https://nimart.ng/provider/register'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Complete Profile',
        text: 'Add your business information, services, and experience',
        url: 'https://nimart.ng/provider/register'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Get Verified',
        text: 'Submit required documents for verification',
        url: 'https://nimart.ng/provider/register'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Start Earning',
        text: 'Begin receiving booking requests from customers',
        url: 'https://nimart.ng/provider/dashboard'
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
        name: 'Become a Provider',
        item: 'https://nimart.ng/links/become-a-provider'
      }
    ]
  }

  const popularServices = [
    { name: 'Mechanics', icon: Car, earnings: '₦50,000 - ₦200,000/month', demand: 'High' },
    { name: 'Electricians', icon: Zap, earnings: '₦40,000 - ₦150,000/month', demand: 'High' },
    { name: 'Plumbers', icon: Droplets, earnings: '₦35,000 - ₦120,000/month', demand: 'High' },
    { name: 'Carpenters', icon: Hammer, earnings: '₦45,000 - ₦160,000/month', demand: 'Medium' },
    { name: 'Painters', icon: Palette, earnings: '₦30,000 - ₦100,000/month', demand: 'Medium' },
    { name: 'Tailors', icon: Scissors, earnings: '₦25,000 - ₦80,000/month', demand: 'High' },
    { name: 'Cleaners', icon: Sparkles, earnings: '₦20,000 - ₦70,000/month', demand: 'Very High' },
    { name: 'Chefs', icon: ChefHat, earnings: '₦50,000 - ₦180,000/month', demand: 'Medium' },
  ]

  const requirements = [
    'Valid government-issued ID (NIN, Driver\'s License, Voter\'s Card, International Passport)',
    'Proof of address (Utility bill, Bank statement)',
    'Business registration documents (for registered businesses)',
    'Professional certifications (if applicable)',
    'Tax identification number (TIN)',
    'Bank account details for payments',
    'At least 2 years of professional experience',
    'Good customer service skills'
  ]

  const benefits = [
    {
      icon: Users,
      title: 'Access to Customers',
      description: 'Reach thousands of customers looking for your services'
    },
    {
      icon: Shield,
      title: 'Verification Badge',
      description: 'Get verified and build trust with customers'
    },
    {
      icon: DollarSign,
      title: 'Competitive Earnings',
      description: 'Set your own prices and earn what you deserve'
    },
    {
      icon: TrendingUp,
      title: 'Business Growth',
      description: 'Grow your business with our marketing support'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Work when you want, take jobs that fit your schedule'
    },
    {
      icon: MapPin,
      title: 'Local Exposure',
      description: 'Get discovered by customers in your area'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Register Account',
      description: 'Create your provider account with basic information',
      time: '5 minutes'
    },
    {
      number: '02',
      title: 'Complete Profile',
      description: 'Add your services, experience, and portfolio',
      time: '10 minutes'
    },
    {
      number: '03',
      title: 'Get Verified',
      description: 'Submit documents for verification',
      time: '1-2 business days'
    },
    {
      number: '04',
      title: 'Start Earning',
      description: 'Begin receiving and accepting booking requests',
      time: 'Immediate'
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
              <Briefcase className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Start Earning with Your Skills
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Join Nigeria's fastest-growing service marketplace
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/provider/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              >
                Register Now
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
              <Link
                href="#requirements"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                View Requirements
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-gray-600">Active Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">₦500M+</div>
              <div className="text-gray-600">Earned by Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">Service Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">36</div>
              <div className="text-gray-600">States Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Join Nimart?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover the benefits of becoming a verified service provider
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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

      {/* How It Works */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Get Started in 4 Easy Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple registration process to start earning quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-3 mt-4 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {step.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Top Earning Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join thousands of professionals already earning on Nimart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-gray-100 mr-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Average Earnings</div>
                      <div className="font-bold text-primary">{service.earnings}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Market Demand</div>
                      <div className={`font-medium ${service.demand === 'Very High' ? 'text-red-600' : service.demand === 'High' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {service.demand}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div id="requirements" className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Requirements to Join
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ensure you meet these requirements before applying
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-8">
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-2">Important Notes:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Verification usually takes 1-2 business days</li>
                  <li>• All documents are kept confidential and secure</li>
                  <li>• No registration fee required</li>
                  <li>• Commission only applies on completed bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Simple Commission Structure
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fair pricing with maximum earnings for you
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Calculator className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Commission Rate</h3>
                  <div className="text-4xl font-bold text-primary mb-2">15%</div>
                  <p className="text-gray-600">Per completed booking</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Payment Schedule</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-2">Weekly</div>
                  <p className="text-gray-600">Direct to your bank account</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">No Hidden Fees</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-2">Transparent</div>
                  <p className="text-gray-600">Only pay when you earn</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-primary/5 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">Commission Example:</h4>
                <p className="text-gray-600">
                  If you complete a ₦20,000 service booking, Nimart takes ₦3,000 (15%) commission, 
                  and you earn ₦17,000. Payment is processed weekly directly to your bank account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who trust Nimart to grow their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/provider/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              <Briefcase className="h-6 w-6 mr-3" />
              Register Now
            </Link>
            <Link
              href="/links/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
            >
              <Phone className="h-6 w-6 mr-3" />
              Contact Support
            </Link>
          </div>
          
          <div className="mt-8 text-sm opacity-80">
            Questions? Call us at <span className="font-bold">+234 803 888 7589</span> or email <a href="mailto:providers@nimart.ng" className="underline hover:no-underline">providers@nimart.ng</a>
          </div>
        </div>
      </div>
    </div>
  )
}