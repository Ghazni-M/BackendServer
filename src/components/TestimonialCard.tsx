import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '../types.js';
import { motion } from 'motion/react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative"
    >
      <Quote className="absolute top-6 right-8 w-12 h-12 text-brand-cream" />
      <div className="flex gap-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
        ))}
      </div>
      <p className="text-brand-charcoal italic leading-relaxed mb-8 relative z-10">
        "{testimonial.content}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center font-serif text-brand-navy font-bold text-xl">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-serif font-bold text-brand-navy">{testimonial.name}</h4>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};
