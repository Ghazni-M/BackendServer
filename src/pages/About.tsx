import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Award, Users, Heart } from 'lucide-react';
import RitchieRealty from '../images/RITCHIE-REALTY-INC.jpg';

export const About = () => {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src= {RitchieRealty}
            alt="West Virginia Hills"
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
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 font-light"
          >
            A legacy of trust and local expertise in Pennsboro, West Virginia.
          </motion.p>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold text-brand-navy">Built on Integrity</h2>
              <div className="w-20 h-1 bg-brand-gold"></div>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Ritchie Realty, Inc. was founded with a simple mission: to provide the residents of Pennsboro and surrounding areas with a real estate experience that is as personal as it is professional. We understand that buying or selling a home is one of life's most significant decisions, and we treat it with the respect it deserves.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Over the years, we've grown from a small local office into a premier brokerage, but our core values remain unchanged. We are neighbors helping neighbors, committed to the prosperity of our community.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-2">
                <h4 className="text-4xl font-serif font-bold text-brand-gold">20+</h4>
                <p className="text-sm uppercase tracking-widest font-bold text-brand-navy">Years Experience</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-serif font-bold text-brand-gold">500+</h4>
                <p className="text-sm uppercase tracking-widest font-bold text-brand-navy">Homes Sold</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=800"
                alt="Pennsboro Community"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-brand-gold p-10 rounded-3xl shadow-2xl hidden md:block">
              <Award className="w-12 h-12 text-brand-navy" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-brand-cream">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl font-serif font-bold text-brand-navy">Our Mission</h2>
          <p className="text-2xl font-serif italic text-brand-navy/70 leading-relaxed">
            "To empower our community through expert real estate guidance, fostering trust and long-term relationships while helping every client find their perfect place in West Virginia."
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            <div className="space-y-4">
              <Users className="w-10 h-10 text-brand-gold mx-auto" />
              <h4 className="font-serif text-xl font-bold text-brand-navy">Community First</h4>
              <p className="text-gray-600 text-sm">We are deeply rooted in Pennsboro and care about its future.</p>
            </div>
            <div className="space-y-4">
              <Heart className="w-10 h-10 text-brand-gold mx-auto" />
              <h4 className="font-serif text-xl font-bold text-brand-navy">Personal Care</h4>
              <p className="text-gray-600 text-sm">Every client receives dedicated, one-on-one attention.</p>
            </div>
            <div className="space-y-4">
              <CheckCircle2 className="w-10 h-10 text-brand-gold mx-auto" />
              <h4 className="font-serif text-xl font-bold text-brand-navy">Proven Integrity</h4>
              <p className="text-gray-600 text-sm">Honesty and transparency are the foundations of our work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Spotlight */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
                  alt="Janet - Principal Broker"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white">
                  <h3 className="text-4xl font-serif font-bold">Janet</h3>
                  <p className="text-brand-gold font-bold uppercase tracking-widest text-sm">Principal Broker & Owner</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold text-brand-navy">Meet Janet</h2>
                <div className="w-20 h-1 bg-brand-gold"></div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                With over two decades of experience in the West Virginia real estate market, Janet has become a household name in Pennsboro. Her reputation for "going above and beyond" isn't just a slogan—it's how she does business every day.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Janet's deep understanding of local market trends, combined with her vast network of contacts, allows her to provide clients with a competitive edge. But more importantly, she listens. She understands that she's not just selling houses; she's helping people start new chapters.
              </p>
              <div className="space-y-4">
                <h4 className="font-serif text-xl font-bold text-brand-navy">Specialties:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <li className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    Residential Sales
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    First-Time Buyers
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    Luxury Estates
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    Relocation Expert
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
