// app/services/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: {
    slug: string
  }
}

// Generate metadata based on slug
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const serviceName = decodeServiceName(params.slug)
  
  return {
    title: `${serviceName} | Nimart - Find ${serviceName} Services in Nigeria`,
    description: `Find and book verified ${serviceName} on Nimart. Professional ${serviceName} services available across Nigeria.`,
    keywords: `${serviceName}, Nimart ${serviceName}, ${serviceName} services, ${serviceName} near me, ${serviceName} Nigeria`,
  }
}

// Helper function to decode service name from slug
function decodeServiceName(slug: string): string {
  // Remove "nimart-" prefix and replace hyphens with spaces
  const name = slug.replace(/^nimart-/, '').replace(/-/g, ' ')
  // Capitalize first letter of each word
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function ServicePage({ params }: PageProps) {
  const serviceName = decodeServiceName(params.slug)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {serviceName} <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find trusted and verified {serviceName.toLowerCase()} on Nimart
          </p>
        </div>

        {/* Service Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional {serviceName} Services
              </h2>
              <p className="text-gray-600 mb-4">
                Nimart connects you with verified and experienced {serviceName.toLowerCase()} across Nigeria. 
                Whether you need residential, commercial, or emergency services, we have the right professionals for you.
              </p>
              <div className="mt-6">
                <Link
                  href={`/marketplace?service=${serviceName.toLowerCase()}`}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Browse {serviceName}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Choose Nimart {serviceName}?</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Verified and background-checked professionals</li>
                <li>• Customer reviews and ratings</li>
                <li>• Transparent pricing</li>
                <li>• Easy booking and scheduling</li>
                <li>• Quality guarantee</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Mechanics', 'Electricians', 'Plumbers', 'Carpenters'].map((related) => (
              <Link
                key={related}
                href={`/services/nimart-${related.toLowerCase()}`}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="text-primary font-semibold">{related}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need a {serviceName.toLowerCase()}?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Book a verified {serviceName.toLowerCase()} on Nimart today. Quick, reliable, and professional service guaranteed.
          </p>
          <Link
            href={`/marketplace?service=${serviceName.toLowerCase()}`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Find {serviceName} Now
          </Link>
        </div>
      </div>
    </div>
  )
}

// Generate static paths for service pages
export async function generateStaticParams() {
  const services = [
    'nimart-mechanics', 'nimart-electricians', 'nimart-plumbers', 'nimart-carpenters',
    'nimart-painters', 'nimart-tailors', 'nimart-cleaners', 'nimart-chefs',
    'nimart-nigeria', 'nimart-services', 'nimart-marketplace'
  ]
  
  return services.map((slug) => ({
    slug,
  }))
}