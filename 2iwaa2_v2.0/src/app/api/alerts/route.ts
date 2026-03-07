import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAlertSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createAlertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const alert = await prisma.alert.create({
    data: {
      titleAr: parsed.data.titleAr,
      titleLb: parsed.data.titleLb,
      bodyAr: parsed.data.bodyAr,
      bodyLb: parsed.data.bodyLb,
      severity: parsed.data.severity ?? "warning",
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      radiusMeters: parsed.data.radiusMeters,
    },
  });

  return NextResponse.json({ alert }, { status: 201 });
}

export async function GET() {
  const alerts = await prisma.alert.findMany({
    where: { reviewStatus: "verified" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ alerts });
}
