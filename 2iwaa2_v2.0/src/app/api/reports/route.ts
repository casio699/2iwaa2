import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const report = await prisma.report.create({
    data: {
      type: parsed.data.type,
      titleAr: parsed.data.titleAr,
      titleLb: parsed.data.titleLb,
      descriptionAr: parsed.data.descriptionAr,
      descriptionLb: parsed.data.descriptionLb,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      shelterId: parsed.data.shelterId,
      evidenceUrl: parsed.data.evidenceUrl,
      source: "web",
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}

export async function GET() {
  const reports = await prisma.report.findMany({
    where: { reviewStatus: "verified" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ reports });
}
