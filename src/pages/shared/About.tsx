// src/pages/shared/About.tsx
import { Link } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Nimart – Nigeria's Service Marketplace",
  "description": "Nimart connects skilled Nigerian professionals with customers who need their services. Founded by Edidiong Edem, Nimart is free, local, and built for real Nigerian challenges.",
  "url": "https://nimart.ng/about",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Nimart",
    "url": "https://nimart.ng"
  }
};

export default function About() {
  return (
    <>
      <SEO
        title="About Nimart | Nigeria's Local Service Marketplace"
        description="Nimart connects skilled Nigerians with customers near them. Free to use, built for local services. Founded by Edidiong Edem from Akwa Ibom."
        keywords="about Nimart, Nigerian service marketplace, local services Nigeria, Nimart founder, Edidiong Edem, connect with professionals Nigeria"
        url="https://nimart.ng/about"
        schema={pageSchema}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'About' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            About Nimart
          </h1>

          {/* Why Nimart was built */}
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why Nimart exists</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Nimart was born from a simple but urgent problem: skilled Nigerians move from city to city, and finding them when you need them is hard. Whether it's a plumber who just relocated to Abuja or a makeup artist now based in Lagos, their customers often lose touch. Nimart solves that by connecting service professionals with the people who need them — not just any customers, but the ones closest to them.
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Founded by <strong>Edidiong Edem</strong> from Akwa Ibom State, Nigeria, Nimart is built for real Nigerian challenges. Insecurity, frequent relocations, and the struggle to find trusted help shouldn't stop anyone from earning a living or getting quality service.
          </p>

          {/* What makes Nimart different */}
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What makes Nimart different</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">📍</span>
              <div>
                <strong className="text-gray-800">Local first.</strong>
                <p className="text-gray-600 text-sm">We connect you with providers near you — by LGA, not just by state. If a provider moves, they can update their location once a month for free, so their customers always know where they are.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">🆓</span>
              <div>
                <strong className="text-gray-800">Free. Always.</strong>
                <p className="text-gray-600 text-sm">Nimart is and will always be free for both customers and providers. We may charge for optional promotions or extra location changes, but the core service — finding and booking a professional — costs nothing.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">🤝</span>
              <div>
                <strong className="text-gray-800">You're in control.</strong>
                <p className="text-gray-600 text-sm">Nimart doesn't hold your money. You negotiate directly with the provider. If you're not satisfied, you can choose another. It's like Uber, but for services — not products.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">🛡️</span>
              <div>
                <strong className="text-gray-800">We fight scammers.</strong>
                <p className="text-gray-600 text-sm">We verify providers by checking their documents, confirming their addresses, and running background investigations. Verified providers are monitored — and we can remove verification if we notice any behaviour that violates our terms. But ultimately, you must also protect yourself. Even verified accounts can go wrong. If something feels off, report it immediately.</p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our mission</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            To ensure that every skilled Nigerian — no matter where they move to — has customers ready to hire them. And every Nigerian has access to trusted, local professionals whenever they need one.
          </p>

          {/* Stats placeholder — update these after running the SQL */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-5 mb-8">
            <p className="text-primary-800 font-medium text-center">
              Nimart is growing across Nigeria. Our providers are serving customers in multiple states, and new professionals join every day.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition"
            >
              Find a Provider
            </Link>
            <Link
              to="/auth/signup?role=provider"
              className="inline-flex items-center gap-2 border border-primary-300 text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition"
            >
              Join as a Provider
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}