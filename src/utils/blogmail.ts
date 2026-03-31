// src/utils/blogmail.ts
import nodemailer from 'nodemailer';

// ────────────────────────────────────────────────
// Environment variables
// ────────────────────────────────────────────────
const env = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || `"Ritchie Realty" <${process.env.SMTP_USER || 'no-reply@ritchierealty.com'}>`,
};

if (!env.host || !env.user || !env.pass) {
  console.warn('[WELCOME EMAIL] Missing SMTP credentials (SMTP_HOST, SMTP_USER, or SMTP_PASS). Emails will be logged only.');
}

// ────────────────────────────────────────────────
// Create transporter with timeouts (prevents hanging)
// ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: env.host,
  port: env.port,
  secure: env.secure,
  auth: {
    user: env.user,
    pass: env.pass,
  },
  // 🔥 Critical for Render Free tier - fail fast
  connectionTimeout: 8000,   // 8 seconds
  greetingTimeout: 8000,
  socketTimeout: 12000,      // 12 seconds
});

// ────────────────────────────────────────────────
// Send Welcome Email
// ────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string): Promise<void> {
  // If credentials missing → just log (no real email)
  if (!env.host || !env.user || !env.pass) {
    console.log('\n' + '═'.repeat(60));
    console.log('          WELCOME EMAIL (NO SMTP CONFIGURED)          ');
    console.log('═'.repeat(60));
    console.log(`To: ${to}`);
    console.log('Welcome to Ritchie Realty Newsletter!');
    console.log('Real email sending is disabled — configure SMTP env vars.');
    console.log('═'.repeat(60) + '\n');
    return;
  }

  try {
    console.log(`[WELCOME EMAIL] Preparing to send to: ${to}`);

    const info = await transporter.sendMail({
      from: env.from,
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
            <a href="${process.env.FRONTEND_URL || 'https://ritchierealty.netlify.app'}/unsubscribe?email=${encodeURIComponent(to)}">
              Unsubscribe
            </a>
          </p>
        </div>
      `,
    });

    console.log(`✅ [WELCOME EMAIL] Sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
  } catch (err: any) {
    console.error(`❌ [WELCOME EMAIL] Failed to send to ${to}`);
    console.error(`   Error: ${err.message}`);
    if (err.code) console.error(`   Code: ${err.code}`);
    if (err.response) console.error(`   SMTP Response: ${err.response}`);
    // Do NOT throw — we use fire-and-forget in the route
  }
}
