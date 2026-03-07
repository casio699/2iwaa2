import webpush from "web-push";

export type WebPushPayload = {
  title: string;
  body: string;
  url?: string;
};

function isPushConfigured() {
  return (
    !!process.env.WEB_PUSH_PUBLIC_KEY &&
    !!process.env.WEB_PUSH_PRIVATE_KEY &&
    !!process.env.WEB_PUSH_SUBJECT
  );
}

export async function sendWebPush(subscriptionJson: string, payload: WebPushPayload) {
  if (!isPushConfigured()) {
    return { ok: false as const, skipped: true as const, error: "Web push not configured" };
  }

  webpush.setVapidDetails(
    process.env.WEB_PUSH_SUBJECT!,
    process.env.WEB_PUSH_PUBLIC_KEY!,
    process.env.WEB_PUSH_PRIVATE_KEY!
  );

  const subscription = JSON.parse(subscriptionJson);

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url,
      })
    );

    return { ok: true as const, skipped: false as const };
  } catch (e) {
    return { ok: false as const, skipped: false as const, error: String(e) };
  }
}
