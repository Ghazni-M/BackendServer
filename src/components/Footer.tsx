import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, LinkedIn, Mail, MapPin, Phone, Home } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-navy text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-white p-2 rounded-lg">
                <Home className="text-brand-navy w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-white">Ritchie Realty</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold -mt-1">Inc.</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serving Pennsboro and surrounding West Virginia communities with integrity, care, and local expertise since our founding.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/RitchieRealtyInc"target="_blank"rel="noopener noreferrer" aria-label="Visit us on Facebook"className="..."><Facebook className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/" className="hover:text-brand-gold transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/in/janet-stanley-471733136/" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Linkedin" className="hover:text-brand-gold transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/listings" className="hover:text-brand-gold transition-colors">Browse Listings</Link></li>
              <li><Link to="/about" className="hover:text-brand-gold transition-colors">Our Story</Link></li>
              <li><Link to="/services" className="hover:text-brand-gold transition-colors">Our Services</Link></li>
              <li><Link to="/blog" className="hover:text-brand-gold transition-colors">Real Estate Blog</Link></li>
              <li><Link to="/testimonials" className="hover:text-brand-gold transition-colors">Client Reviews</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/services#buying" className="hover:text-brand-gold transition-colors">Home Buying</Link></li>
              <li><Link to="/services#selling" className="hover:text-brand-gold transition-colors">Home Selling</Link></li>
              <li><Link to="/services#valuation" className="hover:text-brand-gold transition-colors">Property Valuation</Link></li>
              <li><Link to="/services#relocation" className="hover:text-brand-gold transition-colors">Relocation Support</Link></li>
              <li><Link to="/services#consultation" className="hover:text-brand-gold transition-colors">Consultations</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Contact Info</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
                <span>1410 Lynn Camp Rd,<br />Pennsboro, WV 26415</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <a href="tel:+13046593067" className="hover:text-brand-gold transition-colors">+1 304-659-3067</a>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <a href="mailto:janetstanley@frontier.com" className="hover:text-brand-gold transition-colors">janetstanley@frontier.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Ritchie Realty, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-gold transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-brand-gold transition-colors">Sitemap</Link>
            <Link to="/admin/login" className="hover:text-brand-gold transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
