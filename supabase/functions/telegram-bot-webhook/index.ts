import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface TelegramUpdate {
  message?: {
    from: {
      id: number;
      username?: string;
      first_name: string;
      last_name?: string;
    };
    text?: string;
    chat: {
      id: number;
    };
  };
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message?.text) {
      return new Response('OK', { status: 200 });
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';
    const text = message.text;
    const chatId = message.chat.id;
    const telegramId = message.from.id.toString();
    const username = message.from.username;

    // Handle /start auth_{sessionId}
    if (text.startsWith('/start auth_')) {
      const sessionId = text.replace('/start auth_', '');

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Find user by Telegram ID
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('telegram_id', telegramId)
        .eq('status', 'active')
        .single();

      if (userError || !user) {
        await sendTelegramMessage(botToken, chatId,
          '❌ <b>Ваш Telegram не привязан к аккаунту</b>\n\n' +
          'Для привязки обратитесь в службу поддержки.'
        );
        return new Response('OK', { status: 200 });
      }

      // Find session
      const { data: session, error: sessionError } = await supabase
        .from('auth_sessions')
        .select('*')
        .eq('identifier', sessionId)
        .eq('method', 'telegram')
        .eq('verified', false)
        .single();

      if (sessionError || !session) {
        await sendTelegramMessage(botToken, chatId,
          '❌ <b>Сессия не найдена или истекла</b>\n\n' +
          'Попробуйте авторизоваться заново.'
        );
        return new Response('OK', { status: 200 });
      }

      // Check if expired
      if (new Date(session.expires_at) < new Date()) {
        await sendTelegramMessage(botToken, chatId,
          '❌ <b>Сессия истекла</b>\n\n' +
          'Попробуйте авторизоваться заново.'
        );
        return new Response('OK', { status: 200 });
      }

      // Update session as verified
      const { error: updateError } = await supabase
        .from('auth_sessions')
        .update({
          verified: true,
          person_id: user.id,
          verified_at: new Date().toISOString(),
          metadata: { telegram_username: username },
        })
        .eq('id', session.id);

      if (updateError) {
        console.error('Update error:', updateError);
        await sendTelegramMessage(botToken, chatId,
          '❌ <b>Ошибка авторизации</b>\n\n' +
          'Попробуйте ещё раз.'
        );
        return new Response('OK', { status: 200 });
      }

      await sendTelegramMessage(botToken, chatId,
        `✅ <b>Авторизация успешна!</b>\n\n` +
        `Здравствуйте, ${user.full_name}!\n` +
        `Вернитесь в браузер — вход выполнен.`
      );

      return new Response('OK', { status: 200 });
    }

    // Handle regular /start
    if (text === '/start') {
      await sendTelegramMessage(botToken, chatId,
        '👋 <b>Добро пожаловать в PG19!</b>\n\n' +
        'Этот бот используется для авторизации в личном кабинете.\n\n' +
        'Для входа нажмите кнопку «Войти через Telegram» на сайте.'
      );
      return new Response('OK', { status: 200 });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('OK', { status: 200 });
  }
});
