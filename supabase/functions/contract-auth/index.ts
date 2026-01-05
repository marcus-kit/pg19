import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ContractAuthRequest {
  contractNumber: string;
  firstName: string;
  lastName: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { contractNumber, firstName, lastName } = await req.json() as ContractAuthRequest;

    if (!contractNumber || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find account by contract_number with user data
    // Schema: accounts table now contains contract data (merged from contracts table)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*, user:user_id(*)')
      .eq('contract_number', contractNumber)
      .eq('contract_status', 'active')
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Contract not found or inactive' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const user = account.user;

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found for this account' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify user's name (case-insensitive)
    if (
      user.first_name.toLowerCase() !== firstName.toLowerCase() ||
      user.last_name.toLowerCase() !== lastName.toLowerCase()
    ) {
      return new Response(
        JSON.stringify({ error: 'Name does not match contract' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Remove nested user from account to avoid duplication in response
    const { user: _user, ...accountData } = account;

    return new Response(
      JSON.stringify({
        person: user,
        account: accountData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
