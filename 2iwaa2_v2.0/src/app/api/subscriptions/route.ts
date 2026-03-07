import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAreaSubscriptionSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createAreaSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const sub = await prisma.areaSubscription.create({
    data: {
      areaNameAr: parsed.data.areaNameAr,
      areaNameLb: parsed.data.areaNameLb,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      radiusMeters: parsed.data.radiusMeters,
      webPushSubscriptionJson: parsed.data.webPushSubscriptionJson,
      telegramChatId: parsed.data.telegramChatId,
    },
  });

  return NextResponse.json({ subscription: sub }, { status: 201 });
}
