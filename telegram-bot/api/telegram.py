"""
Vercel Serverless Function for Telegram Bot Webhook
POST /api/telegram - receives updates from Telegram
"""

import os
import json
import hmac
import hashlib
import urllib.request
import urllib.parse
from http.server import BaseHTTPRequestHandler

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
WEBHOOK_URL = os.environ.get('WEBHOOK_URL', 'https://pg19-client.vercel.app/api/auth/telegram/webhook')
WEBHOOK_SECRET = os.environ.get('TELEGRAM_WEBHOOK_SECRET', '')


def send_message(chat_id: int, text: str) -> None:
    """Send message via Telegram API"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"Error sending message: {e}")


def create_signature(session_id: str, telegram_id: str) -> str:
    """Create HMAC-SHA256 signature"""
    data = f"{session_id}:{telegram_id}"
    return hmac.new(
        WEBHOOK_SECRET.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()


def call_auth_webhook(session_id: str, user: dict) -> dict:
    """Call our auth webhook to verify the user"""
    signature = create_signature(session_id, str(user['id']))

    payload = json.dumps({
        "session_id": session_id,
        "telegram_id": str(user['id']),
        "first_name": user.get('first_name', ''),
        "last_name": user.get('last_name', ''),
        "username": user.get('username', ''),
        "signature": signature
    }).encode('utf-8')

    req = urllib.request.Request(
        WEBHOOK_URL,
        data=payload,
        headers={'Content-Type': 'application/json'}
    )

    try:
        response = urllib.request.urlopen(req, timeout=10)
        return {"success": True, "status": response.status}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            error_data = json.loads(body)
            return {"success": False, "message": error_data.get('message', 'Ошибка')}
        except:
            return {"success": False, "message": f"Ошибка ({e.code})"}
    except Exception as e:
        return {"success": False, "message": str(e)}


def handle_message(message: dict) -> None:
    """Handle incoming Telegram message"""
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user = message.get('from', {})

    if not text.startswith('/start'):
        send_message(chat_id, "Я бот для авторизации в личном кабинете PG19.\n\nИспользуйте /start для получения инструкций.")
        return

    parts = text.split()

    # Simple /start without parameters
    if len(parts) == 1:
        send_message(
            chat_id,
            "👋 Привет! Я бот для авторизации в личном кабинете PG19.\n\n"
            "Чтобы войти в личный кабинет:\n"
            "1. Откройте сайт pg19-client.vercel.app\n"
            "2. Выберите вход через Telegram\n"
            "3. Нажмите кнопку «Открыть Telegram»\n"
            "4. Вернитесь сюда и подтвердите вход"
        )
        return

    param = parts[1]

    # Auth: /start auth_SESSION_ID
    if param.startswith('auth_'):
        session_id = param[5:]  # Remove "auth_" prefix

        result = call_auth_webhook(session_id, user)

        if result['success']:
            send_message(chat_id, "✅ Вход подтверждён!\n\nВернитесь на сайт — вы уже авторизованы.")
        else:
            send_message(chat_id, f"❌ {result['message']}")
    else:
        send_message(chat_id, "🤔 Неизвестная команда.\n\nДля авторизации перейдите на сайт личного кабинета.")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            update = json.loads(body)

            # Handle message
            if 'message' in update:
                handle_message(update['message'])

            # Return 200 OK
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())

        except Exception as e:
            print(f"Error: {e}")
            self.send_response(200)  # Always return 200 to Telegram
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "Bot is running"}).encode())
