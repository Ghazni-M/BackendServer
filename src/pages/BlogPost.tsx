import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // ← corrected import
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Heart,
  Check,
  Printer,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Post } from '../types.js';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save/unsave check
  useEffect(() => {
    if (post?.id) {
      const savedPosts = JSON.parse(localStorage.getItem('saved_posts') || '[]') as (string | number)[];
      setIsSaved(savedPosts.includes(post.id));
    }
  }, [post?.id]);

  // Fetch post
  useEffect(() => {
    if (!slug) {
      setError('No post slug provided');
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/posts/${slug}`);

        if (response?.success && response.post) {
          setPost(response.post);
        } else {
          setError('Post not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = async () => {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: post.excerpt || 'Check out this article!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Could not share');
    }
  };

  const handleSave = () => {
    if (!post?.id) return;

    const savedPosts = JSON.parse(localStorage.getItem('saved_posts') || '[]') as (string | number)[];
    let newSavedPosts: (string | number)[];

    if (isSaved) {
      newSavedPosts = savedPosts.filter(id => id !== post.id);
    } else {
      newSavedPosts = [...savedPosts, post.id];
    }

    localStorage.setItem('saved_posts', JSON.stringify(newSavedPosts));
    setIsSaved(!isSaved);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubscribed(true);
        setSubscribeEmail('');
        alert('Thank you! Check your inbox for a welcome email.');
      } else {
        alert(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Failed to subscribe – please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-40 pb-20 text-center animate-pulse">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
          <div className="h-64 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-navy mb-4">
          {error || 'Post Not Found'}
        </h2>
        <Link to="/blog" className="text-brand-gold hover:underline font-medium">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-brand-cream">
      {/* Header */}
      <section className="bg-brand-navy text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-brand-gold font-bold hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Blog
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-tight"
          >
            {post.title}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-medium uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-gold" />
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand-gold" />
              By {post.author_email?.split('@')[0] || 'Admin'}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-xl -mt-16 md:-mt-32 relative z-10">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={post.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'}
                alt={post.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-8 md:p-16 prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-brand-navy prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-brand-navy prose-a:text-brand-gold hover:prose-a:underline">
              <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            </div>

            {/* Actions */}
            <div className="pt-12 border-t border-gray-100 flex flex-wrap items-center justify-between gap-6 px-8 md:px-16 pb-12">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-cream text-brand-navy font-bold hover:bg-brand-gold hover:text-white transition-all"
                >
                  <Share2 className="w-5 h-5" /> Share
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-bold transition-all ${
                    isSaved
                      ? 'bg-brand-gold border-brand-gold text-brand-navy'
                      : 'border-brand-cream text-brand-navy hover:border-brand-gold'
                  }`}
                >
                  {isSaved ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 text-gray-500 hover:text-brand-navy font-medium transition-colors"
              >
                <Printer className="w-5 h-5" /> Print
              </button>
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="mt-20 bg-brand-navy text-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl text-center space-y-8">
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
                <p className="text-gray-300 max-w-xl mx-auto">
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
                <h3 className="text-3xl font-serif font-bold">Stay Updated</h3>
                <p className="text-gray-300 max-w-xl mx-auto">
                  Subscribe to receive the latest real estate tips, market updates, and exclusive content directly in your inbox.
                </p>

                <form
                  className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
                  onSubmit={handleSubscribe}
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    className="flex-grow px-8 py-4 rounded-full bg-white/10 border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-white placeholder-gray-300"
                  />
                  <button
                    disabled={isSubmitting}
                    className="btn-primary px-10 py-4 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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