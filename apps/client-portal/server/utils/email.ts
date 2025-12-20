/**
 * Email service for sending verification codes
 */

import nodemailer from 'nodemailer';
import type { RuntimeConfig } from 'nuxt/schema';

/**
 * Send verification code email
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  config: RuntimeConfig
): Promise<void> {
  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, smtpFromName, smtpFromEmail } = config;

  // Check if SMTP is configured
  if (!smtpHost || !smtpUser) {
    console.log(`[Email Mock] Код для ${to}: ${code}`);
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

  // Email content
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
                Код подтверждения
              </h1>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Для входа в личный кабинет используйте код:
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
                Код действителен 5 минут
              </p>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Если вы не запрашивали код, проигнорируйте это письмо.<br>
                Никому не сообщайте этот код.
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
          &copy; ${new Date().getFullYear()} PG19. Все права защищены.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Код подтверждения для входа в личный кабинет PG19: ${code}

Код действителен 5 минут.

Если вы не запрашивали код, проигнорируйте это письмо.
  `.trim();

  // Send email
  await transporter.sendMail({
    from: `"${smtpFromName}" <${smtpFromEmail}>`,
    to,
    subject: `${code} — код для входа в PG19`,
    text,
    html,
  });
}
