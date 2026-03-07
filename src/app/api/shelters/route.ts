import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const shelters = await prisma.shelter.findMany({
    where: { reviewStatus: "verified" },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ shelters });
}
