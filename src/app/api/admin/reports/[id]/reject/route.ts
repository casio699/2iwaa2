import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const note = typeof body?.note === "string" ? body.note : undefined;

  const { id } = await ctx.params;

  const report = await prisma.report.update({
    where: { id },
    data: {
      reviewStatus: "rejected",
      reviewedAt: new Date(),
      reviewedBy: "admin",
      reviewNote: note,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "reject",
      entityType: "Report",
      entityId: id,
      actor: "admin",
      metaJson: note ? JSON.stringify({ note }) : null,
    },
  });

  return NextResponse.json({ report });
}
