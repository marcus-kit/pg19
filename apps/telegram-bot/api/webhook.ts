import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
  };
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body as TelegramUpdate;

    if (!update.message?.text) {
      return res.status(200).json({ ok: true });
    }

    const { message } = update;
    const { text, from, chat } = message;

    // Handle /start command with auth parameter
    if (text.startsWith('/start auth_')) {
      const sessionId = text.replace('/start auth_', '').trim();

      if (!sessionId) {
        await sendTelegramMessage(chat.id, '❌ Неверная ссылка для авторизации');
        return res.status(200).json({ ok: true });
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // Get session
      const { data: session, error: sessionError } = await supabase
        .from('auth_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('method', 'telegram')
        .single();

      if (sessionError || !session) {
        await sendTelegramMessage(
          chat.id,
          '❌ Сессия авторизации не найдена или истекла.\n\nПопробуйте начать авторизацию заново.'
        );
        return res.status(200).json({ ok: true });
      }

      // Check if expired
      if (new Date(session.expires_at) < new Date()) {
        await sendTelegramMessage(
          chat.id,
          '❌ Время авторизации истекло.\n\nПопробуйте начать авторизацию заново.'
        );
        return res.status(200).json({ ok: true });
      }

      // Check if already verified
      if (session.verified) {
        await sendTelegramMessage(
          chat.id,
          '✅ Вы уже авторизованы!'
        );
        return res.status(200).json({ ok: true });
      }

      // Find user by Telegram ID
      const { data: user } = await supabase
        .from('users')
        .select('id, telegram_id')
        .eq('telegram_id', from.id.toString())
        .single();

      if (!user) {
        await sendTelegramMessage(
          chat.id,
          '❌ Ваш Telegram аккаунт не привязан к лицевому счёту.\n\nОбратитесь в поддержку для привязки.'
        );
        return res.status(200).json({ ok: true });
      }

      // Update session as verified and link to user
      const { error: updateError } = await supabase
        .from('auth_sessions')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          person_id: user.id,
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Failed to update session:', updateError);
        await sendTelegramMessage(
          chat.id,
          '❌ Ошибка авторизации. Попробуйте позже.'
        );
        return res.status(200).json({ ok: true });
      }

      // Update Telegram username if provided
      if (from.username) {
        await supabase
          .from('users')
          .update({ telegram_username: from.username })
          .eq('id', user.id);
      }

      await sendTelegramMessage(
        chat.id,
        '✅ <b>Авторизация успешна!</b>\n\nТеперь вы можете вернуться в личный кабинет.'
      );

      return res.status(200).json({ ok: true });
    }

    // Handle /start command without parameters
    if (text === '/start') {
      await sendTelegramMessage(
        chat.id,
        '👋 Привет! Я бот для авторизации в личном кабинете PG19.\n\n' +
        'Для входа используйте кнопку "Войти через Telegram" на сайте.'
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
