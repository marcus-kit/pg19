import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface EmailAuthSendRequest {
  email: string;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(to: string, code: string): Promise<void> {
  const smtpUser = Deno.env.get('SMTP_USER') ?? '';
  const smtpPass = Deno.env.get('SMTP_PASS') ?? '';

  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: {
        username: smtpUser,
        password: smtpPass,
      },
    },
  });

  await client.send({
    from: smtpUser,
    to: to,
    subject: 'Verification Code PG19',
    content: `Your verification code: ${code}\n\nCode is valid for 5 minutes.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Verification Code</h2>
        <p style="color: #666; margin-bottom: 20px;">Your PG19 login code:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${code}</span>
        </div>
        <p style="color: #999; font-size: 14px;">Code is valid for 5 minutes.</p>
      </body>
      </html>
    `,
  });

  await client.close();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { email } = await req.json() as EmailAuthSendRequest;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Email not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create auth session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        method: 'email',
        identifier: email,
        verification_code: verificationCode,
        person_id: user.id,
        expires_at: expiresAt.toISOString(),
        metadata: {},
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Send email
    try {
      await sendEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id.toString(),
        expiresIn: 300,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
