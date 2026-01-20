// app/links/privacy-policy/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Shield, Lock, Eye, User, FileText,
  ArrowRight, Home as HomeIcon, Mail
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Privacy Policy | How Nimart Protects Your Data',
  description: 'Read Nimart\'s Privacy Policy. Learn how we collect, use, and protect your personal information when you use our service marketplace.',
  keywords: 'Nimart privacy policy, data protection, personal information, GDPR Nigeria, data security, privacy statement, service marketplace privacy',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/privacy-policy',
    title: 'Privacy Policy | How Nimart Protects Your Data',
    description: 'Learn how we collect, use, and protect your personal information',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-privacy-policy.png',
      width: 1200,
      height: 630,
      alt: 'Nimart Privacy Policy'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | How Nimart Protects Your Data',
    description: 'Learn how we collect, use, and protect your personal information',
    images: ['https://nimart.ng/og-privacy-policy.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'PrivacyPolicy',
    name: 'Nimart Privacy Policy',
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
        name: 'Privacy Policy',
        item: 'https://nimart.ng/links/privacy-policy'
      }
    ]
  }

  const sections = [
    {
      id: 'information-we-collect',
      title: '1. Information We Collect',
      content: `
        <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
        
        <h4>1.1 Personal Information</h4>
        <ul>
          <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, phone number, and password.</li>
          <li><strong>Profile Information:</strong> If you're a service provider, we collect additional information such as your business name, service type, experience, qualifications, and business registration details.</li>
          <li><strong>Contact Information:</strong> Your address, phone number, and other contact details you provide.</li>
        </ul>
        
        <h4>1.2 Service Information</h4>
        <ul>
          <li><strong>Booking Details:</strong> Information about services you book, including service type, location, date, time, and special requirements.</li>
          <li><strong>Communication Data:</strong> Messages exchanged between you and service providers through our platform.</li>
          <li><strong>Transaction Information:</strong> Payment details, transaction history, and billing information.</li>
        </ul>
        
        <h4>1.3 Technical Information</h4>
        <ul>
          <li><strong>Device Information:</strong> Hardware model, operating system version, unique device identifiers, and mobile network information.</li>
          <li><strong>Log Information:</strong> Details of how you used our service, including search queries, IP address, browser type, and access times.</li>
          <li><strong>Location Information:</strong> Precise location data from your device if you enable location services.</li>
        </ul>
      `
    },
    {
      id: 'how-we-use-information',
      title: '2. How We Use Your Information',
      content: `
        <p>We use the information we collect for the following purposes:</p>
        
        <h4>2.1 To Provide and Improve Our Services</h4>
        <ul>
          <li>Process your bookings and connect you with service providers</li>
          <li>Personalize your experience and show you relevant service providers</li>
          <li>Improve, test, and monitor the effectiveness of our platform</li>
          <li>Develop new features and services</li>
        </ul>
        
        <h4>2.2 For Communication</h4>
        <ul>
          <li>Send you service-related updates, booking confirmations, and reminders</li>
          <li>Respond to your questions and provide customer support</li>
          <li>Send you marketing communications (with your consent)</li>
          <li>Notify you about changes to our services or policies</li>
        </ul>
        
        <h4>2.3 For Safety and Security</h4>
        <ul>
          <li>Verify your identity and prevent fraudulent activity</li>
          <li>Ensure the safety and security of our platform</li>
          <li>Conduct investigations and enforce our terms and policies</li>
          <li>Comply with legal obligations</li>
        </ul>
        
        <h4>2.4 For Research and Analytics</h4>
        <ul>
          <li>Analyze usage trends and user preferences</li>
          <li>Conduct research to improve our services</li>
          <li>Measure the effectiveness of our platform</li>
        </ul>
      `
    },
    {
      id: 'information-sharing',
      title: '3. Information Sharing and Disclosure',
      content: `
        <p>We do not sell your personal information. We share your information only in the following circumstances:</p>
        
        <h4>3.1 With Service Providers</h4>
        <p>When you book a service, we share necessary information with the service provider to facilitate the service. This includes:</p>
        <ul>
          <li>Your name and contact information</li>
          <li>Service location and details</li>
          <li>Special instructions or requirements</li>
        </ul>
        
        <h4>3.2 With Your Consent</h4>
        <p>We will share personal information with companies, organizations, or individuals outside of Nimart when we have your consent to do so.</p>
        
        <h4>3.3 For Legal Reasons</h4>
        <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
        
        <h4>3.4 Service Providers and Partners</h4>
        <p>We work with third-party companies and individuals who help us operate our platform (e.g., payment processors, cloud hosting providers). These parties have access to your information only to perform specific tasks on our behalf.</p>
        
        <h4>3.5 Business Transfers</h4>
        <p>If Nimart is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
      `
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      content: `
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
        
        <h4>4.1 Security Measures</h4>
        <ul>
          <li><strong>Encryption:</strong> We use encryption for data transmission and storage</li>
          <li><strong>Access Controls:</strong> Strict access controls limit who can access your information</li>
          <li><strong>Regular Audits:</strong> We conduct regular security assessments and audits</li>
          <li><strong>Employee Training:</strong> Our employees receive regular privacy and security training</li>
        </ul>
        
        <h4>4.2 Data Retention</h4>
        <p>We retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
        
        <h4>4.3 Your Responsibilities</h4>
        <p>You are responsible for keeping your account credentials confidential. We are not responsible for any unauthorized access to your account resulting from your failure to protect your login information.</p>
      `
    },
    {
      id: 'your-rights',
      title: '5. Your Rights and Choices',
      content: `
        <p>You have certain rights regarding your personal information:</p>
        
        <h4>5.1 Access and Correction</h4>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>Request deletion of your personal information</li>
        </ul>
        
        <h4>5.2 Marketing Communications</h4>
        <p>You can opt-out of receiving marketing communications from us by:</p>
        <ul>
          <li>Using the unsubscribe link in our emails</li>
          <li>Updating your notification preferences in your account settings</li>
          <li>Contacting our support team</li>
        </ul>
        
        <h4>5.3 Cookies and Tracking</h4>
        <p>You can control cookies through your browser settings. See our <Link href="/links/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link> for more information.</p>
        
        <h4>5.4 Location Information</h4>
        <p>You can disable location services through your device settings. However, some features may not function properly without location services enabled.</p>
        
        <h4>5.5 Account Deletion</h4>
        <p>You can request deletion of your account by contacting our support team. Note that some information may be retained for legal or legitimate business purposes.</p>
      `
    },
    {
      id: 'international-transfers',
      title: '6. International Data Transfers',
      content: `
        <p>Your information may be transferred to, and maintained on, computers located outside of Nigeria where data protection laws may differ.</p>
        
        <p>We take appropriate safeguards to ensure that your personal information remains protected in accordance with this Privacy Policy when transferred internationally, including:</p>
        
        <ul>
          <li>Using standard contractual clauses approved by data protection authorities</li>
          <li>Ensuring the recipient country provides adequate data protection</li>
          <li>Implementing additional security measures as needed</li>
        </ul>
      `
    },
    {
      id: 'children-privacy',
      title: '7. Children\'s Privacy',
      content: `
        <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.</p>
        
        <p>If we learn that we have collected personal information from a child under 18, we will take steps to delete that information as quickly as possible.</p>
        
        <p>If you believe we might have any information from or about a child under 18, please contact us immediately.</p>
      `
    },
    {
      id: 'changes-policy',
      title: '8. Changes to This Policy',
      content: `
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
        
        <p>We will also notify you via email and/or a prominent notice on our service, prior to the change becoming effective and update the date at the bottom of this page.</p>
        
        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
      `
    },
    {
      id: 'contact-us',
      title: '9. Contact Us',
      content: `
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        
        <div class="bg-gray-50 p-6 rounded-xl my-4">
          <p><strong>Nimart Nigeria</strong></p>
          <p>Banex Junction, Wuse</p>
          <p>Abuja Municipal Area Council, 900001</p>
          <p>Federal Capital Territory, Nigeria</p>
          <p>Email: <a href="mailto:privacy@nimart.ng" class="text-primary hover:underline">privacy@nimart.ng</a></p>
          <p>Phone: +234 803 888 7589</p>
        </div>
        
        <p>For data protection inquiries, you can also contact our Data Protection Officer at <a href="mailto:dpo@nimart.ng" class="text-primary hover:underline">dpo@nimart.ng</a>.</p>
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
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Introduction */}
          <div className="p-8 border-b border-gray-200">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600">
                Welcome to Nimart's Privacy Policy. This document explains how we collect, use, disclose, 
                and safeguard your information when you use our service marketplace platform. Please read 
                this policy carefully. If you do not agree with the terms, please discontinue use of our services.
              </p>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Summary</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Lock className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>We collect information to provide and improve our services</span>
                  </li>
                  <li className="flex items-start">
                    <Eye className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>You control your data and can access, correct, or delete it</span>
                  </li>
                  <li className="flex items-start">
                    <User className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>We never sell your personal information to third parties</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
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

          {/* Policy Sections */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
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

          {/* Contact Card */}
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start">
                <div className="p-3 rounded-lg bg-primary/10 mr-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Questions About Our Privacy Policy?</h3>
                  <p className="text-gray-600 mb-4">
                    If you have any questions or concerns about this Privacy Policy or our data practices, 
                    please don't hesitate to contact our Data Protection Officer.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="mailto:privacy@nimart.ng"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Email Privacy Team
                    </a>
                    <Link
                      href="/links/contact"
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-medium transition-colors"
                    >
                      Contact Support
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Policies */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Related Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/links/terms-of-service"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                Terms of Service
              </h4>
              <p className="text-gray-600">
                Read the terms and conditions for using Nimart services
              </p>
            </Link>

            <Link
              href="/links/cookie-policy"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                Cookie Policy
              </h4>
              <p className="text-gray-600">
                Learn about how we use cookies and similar technologies
              </p>
            </Link>

            <Link
              href="/links/help-center"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 mb-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary">
                Help Center
              </h4>
              <p className="text-gray-600">
                Get help with using Nimart and find answers to common questions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}