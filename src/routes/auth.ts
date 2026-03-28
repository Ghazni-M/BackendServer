// routes/auth.ts
import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import db from '../db.js'; // your better-sqlite3 instance
import { sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// ── Forgot Password ──────────────────────────────────────
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find user (case-insensitive email)
    const user = db
      .prepare('SELECT id, email, name FROM users WHERE email = ?')
      .get(email.toLowerCase()) as { id: number; email: string; name: string } | undefined;

    // Security best practice: always return the same message
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate secure, random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = bcrypt.hashSync(resetToken, 12);

    // Expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store in password_resets table
    db.prepare(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, hashedToken, expiresAt);

    // Build secure reset link (use your real frontend URL in production)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send email asynchronously (don't block the response)
    sendPasswordResetEmail(user.email, resetLink).catch((err) => {
      console.error('Failed to send reset email:', err);
      // Optionally log to error service (Sentry, etc.) — don't fail the request
    });

    res.status(200).json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── Reset Password ───────────────────────────────────────
router.post('/reset-password', (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    return res.status(400).json({ message: 'Token, email, and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  try {
    // Find the user by email
    const user = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email.toLowerCase()) as { id: number } | undefined;

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    // Find the most recent valid reset token for this user
    const resetRecord = db
      .prepare(`
        SELECT id, token, expires_at 
        FROM password_resets 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `)
      .get(user.id) as
      | { id: number; token: string; expires_at: string }
      | undefined;

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    // Check expiry
    const expires = new Date(resetRecord.expires_at);
    if (new Date() > expires) {
      // Optional: clean up expired token
      db.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id);
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    // Verify the provided token against the stored hash
    const isValid = bcrypt.compareSync(token, resetRecord.token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 12);

    // Update user's password
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);

    // Delete the used reset token (single-use)
    db.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id);

    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

export default router;