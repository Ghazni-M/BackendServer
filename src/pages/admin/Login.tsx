import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api.js';

export const Login = () => {
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-clear success message after 6 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      // If your backend returns a token or user data, store it here (e.g. localStorage / context)
      // localStorage.setItem('token', response.data.token);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(
        'If an account exists with this email, a password reset link has been sent.'
      );
      setEmail(''); // optional: clear email field after success
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Unable to process request. Please try again later.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-gray-100"
      >
        <div className="text-center mb-12">
          <div className="bg-brand-navy w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Home className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-navy mb-2">
            {view === 'login' ? 'Admin Login' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-sm">
            {view === 'login'
              ? 'Welcome back to Ritchie Realty, Inc.'
              : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 mb-8 text-sm border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 mb-8 text-sm border border-green-200">
            <Check className="w-5 h-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-brand-navy ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="admin@email.com"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-gray-800"
                />
              </div>
            </div>

            {/* Password with visibility toggle */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-brand-navy ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-navy"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Login to Dashboard'
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setView('forgot-password');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-sm text-brand-navy font-semibold hover:text-brand-gold transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-semibold text-brand-navy ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-sm text-brand-navy font-semibold hover:text-brand-gold transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact the system administrator.
          </p>
        </div>
      </motion.div>
    </div>
  );
};