export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const chatId = process.env.TELEGRAM_TARGET_CHAT_ID ?? "";

  if (!token || !chatId) {
    return { ok: false as const, skipped: true as const, error: "Telegram not configured" };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false as const, skipped: false as const, error: body };
  }

  return { ok: true as const, skipped: false as const };
}
