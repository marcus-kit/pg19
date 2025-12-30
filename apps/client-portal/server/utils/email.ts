/**
 * Email service for sending verification codes
 *
 * Supports two modes:
 * 1. RabbitMQ (production) - queues email for async sending by email-worker
 * 2. Direct SMTP (fallback) - sends directly via nodemailer
 */

import nodemailer from 'nodemailer';
import type { RuntimeConfig } from 'nuxt/schema';
import { queueEmailSend } from './rabbitmq';

/**
 * Send verification code email
 *
 * Priority:
 * 1. If RabbitMQ proxy is configured -> queue to RabbitMQ
 * 2. If SMTP is configured -> send directly
 * 3. Fallback -> log to console (dev mode)
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  config: RuntimeConfig
): Promise<void> {
  // Try RabbitMQ first (production mode)
  if (config.rabbitmqProxyUrl) {
    try {
      await queueEmailSend({ to, code, template: 'verification' }, config);
      console.log(`[Email] Queued to RabbitMQ for ${to}`);
      return;
    } catch (error) {
      console.warn(`[Email] RabbitMQ failed, falling back to direct SMTP:`, error);
      // Fall through to direct SMTP
    }
  }

  // Direct SMTP (fallback or dev mode)
  await sendDirectEmail(to, code, config);
}

/**
 * Send email directly via SMTP (nodemailer)
 */
async function sendDirectEmail(
  to: string,
  code: string,
  config: RuntimeConfig
): Promise<void> {
  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, smtpFromName, smtpFromEmail } = config;

  // Check if SMTP is configured
  if (!smtpHost || !smtpUser) {
    console.log(`[Email Mock] Code for ${to}: ${code}`);
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost as string,
    port: smtpPort as number,
    secure: smtpSecure as boolean,
    auth: {
      user: smtpUser as string,
      pass: smtpPassword as string,
    },
  });

  const { html, text } = buildEmailContent(code);

  // Send email
  await transporter.sendMail({
    from: `"${smtpFromName}" <${smtpFromEmail}>`,
    to,
    subject: `${code} — code for login to PG19`,
    text,
    html,
  });

  console.log(`[Email] Sent directly to ${to}`);
}

/**
 * Build email content (HTML + plain text)
 */
export function buildEmailContent(code: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <table cellpadding="0" cellspacing="0" style="width: 100%;">
          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <img src="https://pg19-client.vercel.app/images/logo.png" alt="PG19" style="height: 48px;">
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="text-align: center; padding-bottom: 16px;">
              <h1 style="margin: 0; color: #264895; font-size: 24px; font-weight: 600;">
                Verification Code
              </h1>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Use this code to log into your account:
              </p>
            </td>
          </tr>

          <!-- Code -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #264895;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                Code expires in 5 minutes
              </p>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                If you didn't request this code, please ignore this email.<br>
                Never share this code with anyone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="text-align: center; padding-top: 24px;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          &copy; ${new Date().getFullYear()} PG19. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Verification code for PG19 login: ${code}

Code expires in 5 minutes.

If you didn't request this code, please ignore this email.
  `.trim();

  return { html, text };
}
