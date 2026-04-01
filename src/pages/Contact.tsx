import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // corrected import (assuming you meant framer-motion)
import { FacebookIcon, InstagramIcon, LinkedinIcon } from 'lucide-react';
import { ContactForm } from '../components/ContactForm.js';
import { SERVICES } from '../constants.js';
import RitchieImage from '../images/RITCHIE-REALTY-INC.jpg';

export const Contact = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get('service');

  const selectedService = SERVICES.find((s) => s.id === serviceId);
  const defaultMessage = selectedService
    ? `I'm interested in learning more about your ${selectedService.title} service.`
    : '';

  return (
    <div className="pt-24 min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src= {RitchieImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 font-light"
          >
            We're here to help you navigate the Pennsboro real estate market.
          </motion.p>
        </div>
      </section>

      <section className="section-padding py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-brand-navy">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                        <MapPin className="text-brand-navy w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-navy">Our Office</p>
                        <p className="text-gray-600 text-sm">
                          1410 Lynn Camp Rd
                          <br />
                          Pennsboro, WV 26415
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                        <Phone className="text-brand-navy w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-navy">Phone</p>
                        <a
                          href="tel:+13046593067"
                          className="text-gray-600 text-sm hover:text-brand-gold transition-colors"
                        >
                          +1 304-659-3067
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-brand-cream p-3 rounded-xl shrink-0">
                        <Mail className="text-brand-navy w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-navy">Email</p>
                        <a
                          href="mailto:janetstanley@frontier.com"
                          className="text-gray-600 text-sm hover:text-brand-gold transition-colors break-all"
                        >
                          janetstanley@frontier.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <h3 className="text-2xl font-serif font-bold text-brand-navy">Business Hours</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mon - Fri</span>
                      <span className="font-bold text-brand-navy">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Saturday</span>
                      <span className="font-bold text-brand-navy">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sunday</span>
                      <span className="font-bold text-brand-navy">By Appointment</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <a
                    href="https://www.facebook.com/RitchieRealtyInc"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Ritchie Realty on Facebook"
                    className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram (link coming soon)"
                    className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all opacity-50 cursor-not-allowed"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/janet-stanley-471733136/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Rithie Realty on Linkedin"
                    className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all opacity-50 cursor-not-allowed"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-50">
                <div className="mb-12">
                  <h2 className="text-4xl font-serif font-bold text-brand-navy mb-4">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-500">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
                <ContactForm defaultMessage={defaultMessage} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl h-[500px] border border-gray-100 relative">
            <iframe
              title="Ritchie Realty - 1410 Lynn Camp Rd, Pennsboro, WV 26415"
              className="absolute inset-0 w-full h-full border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3054.838!2d-80.947608!3d39.246938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDE0JzQ5LjAiTiA4MMKwNTYnNTEuNiJX!5e0!3m2!1sen!2sus!4v1730000000000"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
