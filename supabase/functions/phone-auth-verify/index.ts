import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface PhoneAuthVerifyRequest {
  sessionId: string;
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
    const { sessionId } = await req.json() as PhoneAuthVerifyRequest;

    if (!sessionId) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('method', 'phone')
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Session expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check if verified (Asterisk CDR should update this via webhook)
    if (!session.verified) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Call not verified yet' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.person_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ verified: false, message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Get the single contract for this user
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('person_id', session.person_id)
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Contract not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Get the single account for this contract
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('contract_id', contract.id)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Account not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        auth: {
          person: user,
          contract,
          account,
        },
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
