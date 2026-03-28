import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SERVICES } from '../constants.js';
import * as Icons from 'lucide-react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import RitchieRealty from '../images/RITCHIE-REALTY-INC.jpg';

// ── Your local images (already imported) ────────────────────────────────
import HomeBuying from '../images/Home-Buying-Assistance.jpg';
import HomeSelling from '../images/Home-Selling.jpg';
import PropertyValuation from '../images/Property-Valuation.png';
import HomeRelocation from '../images/Home-Relocation.png';
import ContractNegotiation from '../images/Contract-Negotiation.png';
import Personalized from '../images/Personlized-Negotiation.jpg'; 

// Array matching the order of SERVICES
const SERVICE_IMAGES = [
  HomeBuying,
  HomeSelling,
  PropertyValuation,
  HomeRelocation,
  ContractNegotiation,
  Personalized,
];

export const Services = () => {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={RitchieRealty}
            alt="Real Estate Consultation"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 font-light"
          >
            Professional real estate solutions designed for your success.
          </motion.p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto space-y-32">
          {SERVICES.map((service, index) => {
            const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Text Content */}
                <div className={isEven ? 'order-1' : 'order-1 lg:order-2'}>
                  <div className="bg-brand-cream w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                    <IconComponent className="w-10 h-10 text-brand-navy" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy mb-6">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <ul className="space-y-4 mb-10">
                    {[
                      'Expert guidance from consultation to closing',
                      'Personalized strategy tailored to your goals',
                      'Transparent communication at every step',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                        <CheckCircle2 className="text-brand-gold w-5 h-5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/contact?service=${service.id}`}
                    className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold"
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Image – now using your local imported files */}
                <div className={isEven ? 'order-2' : 'order-2 lg:order-1'}>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                    <img
                      src={SERVICE_IMAGES[index]}
                      alt={`${service.title} illustration`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback if local image fails to load
                        e.currentTarget.src = 'https://placehold.co/800x600?text=Image+Not+Found';
                        console.error(`Failed to load image for ${service.title}`);
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy">
              Our Simple Process
            </h2>
            <p className="text-gray-600 text-lg">
              How we work together to achieve your real estate goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-brand-gold/20 -translate-y-1/2 z-0" />
            {[
              { step: '01', title: 'Consultation', desc: 'We discuss your goals and needs.' },
              { step: '02', title: 'Strategy', desc: 'We develop a custom plan for you.' },
              { step: '03', title: 'Execution', desc: 'We handle the details and negotiations.' },
              { step: '04', title: 'Closing', desc: 'We celebrate your successful journey.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-md relative z-10 text-center space-y-4 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-brand-navy text-brand-gold rounded-full flex items-center justify-center mx-auto font-serif text-2xl font-bold shadow-md">
                  {item.step}
                </div>
                <h4 className="font-serif text-xl font-bold text-brand-navy">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};