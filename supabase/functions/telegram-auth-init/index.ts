import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
    const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME') ?? '';

    if (!botUsername) {
      return new Response(
        JSON.stringify({ error: 'Telegram not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate session ID
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Create session in database
    const { error: insertError } = await supabase
      .from('auth_sessions')
      .insert({
        id: Math.floor(Math.random() * 1000000000),
        method: 'telegram',
        identifier: sessionId,
        verified: false,
        metadata: {},
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Build deep link
    const deepLink = `https://t.me/${botUsername}?start=auth_${sessionId}`;

    return new Response(
      JSON.stringify({
        sessionId,
        deepLink,
        expiresIn: 180,
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
