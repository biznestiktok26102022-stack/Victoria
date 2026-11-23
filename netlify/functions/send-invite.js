
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { statusCode: 500, body: JSON.stringify({ error: "Telegram is not configured" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  const clean = (v, max = 500) => String(v || "").replace(/[<>]/g, "").slice(0, max);

  const message = [
    "💌 Нова відповідь від Вікторії!",
    `📅 День: ${clean(data.day, 40)}`,
    `🕒 Час: ${clean(data.time, 20)}`,
    `📍 Місце: ${clean(data.place)}`,
    `✨ Формат: ${clean(data.format, 100)}`,
    `☕ Напій: ${clean(data.coffee, 100)}`,
    `💭 Побажання: ${clean(data.wishes, 1000) || "Не вказано"}`
  ].join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: "Telegram delivery failed" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: "Telegram connection failed" }) };
  }
};
