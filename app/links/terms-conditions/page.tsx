// app/links/terms-conditions/page.tsx - FIXED VERSION
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
  User, FileText, AlertTriangle, Info, BookOpen,
  Download, // ✅ Added Download import
  Share2, Globe, Smartphone, Laptop,
  ShieldCheck, Lock, Eye, Bell, BarChart,
  TrendingUp, Award, Target, Heart, ThumbsUp,
  ChevronLeft, X, Menu, Book, Scale,
  Building, Users as UsersIcon, ClipboardCheck,
  Ban, Key, Shield as ShieldIcon, Globe as GlobeIcon,
  FileText as FileTextIcon, ExternalLink
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Terms and Conditions | Nimart Service Agreement',
  description: 'Read Nimart terms and conditions. Learn about user agreements, service provider terms, booking policies, and legal information for using our service marketplace.',
  keywords: 'Nimart terms and conditions, user agreement, service provider terms, booking policy, legal terms, marketplace terms, customer agreement',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/terms-conditions',
    title: 'Terms and Conditions | Nimart Service Agreement',
    description: 'Read Nimart terms and conditions and user agreements',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-terms.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Terms and Conditions'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions | Nimart Service Agreement',
    description: 'Read Nimart terms and conditions and user agreements',
    images: ['https://nimart.ng/og-terms.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/terms-conditions',
  },
}

export default function TermsConditionsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms and Conditions',
    description: 'Nimart service marketplace terms and conditions',
    url: 'https://nimart.ng/links/terms-conditions',
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
        name: 'Terms and Conditions',
        item: 'https://nimart.ng/links/terms-conditions'
      }
    ]
  }

  const legalDocumentSchema = {
    '@context': 'https://schema.org',
    '@type': 'LegalDocument',
    name: 'Nimart Terms and Conditions',
    datePublished: '2024-01-01',
    author: {
      '@type': 'Organization',
      name: 'Nimart'
    }
  }

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalDocumentSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Terms and Conditions
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Last updated: January 1, 2024
            </p>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#overview" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Overview
              </a>
              <a href="#user-agreement" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                User Agreement
              </a>
              <a href="#provider-terms" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Provider Terms
              </a>
              <a href="#payment-terms" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Payment Terms
              </a>
              <a href="#legal" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Legal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Download Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nimart Service Agreement</h2>
            <p className="text-gray-600 mt-2">Effective from January 1, 2024</p>
          </div>
          <div className="lg:w-1/3 mt-6 lg:mt-0 lg:text-right">
            <button className="bg-white text-primary font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center lg:justify-end w-full lg:w-auto">
              <Download className="h-5 w-5 mr-2" /> {/* ✅ Now Download will work */}
              Download PDF
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Overview */}
          <section id="overview" className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-blue-100 mr-3">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Overview</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                Welcome to Nimart. These Terms and Conditions ("Terms") govern your use of the Nimart platform, website, mobile application, and services (collectively, the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 mb-4">
                Nimart is a service marketplace connecting customers with verified service providers across Nigeria. The Platform facilitates the booking, scheduling, and payment for various services.
              </p>
            </div>
          </section>

          {/* User Agreement */}
          <section id="user-agreement" className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-green-100 mr-3">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. User Agreement</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-3">2.1 User Eligibility</h3>
              <p className="text-gray-700 mb-4">
                To use Nimart, you must:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Have legal capacity to enter into contracts</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.2 Account Registration</h3>
              <p className="text-gray-700 mb-4">
                Users must create an account to access certain features. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>All activities under your account</li>
                <li>Maintaining accurate account information</li>
                <li>Promptly updating any changes to your information</li>
                <li>Not sharing account credentials with others</li>
              </ul>
            </div>
          </section>

          {/* Provider Terms */}
          <section id="provider-terms" className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-purple-100 mr-3">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Service Provider Terms</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-3">3.1 Provider Registration</h3>
              <p className="text-gray-700 mb-4">
                Service providers must complete verification before offering services. Requirements include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Valid government-issued identification</li>
                <li>Proof of professional qualifications (where applicable)</li>
                <li>Business registration documents (for registered businesses)</li>
                <li>Clear background check</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.2 Service Standards</h3>
              <p className="text-gray-700 mb-4">
                Providers must maintain high service standards:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate service descriptions and pricing</li>
                <li>Respond to booking requests within 24 hours</li>
                <li>Arrive on time for scheduled appointments</li>
                <li>Carry necessary tools and equipment</li>
                <li>Maintain professional conduct at all times</li>
              </ul>
            </div>
          </section>

          {/* Payment Terms */}
          <section id="payment-terms" className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-yellow-100 mr-3">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Payment and Fees</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-3">4.1 Service Fees</h3>
              <p className="text-gray-700 mb-4">
                Nimart charges service fees as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Customer service fee: 5% of service value</li>
                <li>Provider commission: 15% of service value</li>
                <li>Payment processing fees may apply</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4.2 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                All payments are processed through secure payment gateways. Nimart holds payments until:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Service is completed satisfactorily</li>
                <li>Customer confirms service completion</li>
                <li>24-hour dispute period has passed</li>
              </ul>
            </div>
          </section>

          {/* Legal */}
          <section id="legal" className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-red-100 mr-3">
                <Scale className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Legal and Dispute Resolution</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-3">5.1 Liability Limitations</h3>
              <p className="text-gray-700 mb-4">
                Nimart acts as a marketplace facilitator and is not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Quality of services provided by independent providers</li>
                <li>Disputes between customers and providers</li>
                <li>Any damages, injuries, or losses during service provision</li>
                <li>Provider compliance with local laws and regulations</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.2 Dispute Resolution</h3>
              <p className="text-gray-700 mb-4">
                In case of disputes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Contact Nimart support within 48 hours of service completion</li>
                <li>Provide evidence (photos, messages, receipts)</li>
                <li>Nimart will mediate and attempt resolution within 7 days</li>
                <li>Unresolved disputes may be referred to Nigerian courts</li>
              </ul>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-gray-50 rounded-lg p-6 mt-8">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Acceptance of Terms</h3>
            </div>
            <p className="text-gray-700">
              By using Nimart, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the Platform.
            </p>
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
            href="/links/cookie-policy"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary">
              Cookie Policy
            </h3>
            <p className="text-gray-600 mb-4">
              Understand how we use cookies and tracking technologies
            </p>
            <div className="text-primary font-medium flex items-center">
              Read policy
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

      {/* Contact */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Questions about our Terms?
          </h2>
          <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Contact our legal team for clarification on any terms
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:legal@nimart.ng"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105"
            >
              <Mail className="h-6 w-6 mr-3" />
              Email Legal Team
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