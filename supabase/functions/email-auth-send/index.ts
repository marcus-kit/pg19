import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface EmailAuthSendRequest {
  email: string;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create auth session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        method: 'email',
        identifier: email,
        verification_code: verificationCode,
        person_id: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Send email via SMTP webhook/service
    const smtpWebhook = Deno.env.get('SMTP_WEBHOOK_URL');
    if (smtpWebhook) {
      await fetch(smtpWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Код подтверждения PG19',
          text: `Ваш код подтверждения: ${verificationCode}\n\nКод действителен 5 минут.`,
          html: `<p>Ваш код подтверждения: <strong>${verificationCode}</strong></p><p>Код действителен 5 минут.</p>`,
        }),
      }).catch(() => {
        console.error('Failed to send email');
      });
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        expiresIn: 300000, // 5 minutes in ms
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
