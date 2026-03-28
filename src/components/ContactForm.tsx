import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

interface ContactFormProps {
  defaultMessage?: string;
  propertyId?: number;
}

export const ContactForm: React.FC<ContactFormProps> = ({ defaultMessage = '', propertyId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inquiries', {
        ...formData,
        property_id: propertyId
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 p-12 rounded-[2rem] text-center space-y-4"
      >
        <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-white w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-brand-navy">Message Sent!</h3>
        <p className="text-gray-600">Thank you for reaching out. We'll get back to you shortly.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="text-brand-gold font-bold hover:underline mt-4"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-navy ml-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-navy ml-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold transition-all outline-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-navy ml-1">Phone Number</label>
        <input
          type="tel"
          placeholder="+1 (304) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold transition-all outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-navy ml-1">Message</label>
        <textarea
          rows={5}
          required
          placeholder="How can we help you?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold transition-all outline-none resize-none"
        ></textarea>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send Message</span>
          </>
        )}
      </motion.button>
    </form>
  );
};
