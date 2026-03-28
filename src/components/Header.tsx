import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-4',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-navy p-2 rounded-lg group-hover:bg-brand-gold transition-colors duration-300">
            <Home className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-brand-navy">Ritchie Realty</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold -mt-1">Inc.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-brand-gold',
                location.pathname === link.path ? 'text-brand-gold' : 'text-brand-navy'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <a
            href="tel:+13046593067"
            className="flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-gold transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>+1 304-659-3067</span>
          </a>
          <Link to="/contact" className="btn-primary py-2 px-6 text-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-brand-navy"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="bg-brand-navy p-1.5 rounded-lg">
                    <Home className="text-white w-5 h-5" />
                  </div>
                  <span className="font-serif text-lg font-bold text-brand-navy tracking-tight">Ritchie Realty</span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-gray-50 text-brand-navy"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-grow overflow-y-auto p-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-xl font-serif font-bold py-4 px-4 rounded-2xl transition-all flex items-center justify-between group',
                      location.pathname === link.path 
                        ? 'bg-brand-cream text-brand-gold' 
                        : 'text-brand-navy hover:bg-gray-50'
                    )}
                  >
                    {link.name}
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      location.pathname === link.path ? "bg-brand-gold scale-100" : "bg-transparent scale-0"
                    )} />
                  </Link>
                ))}
              </nav>

              <div className="p-8 bg-brand-cream space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Contact Us</p>
                  <a
                    href="tel:+13046593067"
                    className="flex items-center gap-3 text-brand-navy font-bold text-lg"
                  >
                    <Phone className="w-5 h-5 text-brand-gold" />
                    <span>+1 304-659-3067</span>
                  </a>
                </div>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full btn-primary py-4 text-center block"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
