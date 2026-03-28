import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Listings } from './pages/Listings';
import { Services } from './pages/Services';
import { Testimonials } from './pages/Testimonials';
import { Contact } from './pages/Contact';
import { PropertyDetails } from './pages/PropertyDetails';
import { Privacy, Terms } from './pages/Legal';
import { Sitemap } from './pages/Sitemap';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';

// Admin Pages
import { Login as AdminLogin } from './pages/admin/Login';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Properties as AdminProperties } from './pages/admin/Properties';
import { PropertyForm as AdminPropertyForm } from './pages/admin/PropertyForm';
import { Inquiries as AdminInquiries } from './pages/admin/Inquiries';
import { BlogList as AdminBlogList } from './pages/admin/BlogList';
import { BlogForm as AdminBlogForm } from './pages/admin/BlogForm';
import { Users as AdminUsers } from './pages/admin/Users';
import { Settings as AdminSettings } from './pages/admin/Settings';
import { AdminLayout } from './components/AdminLayout';

// ── Add this import ───────────────────────────────────────────────────────
import ResetPassword from './pages/ResetPassword';   // adjust path if different

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/listings" element={<PublicLayout><Listings /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/testimonials" element={<PublicLayout><Testimonials /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/property/:id" element={<PublicLayout><PropertyDetails /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/sitemap" element={<PublicLayout><Sitemap /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />

      {/* ── Add this line for reset password ──────────────────────────────── */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/properties" element={<AdminLayout><AdminProperties /></AdminLayout>} />
      <Route path="/admin/properties/new" element={<AdminLayout><AdminPropertyForm /></AdminLayout>} />
      <Route path="/admin/properties/edit/:id" element={<AdminLayout><AdminPropertyForm /></AdminLayout>} />
      <Route path="/admin/inquiries" element={<AdminLayout><AdminInquiries /></AdminLayout>} />
      <Route path="/admin/blog" element={<AdminLayout><AdminBlogList /></AdminLayout>} />
      <Route path="/admin/blog/new" element={<AdminLayout><AdminBlogForm /></AdminLayout>} />
      <Route path="/admin/blog/edit/:id" element={<AdminLayout><AdminBlogForm /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />

      {/* Optional: fallback 404 inside Routes */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}