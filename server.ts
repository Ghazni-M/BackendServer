// server.ts
// ────────────────────────────────────────────────────────────────────────
// Main backend server for Ritchie Realty real estate platform
// ────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import db from './src/db.js';
import { sendPasswordResetEmail } from './src/utils/email.js';
import { sendWelcomeEmail } from './src/utils/blogmail.js';

// ────────────────────────────────────────────────────────────────────────
// ESM __dirname fix
// ────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

const PORT = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_EXPIRY = '15m';
const COOKIE_MAX_AGE_MS = 15 * 60 * 1000;

// ────────────────────────────────────────────────────────────────────────
// SQLite tuning
// ────────────────────────────────────────────────────────────────────────

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');

// ────────────────────────────────────────────────────────────────────────
// Upload setup
// ────────────────────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, 'public/uploads');

// Ensure directory exists (safe for production)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Multer Configuration (secure)
// ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // Normalize extension to lowercase
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter (ONLY images)
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

// Final upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// ────────────────────────────────────────────────────────────────────────
// Rate limiters
// ────────────────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiWriteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many requests, slow down' },
});

// ────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────

type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string; // 'agent' | 'owner' assumed
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}


// ────────────────────────────────────────────────────────────────────────
// Middlewares
// ────────────────────────────────────────────────────────────────────────

const authenticate: RequestHandler = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized – no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

const restrictTo = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden – insufficient permissions' });
    }
    next();
  };
};

const requirePropertyOwnership: RequestHandler = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ success: false, error: 'Invalid property ID' });
  }

  const prop = db.prepare('SELECT agent_id FROM properties WHERE id = ?').get(id) as { agent_id: number } | undefined;

  if (!prop) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }

  if (req.user!.role !== 'owner' && prop.agent_id !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'You do not own this property' });
  }

  next();
};

const requirePostOwnership: RequestHandler = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ success: false, error: 'Invalid post ID' });
  }

  const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(id) as { author_id: number } | undefined;

  if (!post) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  if (req.user!.role !== 'owner' && post.author_id !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'You are not the author of this post' });
  }

  next();
};

// ────────────────────────────────────────────────────────────────────────
// Server bootstrap
// ────────────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();

  // ── Security headers (updated to allow Google Fonts)
  app.use(helmet({
    contentSecurityPolicy: isProduction ? true : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'http://localhost:*'],
        frameSrc: ["'self'", 'https://www.google.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  }));

  app.use(cors({
    origin: isProduction
      ? process.env.FRONTEND_URL || 'https://yourdomain.com'
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadDir));

  // ── Auth routes ───────────────────────────────────────────────────────

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET as string,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: COOKIE_MAX_AGE_MS,
        path: '/',
      });

      res.json({
        success: true,
        accessToken: token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });


    app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'No authentication token found',
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as AuthUser;

      // Sliding expiration (optional – uncomment to enable)
      // res.cookie('token', token, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: COOKIE_MAX_AGE_MS, path: '/' });

      return res.json({
        success: true,
        authenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Invalid or expired token',
      });
    }
  });

  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    const { email } = req.body;
    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    try {
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return res.json({ success: true });
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      db.prepare(`
        UPDATE users
        SET reset_token = ?, reset_token_expiry = strftime('%s','now') + 3600
        WHERE id = ?
      `).run(hashedToken, user.id);

      const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;

      await sendPasswordResetEmail(email, url);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: true });
    }
  });

  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Invalid or weak password' });
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'Password must contain uppercase and number' });
    }

    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = db.prepare(`
        SELECT * FROM users 
        WHERE reset_token = ? AND reset_token_expiry > strftime('%s','now')
      `).get(hashedToken) as any;

      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid or expired token' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      db.prepare(`
        UPDATE users
        SET password = ?, reset_token = NULL, reset_token_expiry = NULL
        WHERE id = ?
      `).run(hashedPassword, user.id);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ── File upload ───────────────────────────────────────────────────────

  app.post('/api/upload', authenticate, apiWriteLimiter, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No valid image uploaded' });
    }
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
  });

  // ── Users (owner only) ────────────────────────────────────────────────

  app.get('/api/users', authenticate, restrictTo('owner'), (_req, res) => {
    const users = db.prepare('SELECT id, name, email, role FROM users').all();
    res.json({ success: true, users });
  });

  // ── CREATE USER (owner only) ──────────────────────────────────────────
  app.post('/api/users', authenticate, restrictTo('owner'), async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required' });
    }

    if (!['agent', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role. Must be "agent" or "owner"' });
    }

    try {
      const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 12);

      const result = db.prepare(`
        INSERT INTO users (name, email, password, role, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(name.trim(), email.trim().toLowerCase(), hashedPassword, role);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        id: result.lastInsertRowid,
      });
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  });

  // ── UPDATE USER (owner only) ──────────────────────────────────────────
  app.put('/api/users/:id', authenticate, restrictTo('owner'), async (req, res) => {
    const { name, email, password, role } = req.body;
    const id = req.params.id;

    if (!name?.trim() || !email?.trim() || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, and role are required' });
    }

    if (!['agent', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    try {
      const updates: string[] = [];
      const params: any[] = [];

      updates.push('name = ?'); params.push(name.trim());
      updates.push('email = ?'); params.push(email.trim().toLowerCase());
      updates.push('role = ?'); params.push(role);

      if (password?.trim()) {
        const hashed = await bcrypt.hash(password.trim(), 12);
        updates.push('password = ?');
        params.push(hashed);
      }

      params.push(id);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      const result = db.prepare(query).run(...params);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }
  });

  // ── DELETE USER (owner only) ──────────────────────────────────────────
  app.delete('/api/users/:id', authenticate, restrictTo('owner'), (req, res) => {
    const id = req.params.id;

    try {
      const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  });

  // ── Properties ────────────────────────────────────────────────────────

  // Properties
  app.get('/api/properties', (req, res) => {
    const properties = db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all();
    res.json(properties.map((p: any) => ({
      ...p,
      images: JSON.parse(p.images),
      features: JSON.parse(p.features || '[]'),
      featured: !!p.featured,
      acreage: p.acreage || 0,
      zoning: p.zoning || ''
    })));
  });

  app.get('/api/properties/:id', (req, res) => {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id) as any;
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json({
      ...property,
      images: JSON.parse(property.images),
      features: JSON.parse(property.features || '[]'),
      featured: !!property.featured,
      acreage: property.acreage || 0,
      zoning: property.zoning || ''
    });
  });

  app.post('/api/properties', authenticate, (req, res) => {
    const { title, price, address, city, state, zip, beds, baths, sqft, type, status, featured, imageUrl, images, videoUrl, virtualTourUrl, description, features, acreage, zoning } = req.body;
    const result = db.prepare(`
      INSERT INTO properties (title, price, address, city, state, zip, beds, baths, sqft, type, status, featured, imageUrl, images, videoUrl, virtualTourUrl, description, features, acreage, zoning, agent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, price, address, city, state, zip, beds, baths, sqft, type, status, featured ? 1 : 0, imageUrl, JSON.stringify(images), videoUrl, virtualTourUrl, description, JSON.stringify(features || []), acreage || 0, zoning || '', (req as any).user.id);
    
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/properties/:id', authenticate, (req, res) => {
    const { title, price, address, city, state, zip, beds, baths, sqft, type, status, featured, imageUrl, images, videoUrl, virtualTourUrl, description, features, acreage, zoning } = req.body;
    db.prepare(`
      UPDATE properties 
      SET title = ?, price = ?, address = ?, city = ?, state = ?, zip = ?, beds = ?, baths = ?, sqft = ?, type = ?, status = ?, featured = ?, imageUrl = ?, images = ?, videoUrl = ?, virtualTourUrl = ?, description = ?, features = ?, acreage = ?, zoning = ?
      WHERE id = ?
    `).run(title, price, address, city, state, zip, beds, baths, sqft, type, status, featured ? 1 : 0, imageUrl, JSON.stringify(images), videoUrl, virtualTourUrl, description, JSON.stringify(features || []), acreage || 0, zoning || '', req.params.id);
    
    res.json({ success: true });
  });

  app.delete('/api/properties/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

 // Inquiries
  app.get('/api/inquiries', authenticate, (req, res) => {
    const inquiries = db.prepare(`
      SELECT i.*, p.title as property_title 
      FROM inquiries i 
      LEFT JOIN properties p ON i.property_id = p.id 
      ORDER BY i.created_at DESC
    `).all();
    res.json(inquiries);
  });

  app.post('/api/inquiries', (req, res) => {
    const { property_id, name, email, phone, message } = req.body;
    db.prepare(`
      INSERT INTO inquiries (property_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(property_id || null, name, email, phone, message);
    res.json({ success: true });
  });

  app.put('/api/inquiries/:id', authenticate, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/inquiries/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

    // Favorites
  app.get('/api/favorites', authenticate, (req, res) => {
    const userId = (req as any).user.id;
    const favorites = db.prepare(`
      SELECT p.* 
      FROM properties p 
      JOIN favorites f ON p.id = f.property_id 
      WHERE f.user_id = ?
    `).all(userId);
    
    res.json(favorites.map((p: any) => ({
      ...p,
      images: JSON.parse(p.images),
      features: JSON.parse(p.features || '[]'),
      featured: !!p.featured,
      acreage: p.acreage || 0,
      zoning: p.zoning || ''
    })));
  });

  app.get('/api/favorites/ids', authenticate, (req, res) => {
    const userId = (req as any).user.id;
    const favorites = db.prepare('SELECT property_id FROM favorites WHERE user_id = ?').all(userId) as any[];
    res.json(favorites.map(f => f.property_id));
  });

  app.post('/api/favorites/:propertyId', authenticate, (req, res) => {
    const userId = (req as any).user.id;
    const propertyId = req.params.propertyId;
    try {
      db.prepare('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)').run(userId, propertyId);
      res.json({ success: true });
    } catch (err) {
      // If already favorited, just return success
      res.json({ success: true });
    }
  });

  app.delete('/api/favorites/:propertyId', authenticate, (req, res) => {
    const userId = (req as any).user.id;
    const propertyId = req.params.propertyId;
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').run(userId, propertyId);
    res.json({ success: true });
  });

  // Blog Posts
  app.get('/api/posts', (req, res) => {
    const posts = db.prepare('SELECT p.*, u.email as author_email FROM posts p LEFT JOIN users u ON p.author_id = u.id ORDER BY created_at DESC').all();
    res.json(posts);
  });

  app.get('/api/posts/:slug', (req, res) => {
    const post = db.prepare('SELECT p.*, u.email as author_email FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.slug = ?').get(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  });

  app.post('/api/posts', authenticate, (req, res) => {
    const { title, slug, excerpt, content, imageUrl } = req.body;
    const result = db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, imageUrl, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, slug, excerpt, content, imageUrl, (req as any).user.id);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/posts/:id', authenticate, (req, res) => {
    const { title, slug, excerpt, content, imageUrl } = req.body;
    db.prepare(`
      UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, imageUrl = ? WHERE id = ?
    `).run(title, slug, excerpt, content, imageUrl, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/posts/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

// ── Newsletter subscription ────────────────────────────────────────────

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  // ─────────────────────────────────────────
  // 1. Validate email
  // ─────────────────────────────────────────
  const isValidEmail =
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  if (!isValidEmail) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid email address',
    });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    // ─────────────────────────────────────────
    // 2. Check duplicate subscription
    // ─────────────────────────────────────────
    const existing = db
      .prepare('SELECT 1 FROM subscribers WHERE email = ?')
      .get(trimmedEmail);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'This email is already subscribed',
      });
    }

    // ─────────────────────────────────────────
    // 3. Save subscriber to DB
    // ─────────────────────────────────────────
    db.prepare(`
      INSERT INTO subscribers (email, source, subscribed_at)
      VALUES (?, ?, datetime('now'))
    `).run(trimmedEmail, 'blog_post');

    console.log('📩 New subscriber saved:', trimmedEmail);

    // ─────────────────────────────────────────
    // 4. SMTP Debug Logs
    // ─────────────────────────────────────────
    console.log('[SUBSCRIBE] SMTP check starting...');
    console.log('[SUBSCRIBE] SMTP_HOST:', process.env.SMTP_HOST || '(missing)');
    console.log('[SUBSCRIBE] SMTP_USER:', process.env.SMTP_USER || '(missing)');
    console.log('[SUBSCRIBE] SMTP_PASS:', process.env.SMTP_PASS ? 'present' : '(missing)');

    const smtpReady =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS;

    let emailSent = false;

    // ─────────────────────────────────────────
    // 5. Send welcome email
    // ─────────────────────────────────────────
    if (smtpReady) {
      console.log('[SUBSCRIBE] SMTP vars present → attempting email send');

      try {
        console.log('[EMAIL] Calling sendWelcomeEmail for:', trimmedEmail);

        await sendWelcomeEmail(trimmedEmail);

        emailSent = true;

        console.log('[EMAIL] sendWelcomeEmail completed successfully');
      } catch (emailErr: any) {
        console.error('[EMAIL-ERROR] sendWelcomeEmail failed:');
        console.error('Message:', emailErr?.message);
        console.error('Stack:', emailErr?.stack);
        console.error('Full error:', JSON.stringify(emailErr, null, 2));
      }
    } else {
      console.warn('[SUBSCRIBE] SMTP not configured — skipping email');
    }

    // ─────────────────────────────────────────
    // 6. Success response
    // ─────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Thank you! You are now subscribed.',
      emailSent,
    });
  } catch (err) {
    // ─────────────────────────────────────────
    // 7. Server error
    // ─────────────────────────────────────────
    console.error('❌ Subscribe error:', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to subscribe',
    });
  }
});

  // ── Dashboard Stats ───────────────────────────────────────────────────

  // Dashboard Stats
  app.get('/api/stats', authenticate, (req, res) => {
    const totalListings = db.prepare('SELECT count(*) as count FROM properties').get() as any;
    const activeListings = db.prepare("SELECT count(*) as count FROM properties WHERE status = 'Available'").get() as any;
    const soldListings = db.prepare("SELECT count(*) as count FROM properties WHERE status = 'Sold'").get() as any;
    const totalInquiries = db.prepare('SELECT count(*) as count FROM inquiries').get() as any;
    const featuredProperties = db.prepare('SELECT count(*) as count FROM properties WHERE featured = 1').get() as any;
    const recentActivity = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5').all();

    res.json({
      totalListings: totalListings.count,
      activeListings: activeListings.count,
      soldListings: soldListings.count,
      totalInquiries: totalInquiries.count,
      featuredProperties: featuredProperties.count,
      recentActivity
    });
  });
  // ── Vite / SPA serving ────────────────────────────────────────────────

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  // ── Global error handler ──────────────────────────────────────────────

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Global error:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Internal server error' : (err.message || 'Something went wrong');
    res.status(status).json({ success: false, error: message });
  });

  // ── Start server ──────────────────────────────────────────────────────

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
