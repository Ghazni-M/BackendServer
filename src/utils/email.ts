// src/utils/email.ts
import nodemailer from 'nodemailer';

// ────────────────────────────────────────────────
// Load and validate environment variables
// ────────────────────────────────────────────────
const env = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true = 465/SSL, false = 587/STARTTLS
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_APP_PASSWORD,
  from: process.env.EMAIL_FROM || '"Ritchie Realty" <no-reply@ritchierealty.com>',
};

const missing = [];
if (!env.user) missing.push('EMAIL_USER');
if (!env.pass) missing.push('EMAIL_APP_PASSWORD');

if (missing.length > 0) {
  console.warn(
    `[EMAIL] Missing required env vars: ${missing.join(', ')}. ` +
    `Real emails disabled. Falling back to console logging.`
  );
}

// ────────────────────────────────────────────────
// Create transporter
// ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: env.host,
  port: env.port,
  secure: env.secure, // true for 465, false for 587
  auth: {
    user: env.user,
    pass: env.pass,
  },
  // Optional: helps with self-signed certs or dev issues (remove in strict prod)
  tls: process.env.NODE_ENV === 'development' ? { rejectUnauthorized: false } : undefined,
});

// Verify connection (logs in dev, silent in prod)
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((error) => {
    if (error) {
      console.error('[EMAIL] SMTP connection verification failed:', error.message);
    } else {
      console.log('[EMAIL] SMTP connection verified successfully');
    }
  });
}

// ────────────────────────────────────────────────
// Send Password Reset Email
// ────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  // Development / missing creds fallback
  if (!env.user || !env.pass) {
    console.log('\n' + '═'.repeat(60));
    console.log('       PASSWORD RESET LINK (DEVELOPMENT / NO SMTP)       ');
    console.log('═'.repeat(60));
    console.log(`To: ${to}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('Valid for 1 hour. Open in browser to reset password.');
    console.log('Real sending disabled — add EMAIL_USER & EMAIL_APP_PASSWORD to .env');
    console.log('═'.repeat(60) + '\n');
    return;
  }

  const mailOptions = {
    from: env.from,
    to,
    subject: 'Reset Your Ritchie Realty Password',

    text: `
Hello,

You requested a password reset for your Ritchie Realty account.

Click or copy-paste this link to set a new password:

${resetLink}

This link expires in 1 hour.

If you did not request this, please ignore this email.

Best regards,
Janet Stanley
Ritchie Realty
    `.trim(),

    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
        <h2 style="color: #1e40af; margin-bottom: 24px;">Reset Your Password</h2>

        <p>Hello,</p>

        <p>
          You (or someone) requested a password reset for your 
          <strong>Ritchie Realty</strong> account.
        </p>

        <p style="margin: 32px 0;">
          <a href="${resetLink}"
             style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; 
                    border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </p>

        <p style="color: #555; font-size: 14px;">
          This link will expire in <strong>1 hour</strong>.
        </p>

        <p style="color: #555;">
          If you did not request this reset, you can safely ignore this email.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 14px; color: #777;">
          Best regards,<br />
          Janet Stanley<br />
          Ritchie Realty
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Reset email sent to ${to} → Message ID: ${info.messageId}`);
  } catch (err: any) {
    console.error('[EMAIL] Failed to send reset email:');
    console.error('Error:', err.message);
    if (err.response) console.error('SMTP Response:', err.response);
    if (err.code) console.error('Error Code:', err.code);
    throw new Error(`Failed to send password reset email: ${err.message}`);
  }
}