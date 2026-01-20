// app/links/careers/page.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  Briefcase, Users, TrendingUp, Award, Heart,
  Globe, Zap, ArrowRight, Home as HomeIcon,
  Mail, Phone, MapPin, Clock, CheckCircle,
  DollarSign, GraduationCap, Coffee, Users as TeamIcon,
  Shield, Rocket, BookOpen, Palette
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Careers at Nimart | Join Nigeria\'s Leading Service Marketplace',
  description: 'Build your career at Nimart. Join our mission to transform Nigeria\'s service industry. Explore job opportunities, culture, benefits, and growth prospects.',
  keywords: 'Nimart careers, jobs Nigeria, tech careers Abuja, service marketplace jobs, Nigeria startup jobs, career opportunities, work at Nimart, Nigerian tech company',
  openGraph: {
    type: 'website',
    url: 'https://nimart.ng/links/careers',
    title: 'Careers at Nimart | Join Nigeria\'s Leading Service Marketplace',
    description: 'Build your career at Nimart and help transform Nigeria\'s service industry',
    siteName: 'Nimart',
    locale: 'en_NG',
    images: [{
      url: 'https://nimart.ng/og-careers.png',
      width: 1200,
      height: 630,
      alt: 'Careers at Nimart'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers at Nimart | Join Nigeria\'s Leading Service Marketplace',
    description: 'Build your career at Nimart and help transform Nigeria\'s service industry',
    images: ['https://nimart.ng/og-careers.png'],
    site: '@nimartng',
    creator: '@nimartng',
  },
  alternates: {
    canonical: 'https://nimart.ng/links/careers',
  },
}

export default function CareersPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CareerPage',
    name: 'Careers at Nimart',
    description: 'Job opportunities at Nigeria\'s leading service marketplace',
    url: 'https://nimart.ng/links/careers',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Nimart',
      sameAs: 'https://nimart.ng'
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
        name: 'Careers',
        item: 'https://nimart.ng/links/careers'
      }
    ]
  }

  const jobOpenings = [
    {
      id: 'frontend-dev',
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Abuja (Hybrid)',
      type: 'Full-time',
      experience: '3+ years',
      salary: '₦400,000 - ₦600,000/month',
      description: 'Build user interfaces for our web and mobile applications using React and Next.js'
    },
    {
      id: 'backend-dev',
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '4+ years',
      salary: '₦500,000 - ₦700,000/month',
      description: 'Develop scalable backend systems using Node.js, PostgreSQL, and AWS'
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      department: 'Product',
      location: 'Abuja',
      type: 'Full-time',
      experience: '5+ years',
      salary: '₦600,000 - ₦800,000/month',
      description: 'Lead product strategy and development for our service marketplace platform'
    },
    {
      id: 'marketing-specialist',
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Lagos',
      type: 'Full-time',
      experience: '3+ years',
      salary: '₦300,000 - ₦450,000/month',
      description: 'Drive user acquisition and brand awareness through digital marketing campaigns'
    },
    {
      id: 'customer-success',
      title: 'Customer Success Manager',
      department: 'Operations',
      location: 'Abuja',
      type: 'Full-time',
      experience: '2+ years',
      salary: '₦250,000 - ₦350,000/month',
      description: 'Ensure customer satisfaction and manage provider relationships'
    },
    {
      id: 'ux-designer',
      title: 'UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      salary: '₦350,000 - ₦500,000/month',
      description: 'Design intuitive user experiences for our web and mobile platforms'
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Salary',
      description: 'Above-market compensation packages'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Clear promotion paths and skill development'
    },
    {
      icon: Shield,
      title: 'Health Insurance',
      description: 'Comprehensive medical coverage'
    },
    {
      icon: Coffee,
      title: 'Flexible Work',
      description: 'Hybrid/remote options and flexible hours'
    },
    {
      icon: GraduationCap,
      title: 'Learning Budget',
      description: 'Annual budget for courses and conferences'
    },
    {
      icon: TeamIcon,
      title: 'Team Events',
      description: 'Regular team building and social events'
    },
    {
      icon: BookOpen,
      title: 'Mentorship',
      description: 'Guidance from experienced leaders'
    },
    {
      icon: Heart,
      title: 'Wellness',
      description: 'Mental health support and gym membership'
    }
  ]

  const cultureValues = [
    {
      title: 'Customer Obsession',
      description: 'We start with the customer and work backwards',
      icon: Heart
    },
    {
      title: 'Ownership',
      description: 'We act on behalf of the entire company',
      icon: Shield
    },
    {
      title: 'Innovation',
      description: 'We embrace new ideas and take smart risks',
      icon: Zap
    },
    {
      title: 'Excellence',
      description: 'We set high standards and deliver quality',
      icon: Award
    },
    {
      title: 'Teamwork',
      description: 'We collaborate and support each other',
      icon: Users
    },
    {
      title: 'Impact',
      description: 'We focus on what matters most',
      icon: TrendingUp
    }
  ]

  const interviewProcess = [
    {
      step: '1',
      title: 'Application Review',
      description: 'Our team reviews your application within 5 business days',
      duration: '1-5 days'
    },
    {
      step: '2',
      title: 'Initial Screening',
      description: '30-minute call with HR to discuss your background and expectations',
      duration: '30 mins'
    },
    {
      step: '3',
      title: 'Technical/Team Interview',
      description: 'In-depth discussion with team members about skills and experience',
      duration: '60-90 mins'
    },
    {
      step: '4',
      title: 'Case Study/Assignment',
      description: 'Practical assessment relevant to the role (if applicable)',
      duration: 'Take-home'
    },
    {
      step: '5',
      title: 'Final Interview',
      description: 'Meeting with department head and leadership team',
      duration: '45 mins'
    },
    {
      step: '6',
      title: 'Offer',
      description: 'Congratulations! We extend an offer and discuss next steps',
      duration: '1-2 days'
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
              Build Your Career at Nimart
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
              Join our mission to transform Nigeria's service industry
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#open-positions" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl">
                View Open Positions
                <ArrowRight className="h-6 w-6 ml-3" />
              </a>
              <Link
                href="/links/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Nimart */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Join Our Team?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Work on meaningful challenges that impact millions of Nigerians
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real Impact</h3>
              <p className="text-gray-600">
                Help create economic opportunities for thousands of service professionals across Nigeria
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Rocket className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fast Growth</h3>
              <p className="text-gray-600">
                Join one of Nigeria's fastest-growing startups with massive expansion plans
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Career Growth</h3>
              <p className="text-gray-600">
                Accelerate your career with mentorship, training, and clear growth paths
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Culture & Values */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our Culture & Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide how we work together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultureValues.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Employee Benefits
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We take care of our team so you can do your best work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
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

      {/* Open Positions */}
      <div id="open-positions" className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Open Positions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join our team and help build the future of services in Nigeria
            </p>
          </div>

          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="lg:w-2/3">
                    <div className="flex items-center mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mr-4">{job.title}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {job.experience}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/3 mt-4 lg:mt-0 lg:text-right">
                    <a
                      href={`mailto:careers@nimart.ng?subject=Application for ${job.title} Position`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Apply Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see a role that matches your skills? We're always looking for talented people.
            </p>
            <a
              href="mailto:careers@nimart.ng?subject=General Application"
              className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-medium transition-colors"
            >
              Send General Application
              <Mail className="h-5 w-5 ml-2" />
            </a>
          </div>
        </div>
      </div>

      {/* Interview Process */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our Hiring Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transparent and respectful process designed to find the right fit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interviewProcess.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-gray-50 rounded-xl p-6 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 mt-4 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Our Commitment to You</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Timely Updates</div>
                  <div className="text-sm text-gray-600">We respond to all applications within 5 business days</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Respectful Process</div>
                  <div className="text-sm text-gray-600">We value your time and provide clear expectations</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Constructive Feedback</div>
                  <div className="text-sm text-gray-600">We provide feedback to help you grow professionally</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Office & Contact */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Work With Us
            </h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
              Join our team in Abuja or work remotely from anywhere in Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">Abuja Headquarters</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Banex Junction, Wuse</div>
                    <div className="text-sm opacity-90">Abuja Municipal Area Council, 900001</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">+234 803 888 7589</div>
                    <div className="text-sm opacity-90">Call for career inquiries</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">careers@nimart.ng</div>
                    <div className="text-sm opacity-90">Send your applications</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">Remote Work</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Globe className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Work From Anywhere</div>
                    <div className="text-sm opacity-90">Flexible remote work options available</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Coffee className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Flexible Hours</div>
                    <div className="text-sm opacity-90">Focus on results, not fixed hours</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <TeamIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Virtual Collaboration</div>
                    <div className="text-sm opacity-90">Modern tools for seamless teamwork</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary to-green-600 rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Nigeria's Service Industry?
            </h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our mission to create economic opportunities and make quality services accessible to all Nigerians
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#open-positions"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              >
                <Briefcase className="h-6 w-6 mr-3" />
                View Open Positions
              </a>
              <a
                href="mailto:careers@nimart.ng"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all hover:scale-105"
              >
                <Mail className="h-6 w-6 mr-3" />
                Contact Careers Team
              </a>
            </div>
            
            <div className="mt-8 text-sm opacity-80">
              We're an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}