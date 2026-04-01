import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { About } from './pages/About.js';
import { Listings } from './pages/Listings.js';
import { Services } from './pages/Services.js';
import { Testimonials } from './pages/Testimonials.js';
import { Contact } from './pages/Contact.js';
import { PropertyDetails } from './pages/PropertyDetails.js';
import { Privacy, Terms } from './pages/Legal.js';
import { Sitemap } from './pages/Sitemap.js';
import { Blog } from './pages/Blog.js';
import { BlogPost } from './pages/BlogPost.js';

// Admin Pages
import { Login as AdminLogin } from './pages/admin/Login.js';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard.js';
import { Properties as AdminProperties } from './pages/admin/Properties.js';
import { PropertyForm as AdminPropertyForm } from './pages/admin/PropertyForm.js';
import { Inquiries as AdminInquiries } from './pages/admin/Inquiries.js';
import { BlogList as AdminBlogList } from './pages/admin/BlogList.js';
import { BlogForm as AdminBlogForm } from './pages/admin/BlogForm.js';
import { Users as AdminUsers } from './pages/admin/Users.js';
import { Settings as AdminSettings } from './pages/admin/Settings.js';
import { AdminLayout } from './components/AdminLayout.js';

// ── Add this import ───────────────────────────────────────────────────────
import ResetPassword from './pages/ResetPassword.js';   // adjust path if different

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
