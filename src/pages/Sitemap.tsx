import React from 'react';
import { Link } from 'react-router-dom';

export const Sitemap = () => {
  const links = [
    {
      title: 'Main Pages',
      items: [
        { name: 'Home', path: '/' },
        { name: 'Listings', path: '/listings' },
        { name: 'About Us', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Testimonials', path: '/testimonials' },
        { name: 'Contact Us', path: '/contact' },
      ]
    },
    {
      title: 'Services',
      items: [
        { name: 'Home Buying', path: '/services#buying' },
        { name: 'Home Selling', path: '/services#selling' },
        { name: 'Property Valuation', path: '/services#valuation' },
        { name: 'Relocation Support', path: '/services#relocation' },
        { name: 'Contract Negotiation', path: '/services#negotiation' },
        { name: 'Consultations', path: '/services#consultation' },
      ]
    },
    {
      title: 'Legal',
      items: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
      ]
    }
  ];

  return (
    <div className="pt-24 md:pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-20 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
        <h1 className="text-4xl font-serif font-bold text-brand-navy mb-12">Sitemap</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {links.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-brand-gold border-b border-brand-cream pb-2">{section.title}</h3>
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <Link to={item.path} className="text-gray-600 hover:text-brand-navy transition-colors font-medium">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
