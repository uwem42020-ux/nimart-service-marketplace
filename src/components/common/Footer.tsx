import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logo from '/logo.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="Nimart" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nigeria's trusted marketplace connecting customers with verified service professionals. 
              Quality services, secure payments, and peace of mind.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com/nimartng" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/nimartng" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/nimartng" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/nimartng" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/search" className="hover:text-white transition">Find Services</Link></li>
              <li><Link to="/auth/signup?role=provider" className="hover:text-white transition">Become a Provider</Link></li>
              <li><Link to="/customer/dashboard" className="hover:text-white transition">Customer Dashboard</Link></li>
              <li><Link to="/provider/dashboard" className="hover:text-white transition">Provider Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@nimart.ng" className="hover:text-white transition break-all">
                  support@nimart.ng
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="tel:+23438887589" className="hover:text-white transition">
                  +234 388 875 89
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>
                  Shop E35 Murg Plaza, Area 10 UTC<br />
                  Abuja, Nigeria
                </span>
              </li>
            </ul>
          </div>

          {/* Legal & Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link to="/safety" className="hover:text-white transition">Safety Tips</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
              <li><Link to="/report" className="hover:text-white transition">Report an Issue</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              &copy; {currentYear} Nimart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-white transition">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link to="/sitemap" className="hover:text-white transition">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}