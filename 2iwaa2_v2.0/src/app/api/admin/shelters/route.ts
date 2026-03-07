import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createShelterSchema = z.object({
  type: z.enum(["government", "ngo", "municipality", "civilian", "hotel"]),
  nameAr: z.string().min(2).max(200),
  nameLb: z.string().min(1).max(200).optional(),
  addressAr: z.string().max(300).optional(),
  governorateAr: z.string().max(100).optional(),
  districtAr: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  capacityTotal: z.number().int().positive().optional(),
  capacityUsed: z.number().int().nonnegative().optional(),
  statusTextAr: z.string().max(300).optional(),
  statusTextLb: z.string().max(300).optional(),
  contactPhone: z.string().max(50).optional(),
  contactWhatsApp: z.string().max(50).optional(),
  contactTelegram: z.string().max(100).optional(),
  sourceName: z.string().max(200).optional(),
  sourceUrl: z.string().url().optional(),
});

function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  return !!expected && token === expected;
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createShelterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const shelter = await prisma.shelter.create({
    data: {
      ...parsed.data,
      reviewStatus: "verified",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "create",
      entityType: "Shelter",
      entityId: shelter.id,
      actor: "admin",
    },
  });

  return NextResponse.json({ shelter }, { status: 201 });
}
