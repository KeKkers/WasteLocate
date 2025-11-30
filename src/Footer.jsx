import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Shield, FileText, Cookie } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 border-t-2 border-green-600">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                WL
              </div>
              <span className="text-xl font-bold text-gray-800">WasteLocate</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Connecting waste producers with permitted disposal facilities across the UK. 
              Your trusted partner for EWC code searches and facility matching.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/how-it-works.html" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => {
                  e.preventDefault();
                  // Add function to navigate to pricing view
                  window.scrollTo(0, 0);
                }} className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/about.html" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/faq.html" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  FAQ
                </a>
              </li>
               <li>
                <a href="/blog.html" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Blog
                </a>
              </li>
               <li>
                <a href="/contact.html" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Contact Form
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://assets.publishing.service.gov.uk/media/6152d0b78fa8f5610b9c222b/Waste_classification_technical_guidance_WM3.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
                >
                  WM3 Guidance
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.legislation.gov.uk/uksi/2011/988/contents" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
                >
                  Waste Regulations 2011
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/government/publications/waste-duty-of-care-code-of-practice" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
                >
                  Duty of Care Code
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/government/organisations/environment-agency" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
                >
                  Environment Agency
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <a href="mailto:info@wastelocate.co.uk" className="hover:text-green-600 transition-colors">
                  info@wastelocate.co.uk
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Business Hours:</p>
              <p className="text-sm text-gray-600">Mon-Fri: 9am - 5pm GMT</p>
            </div>
          </div>
        </div>

        {/* Legal Links Bar */}
        <div className="pt-6 border-t border-gray-300">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
            <a 
              href="/privacy.html" 
              className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </a>
            <a 
              href="/terms.html" 
              className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </a>
          </div>
        </div>

        {/* Copyright & Company Info */}
        <div className="pt-6 border-t border-gray-300">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} WasteLocate. All rights reserved.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-gray-300">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong className="text-yellow-800">Important Disclaimer:</strong> WasteLocate is an information service only. 
              We do not provide waste classification services or legal advice. Users must comply with official{' '}
              <a 
                href="https://assets.publishing.service.gov.uk/media/6152d0b78fa8f5610b9c222b/Waste_classification_technical_guidance_WM3.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-800 underline hover:text-yellow-900"
              >
                WM3 guidance
              </a>
              {' '}and all applicable UK environmental legislation. Always verify facility permits and capabilities independently.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z"/>
            </svg>
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Stripe Payments</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>UK Registered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
