// src/utils/email.ts

import nodemailer from 'nodemailer';

console.log('SMTP config loaded:', {
  host: process.env.SMTP_HOST,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? '****' : 'missing',
  from: process.env.SMTP_FROM,
});

// ─────────────────────────────────────────
// 1. Create transporter (with safe defaults)
// ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─────────────────────────────────────────
// 2. Verify transporter ONCE at startup
// ─────────────────────────────────────────
(async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter ready');
  } catch (error) {
    console.error('❌ Email transporter error:', error);
  }
})();

// ─────────────────────────────────────────
// 3. Send Welcome Email
// ─────────────────────────────────────────
export async function sendWelcomeEmail(to: string): Promise<void> {
  try {
    console.log('📧 Preparing email for:', to);

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Ritchie Realty" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome to Ritchie Realty Newsletter!',

      text: `Thank you for subscribing!

We'll keep you updated with the latest real estate news, market trends, and exclusive listings.

Best regards,
The Ritchie Realty Team`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #001F3F;">Welcome to Ritchie Realty!</h1>

          <p>Hi there,</p>

          <p>
            Thank you for subscribing to our newsletter! We're excited to have you with us.
          </p>

          <p>
            You'll now receive the latest real estate updates, market trends, and exclusive listings.
          </p>

          <p style="margin-top: 24px;">
            <strong>Stay tuned!</strong><br/>
            The Ritchie Realty Team
          </p>

          <hr style="margin: 30px 0;" />

          <p style="font-size: 12px; color: #777;">
            You received this email because you subscribed.<br/>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent(to)}">
              Unsubscribe
            </a>
          </p>
        </div>
      `,
    });

    // 🔥 IMPORTANT: log full response
    console.log('✅ Email sent!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err: any) {
    console.error('❌ Failed to send email to:', to);
    console.error('Error message:', err?.message);
    console.error('Full error:', err);

    throw err; // rethrow so your route logs it too
  }
}