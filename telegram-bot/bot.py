#!/usr/bin/env python3
"""
PG19 Telegram Auth Bot
Бот для авторизации в личном кабинете PG19 через Telegram
"""

import os
import hmac
import hashlib
import logging
import requests
import telebot

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Конфигурация из переменных окружения
BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
WEBHOOK_URL = os.environ.get('WEBHOOK_URL', 'https://pg19-client.vercel.app/api/auth/telegram/webhook')
WEBHOOK_SECRET = os.environ.get('TELEGRAM_WEBHOOK_SECRET')

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN не установлен!")

if not WEBHOOK_SECRET:
    raise ValueError("TELEGRAM_WEBHOOK_SECRET не установлен!")

# Создаём бота
bot = telebot.TeleBot(BOT_TOKEN)


def create_signature(session_id: str, telegram_id: str) -> str:
    """Создаёт HMAC-SHA256 подпись для верификации запроса"""
    data = f"{session_id}:{telegram_id}"
    return hmac.new(
        WEBHOOK_SECRET.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()


@bot.message_handler(commands=['start'])
def handle_start(message):
    """Обработка команды /start"""
    args = message.text.split()
    user = message.from_user
    chat_id = message.chat.id

    logger.info(f"Получена команда /start от пользователя {user.id} ({user.username})")

    # Обычный /start без параметров
    if len(args) == 1:
        bot.send_message(
            chat_id,
            "👋 Привет! Я бот для авторизации в личном кабинете PG19.\n\n"
            "Чтобы войти в личный кабинет:\n"
            "1. Откройте сайт pg19-client.vercel.app\n"
            "2. Выберите вход через Telegram\n"
            "3. Нажмите кнопку «Открыть Telegram»\n"
            "4. Вернитесь сюда и подтвердите вход"
        )
        return

    param = args[1]

    # Авторизация: /start auth_SESSION_ID
    if param.startswith('auth_'):
        session_id = param[5:]  # убираем "auth_"
        logger.info(f"Попытка авторизации: session={session_id}, user={user.id}")

        # Создаём подпись
        signature = create_signature(session_id, str(user.id))

        # Отправляем данные на webhook
        try:
            response = requests.post(
                WEBHOOK_URL,
                json={
                    'session_id': session_id,
                    'telegram_id': str(user.id),
                    'first_name': user.first_name,
                    'last_name': user.last_name or '',
                    'username': user.username or '',
                    'signature': signature
                },
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )

            logger.info(f"Ответ webhook: {response.status_code} - {response.text}")

            if response.status_code == 200:
                bot.send_message(
                    chat_id,
                    "✅ Вход подтверждён!\n\n"
                    "Вернитесь на сайт — вы уже авторизованы."
                )
            else:
                try:
                    error_data = response.json()
                    error_message = error_data.get('message', 'Неизвестная ошибка')
                except:
                    error_message = f"Ошибка сервера ({response.status_code})"

                bot.send_message(chat_id, f"❌ {error_message}")
                logger.error(f"Ошибка авторизации: {error_message}")

        except requests.exceptions.Timeout:
            bot.send_message(
                chat_id,
                "❌ Сервер не отвечает. Попробуйте позже."
            )
            logger.error("Таймаут при запросе к webhook")

        except requests.exceptions.RequestException as e:
            bot.send_message(
                chat_id,
                "❌ Не удалось связаться с сервером. Попробуйте позже."
            )
            logger.error(f"Ошибка запроса: {e}")

    else:
        bot.send_message(
            chat_id,
            "🤔 Неизвестная команда.\n\n"
            "Для авторизации перейдите на сайт личного кабинета."
        )


@bot.message_handler(func=lambda message: True)
def handle_all_messages(message):
    """Обработка всех остальных сообщений"""
    bot.send_message(
        message.chat.id,
        "Я бот для авторизации в личном кабинете PG19.\n\n"
        "Используйте /start для получения инструкций."
    )


def main():
    """Запуск бота"""
    logger.info("Запуск бота...")
    logger.info(f"Webhook URL: {WEBHOOK_URL}")

    # Удаляем старый webhook (если был)
    bot.remove_webhook()

    # Запускаем polling
    logger.info("Бот запущен в режиме polling")
    bot.infinity_polling(
        timeout=60,
        long_polling_timeout=60,
        skip_pending=True
    )


if __name__ == '__main__':
    main()
