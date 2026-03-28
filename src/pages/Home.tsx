import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { TESTIMONIALS, SERVICES } from '../constants.js';
import { PropertyCard } from '../components/PropertyCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { ContactForm } from '../components/ContactForm';
import { api } from '../services/api.js';
import { Property } from '../types.js';
import * as Icons from 'lucide-react';

export const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.get('/properties');
        setFeaturedProperties(data.filter((p: any) => p.featured).slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch featured properties', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920"
            alt="West Virginia Landscape"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
          >
            Guiding You Home <br />
            <span className="italic text-brand-gold">with Confidence.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light"
          >
            Serving Pennsboro and surrounding West Virginia communities with integrity, care, and deep local expertise.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/listings" className="btn-primary bg-brand-gold hover:bg-brand-gold/90 text-brand-navy">
              Browse Listings
            </Link>
            <Link to="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-brand-navy">
              Sell Your Home
            </Link>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-1 h-12 rounded-full bg-white/30 flex justify-center">
            <div className="w-1 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
                alt="Janet - Trusted Agent"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-brand-navy p-8 rounded-3xl text-white shadow-2xl hidden md:block">
              <p className="font-serif text-3xl font-bold text-brand-gold mb-1">Janet</p>
              <p className="text-sm uppercase tracking-widest font-bold opacity-70">Your Trusted Local Expert</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy">
                Your Trusted Local <br /> Real Estate Experts
              </h2>
              <div className="w-20 h-1 bg-brand-gold"></div>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Ritchie Realty, Inc., we believe that real estate is more than just transactions—it's about building communities and helping families find their place in the world. With years of dedicated service in Pennsboro, we bring unmatched local knowledge and a personalized touch to every client journey.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Led by Janet, our team is committed to integrity, transparency, and results. Whether you're buying your first home or selling a family estate, we're here to guide you every step of the way.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-gold w-6 h-6" />
                <span className="font-semibold text-brand-navy">Local Market Expertise</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-gold w-6 h-6" />
                <span className="font-semibold text-brand-navy">Personalized Service</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-gold w-6 h-6" />
                <span className="font-semibold text-brand-navy">Proven Results</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-gold w-6 h-6" />
                <span className="font-semibold text-brand-navy">Community Focused</span>
              </div>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 text-brand-navy font-bold hover:text-brand-gold transition-colors group">
              Learn More About Us <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Comprehensive real estate solutions tailored to your specific needs in the Pennsboro area.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => {
              const IconComponent = (Icons as any)[service.icon];
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
                >
                  <div className="bg-brand-cream w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-navy transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-brand-navy group-hover:text-brand-gold transition-colors" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-brand-navy mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">{service.description}</p>
                  <Link to={`/services#${service.id}`} className="text-brand-gold font-bold flex items-center gap-2 hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy">Featured Properties</h2>
              <p className="text-gray-500">Discover hand-picked homes and estates in West Virginia.</p>
            </div>
            <Link to="/listings" className="btn-secondary">
              View All Listings
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-96 animate-pulse shadow-sm"></div>
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 italic">
                No featured properties at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-brand-navy text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gold/5 -skew-x-12 transform translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">What Our Clients Say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Real stories from families we've helped find their way home.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-brand-gold">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-navy">Ready to Buy or Sell?</h2>
          <p className="text-xl text-brand-navy/80 font-medium">
            Let's make your real estate journey smooth and successful with the guidance of Pennsboro's most trusted experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="tel:+13046593067" className="btn-primary bg-brand-navy text-white flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Call Now
            </a>
            <Link to="/contact" className="btn-primary bg-white text-brand-navy flex items-center justify-center gap-2">
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section Preview */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy">Get In Touch</h2>
              <p className="text-gray-500">We're here to answer any questions you have about the Pennsboro market.</p>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="bg-brand-cream p-4 rounded-2xl">
                  <MapPin className="text-brand-navy w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-brand-navy mb-1">Our Office</h4>
                  <p className="text-gray-600">1410 Lynn Camp Rd, Pennsboro, WV 26415</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-brand-cream p-4 rounded-2xl">
                  <Phone className="text-brand-navy w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-brand-navy mb-1">Phone</h4>
                  <p className="text-gray-600">+1 304-659-3067</p>
                </div>
              </div>
            </div>

              <div className="rounded-3xl overflow-hidden h-64 md:h-[400px] shadow-2xl border border-gray-100">
              <iframe
                title="Ritchie Realty Office location - 1410 Lynn Camp Rd, Pennsboro, WV"
                className="w-full h-full border-0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3089.8179982866686!2d-80.94562499999999!3d39.247003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88498db28825ad29%3A0xc51a0088fa08b74a!2sRitchie%20Realty%2C%20Inc.!5e0!3m2!1sen!2sus!4v1733347656319!5m2!1sen!2sus" // updated to en/us
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            
          </div>
          
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-50">
            <h3 className="font-serif text-3xl font-bold text-brand-navy mb-8">Send a Message</h3>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};
