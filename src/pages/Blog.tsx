import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Check } from 'lucide-react';
import { api } from '../services/api.js';
import { Post } from '../types.js';

export const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setSubscribeEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.get('/posts');
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-brand-cream">
      {/* Hero Section */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6"
          >
            Real Estate <span className="text-brand-gold italic">Insights</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Stay informed with the latest trends, tips, and news from the Pennsboro real estate market.
          </motion.p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-[2rem] h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                    <img 
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author_email?.split('@')[0]}
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-2xl font-serif font-bold text-brand-navy mb-4 group-hover:text-brand-gold transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-brand-navy font-bold hover:text-brand-gold transition-colors"
                      >
                        Read More <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-navy text-white p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-xl text-center space-y-8">
            {isSubscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 py-8"
              >
                <div className="bg-brand-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-brand-navy w-8 h-8" />
                </div>
                <h3 className="text-3xl font-serif font-bold">You're Subscribed!</h3>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Thank you for joining our newsletter. You'll receive our next update soon.
                </p>
                <button 
                  onClick={() => setIsSubscribed(false)}
                  className="text-brand-gold font-bold hover:underline mt-4"
                >
                  Subscribe another email
                </button>
              </motion.div>
            ) : (
              <>
                <h3 className="text-3xl md:text-4xl font-serif font-bold">Stay in the Loop</h3>
                <p className="text-gray-400 max-w-xl mx-auto text-lg">
                  Subscribe to our newsletter to receive the latest real estate tips and market updates directly in your inbox.
                </p>
                <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubscribe}>
                  <input 
                    type="email" 
                    required
                    placeholder="Your email address"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    className="flex-grow px-8 py-4 rounded-full bg-white/10 border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                  />
                  <button 
                    disabled={isSubmitting}
                    className="btn-primary px-10 py-4 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
