// app/links/terms-of-service/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  FileText, Scale, Shield, AlertTriangle,
  ArrowRight, Home as HomeIcon, Mail, CheckCircle
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Terms of Service | Nimart Service Marketplace Agreement',
  description: 'Read Nimart\'s Terms of Service. Legal agreement governing your use of our service marketplace platform, including user responsibilities and limitations.',
  keywords: 'Nimart terms of service, user agreement, service marketplace terms, legal agreement, terms and conditions, Nigeria service terms, platform rules',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/terms-of-service',
    title: 'Terms of Service | Nimart Service Marketplace Agreement',
    description: 'Legal agreement governing your use of our service marketplace platform',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-terms.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Terms of Service'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Nimart Service Marketplace Agreement',
    description: 'Legal agreement governing your use of our service marketplace platform',
    images: ['https://nimart.ng/og-terms.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/terms-of-service',
  },
}

export default function TermsOfServicePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TermsOfService',
    name: 'Nimart Terms of Service',
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    publisher: {
      '@type': 'Organization',
      name: 'Nimart',
      url: 'https://nimart.ng'
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
        name: 'Terms of Service',
        item: 'https://nimart.ng/links/terms-of-service'
      }
    ]
  }

  const sections = [
    {
      id: 'acceptance-terms',
      title: '1. Acceptance of Terms',
      content: `
        <p>By accessing or using the Nimart service marketplace platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.</p>
        
        <p>These Terms constitute a legally binding agreement between you and Nimart Nigeria ("Nimart", "we", "us", or "our").</p>
        
        <h4>1.1 Eligibility</h4>
        <p>To use the Platform, you must:</p>
        <ul>
          <li>Be at least 18 years old</li>
          <li>Have the legal capacity to enter into contracts</li>
          <li>Not be prohibited from using the Platform under applicable laws</li>
          <li>Provide accurate and complete registration information</li>
        </ul>
        
        <h4>1.2 Modifications to Terms</h4>
        <p>We reserve the right to modify these Terms at any time. We will notify you of significant changes through the Platform or by email. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.</p>
      `
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      content: `
        <p>For the purposes of these Terms:</p>
        
        <ul>
          <li><strong>"Platform"</strong> refers to the Nimart website, mobile application, and related services.</li>
          <li><strong>"Customer"</strong> refers to any individual or entity using the Platform to find and book services.</li>
          <li><strong>"Provider"</strong> refers to any individual or entity offering services through the Platform.</li>
          <li><strong>"Service"</strong> refers to any professional service offered by a Provider through the Platform.</li>
          <li><strong>"Booking"</strong> refers to an agreement between a Customer and Provider for the provision of Services.</li>
          <li><strong>"Content"</strong> refers to any information, text, images, reviews, or other materials posted on the Platform.</li>
        </ul>
      `
    },
    {
      id: 'account-registration',
      title: '3. Account Registration and Security',
      content: `
        <h4>3.1 Account Creation</h4>
        <p>To use certain features of the Platform, you must create an account. You agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and promptly update your account information</li>
          <li>Maintain the security of your password and account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>
        
        <h4>3.2 Account Types</h4>
        <ul>
          <li><strong>Customer Accounts:</strong> For individuals seeking services</li>
          <li><strong>Provider Accounts:</strong> For verified service professionals</li>
          <li><strong>Business Accounts:</strong> For companies offering multiple services</li>
        </ul>
        
        <h4>3.3 Account Suspension and Termination</h4>
        <p>We reserve the right to suspend or terminate your account if:</p>
        <ul>
          <li>You violate these Terms or applicable laws</li>
          <li>You engage in fraudulent or illegal activities</li>
          <li>You provide false information during registration</li>
          <li>You abuse the Platform or other users</li>
        </ul>
      `
    },
    {
      id: 'platform-use',
      title: '4. Use of the Platform',
      content: `
        <h4>4.1 Permitted Use</h4>
        <p>You may use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul>
          <li>Use the Platform in any way that violates any applicable law or regulation</li>
          <li>Engage in any conduct that restricts or inhibits anyone's use of the Platform</li>
          <li>Impersonate or attempt to impersonate Nimart, a Nimart employee, another user, or any other person or entity</li>
          <li>Engage in any activity that interferes with or disrupts the Platform</li>
          <li>Attempt to gain unauthorized access to any portion of the Platform</li>
        </ul>
        
        <h4>4.2 Content Guidelines</h4>
        <p>When posting content on the Platform, you agree not to:</p>
        <ul>
          <li>Post false, inaccurate, or misleading information</li>
          <li>Post content that is defamatory, obscene, pornographic, or offensive</li>
          <li>Post content that infringes on intellectual property rights</li>
          <li>Post spam, promotional content, or advertisements without authorization</li>
          <li>Post reviews that are not based on genuine experiences</li>
        </ul>
        
        <h4>4.3 Booking Services</h4>
        <p>When booking services through the Platform:</p>
        <ul>
          <li>You agree to provide accurate service requirements and location information</li>
          <li>You agree to pay for services as agreed with the Provider</li>
          <li>You agree to treat Providers with respect and professionalism</li>
          <li>You agree to comply with all applicable laws and regulations</li>
        </ul>
      `
    },
    {
      id: 'provider-terms',
      title: '5. Provider Terms',
      content: `
        <h4>5.1 Provider Responsibilities</h4>
        <p>As a Provider, you agree to:</p>
        <ul>
          <li>Provide accurate information about your qualifications, experience, and services</li>
          <li>Maintain all necessary licenses, permits, and insurance required by law</li>
          <li>Perform services professionally and to the best of your ability</li>
          <li>Respond to booking requests in a timely manner</li>
          <li>Honor agreed-upon prices and service terms</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>
        
        <h4>5.2 Verification Requirements</h4>
        <p>To become a verified Provider, you must:</p>
        <ul>
          <li>Complete the verification process including ID verification</li>
          <li>Provide business registration documents (if applicable)</li>
          <li>Maintain a minimum average rating (as specified in Provider guidelines)</li>
          <li>Complete required training modules (if applicable)</li>
        </ul>
        
        <h4>5.3 Service Fees and Commission</h4>
        <p>Nimart charges a commission on completed bookings. The commission rate will be clearly displayed in your Provider dashboard. You agree to:</p>
        <ul>
          <li>Pay all applicable commissions to Nimart</li>
          <li>Not attempt to circumvent the Platform's payment system</li>
          <li>Not solicit direct bookings from Customers found through the Platform</li>
        </ul>
      `
    },
    {
      id: 'payments-fees',
      title: '6. Payments and Fees',
      content: `
        <h4>6.1 Service Payments</h4>
        <p>All payments for services are processed through the Platform unless otherwise agreed. You agree to:</p>
        <ul>
          <li>Pay all applicable fees for services received</li>
          <li>Provide accurate payment information</li>
          <li>Authorize Nimart to process payments on your behalf</li>
          <li>Pay any applicable taxes on transactions</li>
        </ul>
        
        <h4>6.2 Platform Fees</h4>
        <p>Nimart may charge the following fees:</p>
        <ul>
          <li><strong>Service Fee:</strong> Commission on completed bookings (for Providers)</li>
          <li><strong>Processing Fee:</strong> For payment processing services</li>
          <li><strong>Subscription Fee:</strong> For premium features (if applicable)</li>
        </ul>
        
        <h4>6.3 Refunds and Cancellations</h4>
        <p>Refund and cancellation policies:</p>
        <ul>
          <li>Cancellation fees may apply based on notice period</li>
          <li>Refunds are processed according to our refund policy</li>
          <li>Disputes between Customers and Providers will be mediated by Nimart</li>
          <li>Nimart's decision on disputes is final and binding</li>
        </ul>
      `
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property Rights',
      content: `
        <h4>7.1 Platform Content</h4>
        <p>The Platform and its entire contents, features, and functionality are owned by Nimart and are protected by intellectual property laws. You may not:</p>
        <ul>
          <li>Copy, modify, or create derivative works of the Platform</li>
          <li>Reverse engineer, decompile, or disassemble the Platform</li>
          <li>Remove any copyright or proprietary notices</li>
          <li>Use the Platform for any commercial purpose without authorization</li>
        </ul>
        
        <h4>7.2 User Content</h4>
        <p>By posting content on the Platform, you grant Nimart a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for the purpose of operating the Platform.</p>
        
        <h4>7.3 Trademarks</h4>
        <p>The Nimart name, logo, and all related names, logos, and designs are trademarks of Nimart. You may not use these marks without our prior written permission.</p>
      `
    },
    {
      id: 'disclaimer-warranty',
      title: '8. Disclaimer of Warranties',
      content: `
        <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, NIMART DISCLAIMS ALL WARRANTIES, INCLUDING:</p>
        
        <ul>
          <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
          <li>WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE</li>
          <li>WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE</li>
          <li>WARRANTIES THAT DEFECTS WILL BE CORRECTED</li>
          <li>WARRANTIES REGARDING THE QUALITY, SAFETY, OR LEGALITY OF SERVICES OFFERED BY PROVIDERS</li>
        </ul>
        
        <p>NIMART DOES NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY SERVICE ADVERTISED OR OFFERED BY A PROVIDER THROUGH THE PLATFORM.</p>
      `
    },
    {
      id: 'limitation-liability',
      title: '9. Limitation of Liability',
      content: `
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NIMART SHALL NOT BE LIABLE FOR:</p>
        
        <ul>
          <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
          <li>LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
          <li>DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM</li>
          <li>UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS AND/OR ANY PERSONAL INFORMATION</li>
          <li>ANY ERRORS OR OMISSIONS IN ANY CONTENT OR FOR ANY LOSS OR DAMAGE INCURRED</li>
          <li>THE ACTIONS OR OMISSIONS OF PROVIDERS OR CUSTOMERS</li>
        </ul>
        
        <p>NIMART'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO NIMART IN THE SIX MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
      `
    },
    {
      id: 'indemnification',
      title: '10. Indemnification',
      content: `
        <p>You agree to defend, indemnify, and hold harmless Nimart and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with:</p>
        
        <ul>
          <li>Your use of the Platform or violation of these Terms</li>
          <li>Your violation of any applicable laws or regulations</li>
          <li>Your interactions with other users of the Platform</li>
          <li>Any content you post on the Platform</li>
          <li>Your provision or receipt of services through the Platform</li>
        </ul>
      `
    },
    {
      id: 'dispute-resolution',
      title: '11. Dispute Resolution',
      content: `
        <h4>11.1 Governing Law</h4>
        <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.</p>
        
        <h4>11.2 Dispute Resolution Process</h4>
        <p>Any dispute arising from these Terms or your use of the Platform shall be resolved as follows:</p>
        <ol>
          <li><strong>Informal Negotiation:</strong> Parties shall attempt to resolve the dispute through good faith negotiations</li>
          <li><strong>Mediation:</strong> If negotiation fails, parties shall submit to mediation with a mutually agreed mediator</li>
          <li><strong>Arbitration:</strong> If mediation fails, the dispute shall be resolved by binding arbitration in Abuja, Nigeria</li>
        </ol>
        
        <h4>11.3 Class Action Waiver</h4>
        <p>You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</p>
      `
    },
    {
      id: 'miscellaneous',
      title: '12. Miscellaneous',
      content: `
        <h4>12.1 Entire Agreement</h4>
        <p>These Terms constitute the entire agreement between you and Nimart regarding the Platform and supersede all prior agreements and understandings.</p>
        
        <h4>12.2 Severability</h4>
        <p>If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.</p>
        
        <h4>12.3 Assignment</h4>
        <p>You may not assign or transfer these Terms without our prior written consent. Nimart may assign these Terms without restriction.</p>
        
        <h4>12.4 Force Majeure</h4>
        <p>Nimart shall not be liable for any failure to perform its obligations due to circumstances beyond its reasonable control.</p>
        
        <h4>12.5 Contact Information</h4>
        <p>For questions about these Terms, please contact us:</p>
        <p>Nimart Nigeria<br>
        Banex Junction, Wuse<br>
        Abuja Municipal Area Council, 900001<br>
        Federal Capital Territory, Nigeria<br>
        Email: legal@nimart.ng<br>
        Phone: +234 803 888 7589</p>
      `
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
              <Scale className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Terms of Service
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Effective Date: January 1, 2024
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-12">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Important Legal Notice</h3>
              <p className="text-gray-700">
                These Terms of Service constitute a legally binding agreement between you and Nimart. 
                By using our platform, you acknowledge that you have read, understood, and agree to be 
                bound by these terms. Please read them carefully.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Quick Summary */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Key Points Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">You must be at least 18 years old to use Nimart</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Providers are independent contractors, not employees</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All payments are processed through our secure platform</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">We mediate disputes between customers and providers</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">You maintain ownership of your content</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Terms are governed by Nigerian law</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Table of Contents</h2>
            <nav>
              <ul className="space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a 
                      href={`#${section.id}`}
                      className="flex items-center text-gray-700 hover:text-primary transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 mr-3 text-gray-400" />
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Terms Sections */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-gray-700">
                  <strong>Note:</strong> This is a summary of key terms. Please read the full terms below 
                  for complete understanding. If you have questions, consult with a legal professional or 
                  contact our legal team.
                </p>
              </div>

              {sections.map((section) => (
                <div key={section.id} id={section.id} className="mb-12 scroll-mt-20">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-3">
                    {section.title}
                  </h2>
                  <div 
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance Section */}
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Acceptance of Terms</h3>
              <p className="text-gray-600 mb-6">
                By using the Nimart platform, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/links/privacy-policy"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Read Privacy Policy
                </Link>
                <a
                  href="mailto:legal@nimart.ng"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-medium transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Legal Team
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Documents */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Related Legal Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/links/privacy-policy"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                Privacy Policy
              </h4>
              <p className="text-gray-600">
                Learn how we collect, use, and protect your personal information
              </p>
            </Link>

            <Link
              href="/links/cookie-policy"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                Cookie Policy
              </h4>
              <p className="text-gray-600">
                Understand how we use cookies and similar technologies
              </p>
            </Link>

            <Link
              href="/provider/terms"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 mb-4">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                Provider Agreement
              </h4>
              <p className="text-gray-600">
                Additional terms for service providers using our platform
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}