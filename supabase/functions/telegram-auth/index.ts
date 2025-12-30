import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...authData } = data;

  // Create data check string
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key as keyof typeof authData]}`)
    .join('\n');

  // Create secret key from bot token
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();

  // Calculate hash
  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
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
    const telegramData = await req.json() as TelegramAuthData;

    if (!telegramData.id || !telegramData.hash) {
      return new Response(
        JSON.stringify({ error: 'Invalid Telegram data' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';

    // Verify Telegram data authenticity
    if (!verifyTelegramAuth(telegramData, botToken)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Telegram authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check auth_date is not too old (within 24 hours)
    const authAge = Date.now() / 1000 - telegramData.auth_date;
    if (authAge > 86400) {
      return new Response(
        JSON.stringify({ error: 'Authentication data is too old' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find user by Telegram ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramData.id.toString())
      .eq('status', 'active')
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Telegram account not linked' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Update Telegram username if changed
    if (telegramData.username && user.telegram_username !== telegramData.username) {
      await supabase
        .from('users')
        .update({ telegram_username: telegramData.username })
        .eq('id', user.id);
    }

    // Get the single contract for this user
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('person_id', user.id)
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ error: 'Contract not found' }),
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
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        person: user,
        contract,
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
