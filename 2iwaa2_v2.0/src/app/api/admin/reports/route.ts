import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // NextRequest gives headers; but Request also has headers.
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") ?? "pending") as
    | "pending"
    | "verified"
    | "rejected"
    | "archived";

  const reports = await prisma.report.findMany({
    where: { reviewStatus: status },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ reports });
}
