// netlify/functions/subscribe.ts
import type { Handler, HandlerEvent } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event: HandlerEvent) => {
  const method = event.httpMethod;

  // Handle CORS preflight (OPTIONS) first
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST after OPTIONS check
  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
    };
  }

  // CORS headers for the actual POST response
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      };
    }

    const { email } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Valid email address required' }),
      };
    }

    const trimmedEmail = email.trim().toLowerCase();

    console.log(`[subscribe] New subscription attempt: ${trimmedEmail}`);

    const { data, error } = await resend.emails.send({
      from: 'Ritchie Realty <onboarding@resend.dev>',
      to: trimmedEmail,
      subject: 'Welcome to Ritchie Realty Newsletter!',
      text: `Thank you for subscribing!\n\nWe'll keep you updated with the latest real estate news, market trends, and exclusive listings in Pennsboro and Ritchie County, WV.\n\nBest regards,\nThe Ritchie Realty Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #001F3F;">Welcome to Ritchie Realty!</h1>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! We're excited to have you with us.</p>
          <p>You'll now receive the latest real estate updates, market trends, new property listings, and exclusive insights.</p>
          <p style="margin-top: 32px;"><strong>Stay tuned!</strong><br>The Ritchie Realty Team</p>
          <hr style="margin: 30px 0;" />
          <p style="font-size: 12px; color: #777;">
            You received this email because you subscribed.<br/>
            <a href="${process.env.FRONTEND_URL || 'https://your-site.netlify.app'}/unsubscribe?email=${encodeURIComponent(trimmedEmail)}" style="color: #666;">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[subscribe] Resend error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to send welcome email' }),
      };
    }

    console.log(`[subscribe] Welcome email sent → ID: ${data?.id}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you! You are now subscribed. Check your inbox.',
      }),
    };
  } catch (err: any) {
    console.error('[subscribe] Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Server error' }),
    };
  }
};