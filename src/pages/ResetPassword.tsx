// src/pages/ResetPassword.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ────────────────────────────────────────────────
  // Password validation
  // ────────────────────────────────────────────────
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Include at least one uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Include at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Invalid or missing token');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      console.log('[RESET RESPONSE]', data);

      // ✅ FIXED: check API response properly
      if (data?.success) {
        setSuccess('Password reset successful! Redirecting...');

        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setError(data?.error || data?.message || 'Reset failed');
      }
    } catch (err: any) {
      console.error('[RESET ERROR]', err);

      // Your API throws plain Error(text), not axios-style
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Invalid token UI
  // ────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 mb-6">
            This reset link is invalid or expired.
          </p>

          <Link
            to="/forgot-password"
            className="bg-brand-navy text-white px-6 py-3 rounded-lg hover:bg-brand-navy/90"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Main UI
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-brand-navy text-center mb-6">
          Reset Password
        </h1>

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg text-center font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg text-center">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 border rounded-lg"
            disabled={isLoading || !!success}
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-4 py-3 border rounded-lg"
            disabled={isLoading || !!success}
          />

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full py-3 rounded-lg text-white bg-brand-navy"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/admin/login" className="text-brand-gold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
