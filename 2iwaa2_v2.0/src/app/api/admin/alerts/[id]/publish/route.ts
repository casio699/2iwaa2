import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const alert = await prisma.alert.update({
    where: { id },
    data: {
      reviewStatus: "verified",
      publishedAt: new Date(),
      publishedBy: "admin",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "publish",
      entityType: "Alert",
      entityId: id,
      actor: "admin",
    },
  });

  // Telegram placeholder (skips if not configured)
  const tgText = `تنبيه: ${alert.titleAr}\n\n${alert.bodyAr}`;
  const tgRes = await sendTelegramMessage(tgText);

  return NextResponse.json({ alert, telegram: tgRes });
}
