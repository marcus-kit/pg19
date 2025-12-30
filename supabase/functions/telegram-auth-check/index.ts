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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('identifier', sessionId)
      .eq('method', 'telegram')
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ status: 'expired', message: 'Session not found' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ status: 'expired', message: 'Session expired' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check if verified
    if (!session.verified || !session.person_id) {
      return new Response(
        JSON.stringify({ status: 'pending' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Session is verified - get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.person_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ status: 'expired', message: 'User not found' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('person_id', user.id)
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ status: 'expired', message: 'Contract not found' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('contract_id', contract.id)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ status: 'expired', message: 'Account not found' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Delete used session
    await supabase
      .from('auth_sessions')
      .delete()
      .eq('id', session.id);

    return new Response(
      JSON.stringify({
        status: 'verified',
        data: {
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
