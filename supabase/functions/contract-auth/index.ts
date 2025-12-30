import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ContractAuthRequest {
  contractNumber: string;
  firstName: string;
  lastName: string;
}

Deno.serve(async (req: Request) => {
  // CORS headers
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
    const { contractNumber, firstName, lastName } = await req.json() as ContractAuthRequest;

    if (!contractNumber || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find contract by number with user and account
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*, person_id(*), account:accounts(*)')
      .eq('contract_number', contractNumber)
      .eq('status', 'active')
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ error: 'Contract not found or inactive' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const user = contract.person_id;

    // Verify user's name (case-insensitive)
    if (
      user.first_name.toLowerCase() !== firstName.toLowerCase() ||
      user.last_name.toLowerCase() !== lastName.toLowerCase()
    ) {
      return new Response(
        JSON.stringify({ error: 'Name does not match contract' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
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
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        person: user,
        contract: {
          id: contract.id,
          contract_number: contract.contract_number,
          person_id: contract.person_id,
          status: contract.status,
          start_date: contract.start_date,
          end_date: contract.end_date,
          address_city: contract.address_city,
          address_street: contract.address_street,
          address_building: contract.address_building,
          address_apartment: contract.address_apartment,
          address_full: contract.address_full,
          notes: contract.notes,
          date_created: contract.date_created,
          date_updated: contract.date_updated,
        },
        account,
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
