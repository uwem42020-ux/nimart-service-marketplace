// src/pages/shared/NimartVsNimart.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';

export default function NimartVsNimart() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Nimart vs. NIMART: What's the Difference?
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        You may have arrived here looking for one of two very different things. We're here to help you find exactly what you need.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Nimart Card */}
        <div className="bg-primary-50 rounded-2xl p-6 border-2 border-primary-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-primary-700">Nimart</h2>
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Pronunciation:</strong> "ni·mart"<br />
            <strong>Type:</strong> Nigerian Service Marketplace
          </p>
          <p className="text-gray-700 mb-6">
            Nimart connects you with trusted local professionals across Nigeria. Whether you need a plumber, hair stylist, mechanic, or caterer, Nimart helps you find, book, and pay verified providers near you.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Go to Nimart Homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* NIMART Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">NIMART</h2>
          <p className="text-gray-700 mb-4">
            <strong>Acronym:</strong> Nurse Initiated Management of Anti-Retroviral Treatment<br />
            <strong>Type:</strong> Medical Training Course
          </p>
          <p className="text-gray-700 mb-6">
            NIMART is a specialized healthcare training program for nurses in South Africa. It focuses on HIV/AIDS management, TB treatment, and patient care protocols. It is offered by the Foundation for Professional Development (FPD).
          </p>
          <a
            href="https://academy.emguidance.com/course/nimart"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Visit NIMART Course
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Looking for a service provider in Nigeria?</h3>
        <p className="text-blue-700 mb-4">
          You're in the right place! Browse thousands of verified professionals on Nimart.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/search" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            Find Services
          </Link>
          <Link to="/auth/signup?role=provider" className="bg-white text-blue-600 border border-blue-300 px-5 py-2 rounded-lg hover:bg-blue-50">
            Become a Provider
          </Link>
        </div>
      </div>
    </div>
  );
}