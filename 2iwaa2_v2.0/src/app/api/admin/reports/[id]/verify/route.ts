import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const report = await prisma.report.update({
    where: { id },
    data: {
      reviewStatus: "verified",
      reviewedAt: new Date(),
      reviewedBy: "admin",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "verify",
      entityType: "Report",
      entityId: id,
      actor: "admin",
    },
  });

  return NextResponse.json({ report });
}
