import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface PhoneAuthInitRequest {
  phone: string;
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
    const { phone } = await req.json() as PhoneAuthInitRequest;

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find user by phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .eq('status', 'active')
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Phone number not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Create auth session
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        method: 'phone',
        identifier: phone,
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

    // Trigger Asterisk call via webhook/API
    const asteriskUrl = Deno.env.get('ASTERISK_WEBHOOK_URL');
    if (asteriskUrl) {
      await fetch(asteriskUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          phoneNumber: phone,
        }),
      }).catch(() => {
        // Log error but don't fail the request
        console.error('Failed to trigger Asterisk call');
      });
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        verifyNumber: Deno.env.get('ASTERISK_VERIFY_NUMBER') ?? '',
        expiresIn: 180000, // 3 minutes in ms
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
