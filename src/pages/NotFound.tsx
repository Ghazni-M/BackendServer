// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        {/* Large 404 */}
        <h1 className="text-8xl md:text-9xl font-serif font-bold text-brand-navy mb-4 tracking-tight">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy mb-6">
          Page Not Found
        </h2>

        <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          <br className="hidden sm:block" />
          It might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-brand-navy hover:bg-brand-navy/90 text-white shadow-md transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            to="/listings"
            className="btn-secondary inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold border-2 border-brand-gold text-brand-navy hover:bg-brand-gold/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            View Listings
          </Link>
        </div>

        {/* Optional subtle illustration / hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-12 text-gray-500 text-sm"
        >
          <p>
            Lost in Pennsboro? Let us help you find your way home.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}