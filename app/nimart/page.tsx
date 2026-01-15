// app/nimart/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nimart - Nigeria\'s #1 Service Marketplace | Find Trusted Professionals',
  description: 'Nimart is Nigeria\'s leading service marketplace. Find verified mechanics, electricians, plumbers, carpenters, tailors, chefs, and 50+ other service providers near you.',
  keywords: 'Nimart, Nimart Nigeria, Nimart services, Nimart marketplace, Nimart providers, Nimart booking, Nimart near me, Nimart online',
  openGraph: {
    title: 'Nimart - Nigeria\'s #1 Service Marketplace',
    description: 'Find trusted and verified service providers on Nimart',
  },
}

export default function NimartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-primary">Nimart</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nigeria's premier service marketplace connecting customers with trusted professionals
          </p>
        </div>

        {/* What is Nimart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Nimart?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                Nimart is Nigeria's #1 service marketplace platform that connects customers with verified service providers across all 36 states.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• 50+ service categories available</li>
                <li>• Verified and trusted professionals</li>
                <li>• Real-time booking and scheduling</li>
                <li>• Secure payment system</li>
                <li>• Customer reviews and ratings</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                Whether you need a mechanic, electrician, plumber, tailor, chef, or any other service professional, Nimart makes it easy to find and book the right person for the job.
              </p>
              <div className="mt-6">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Explore Nimart Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Providers</h3>
            <p className="text-gray-600">All Nimart providers are thoroughly verified for quality and reliability</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Booking</h3>
            <p className="text-gray-600">Book services in minutes with our simple and intuitive platform</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">Pay securely through multiple payment options</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Nimart Today</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Sign Up as Customer
            </Link>
            <Link
              href="/provider/register"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}