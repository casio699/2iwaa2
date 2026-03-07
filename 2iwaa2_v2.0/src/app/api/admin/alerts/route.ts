import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  return !!expected && token === expected;
}

function isReviewStatus(v: string): v is "pending" | "verified" | "rejected" | "archived" {
  return v === "pending" || v === "verified" || v === "rejected" || v === "archived";
}

export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const alerts = await prisma.alert.findMany({
    where: status && isReviewStatus(status) ? { reviewStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ alerts });
}
