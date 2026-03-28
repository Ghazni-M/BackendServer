import React from 'react';
import { motion } from 'motion/react';
import { TESTIMONIALS } from '../constants.js';
import { TestimonialCard } from '../components/TestimonialCard';
import { Star } from 'lucide-react';

export const Testimonials = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1920"
            alt="Happy Clients"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold"
          >
            Client Success Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 font-light"
          >
            The greatest reward for our work is the trust and satisfaction of our clients.
          </motion.p>
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 fill-brand-gold text-brand-gold" />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Repeat testimonials to fill the page */}
            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, idx) => (
              <motion.div
                key={`${testimonial.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonial Placeholder */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-brand-navy rounded-[3rem] overflow-hidden shadow-2xl relative aspect-video group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200"
              alt="Video Testimonial"
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-brand-navy border-b-[12px] border-b-transparent ml-2"></div>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 text-white">
              <h3 className="text-3xl font-serif font-bold mb-2">The Miller Family Journey</h3>
              <p className="text-brand-gold font-bold uppercase tracking-widest text-sm">Watch their story</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
