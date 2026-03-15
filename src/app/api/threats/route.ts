import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/threats - Get threats with filtering
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "verified";
    const type = url.searchParams.get("type");
    const governorate = url.searchParams.get("governorate");
    const days = parseInt(url.searchParams.get("days") || "7");
    const limit = Math.min(500, parseInt(url.searchParams.get("limit") || "100"));

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Build where clause
    const where: Record<string, unknown> = {
      status: status,
      reportedAt: {
        gte: sinceDate
      }
    };

    if (type) where.type = type;
    if (governorate) where.governorate = governorate;

    // Query threats
    const threats = await prisma.threat.findMany({
      where,
      orderBy: {
        reportedAt: 'desc'
      },
      take: limit
    });

    // Get statistics
    const stats = await prisma.threat.groupBy({
      by: ['type'],
      where: {
        status: 'verified',
        reportedAt: {
          gte: sinceDate
        }
      },
      _count: {
        type: true
      },
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    });

    return NextResponse.json({ 
      threats, 
      stats: stats.map((s: { type: string; _count: { type: number } }) => ({ type: s.type, count: s._count.type })), 
      count: threats.length 
    });
  } catch (error) {
    console.error("Threats API error:", error);
    return NextResponse.json({ threats: [], stats: [], count: 0, error: "Failed to fetch threats" }, { status: 500 });
  }
}

// POST /api/threats - Report new threat
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      subtype,
      latitude,
      longitude,
      areaNameAr,
      areaNameLb,
      governorate,
      descriptionAr,
      descriptionEn,
      casualties,
      damageLevel,
      source,
      sourceUrl,
      evidenceUrls,
    } = body;

    if (!type || !latitude || !longitude || !areaNameAr || !descriptionAr) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$queryRaw<
      Array<{ id: string }>
    >`
      INSERT INTO "Threat" (
        id, type, subtype, latitude, longitude, "areaNameAr", "areaNameLb",
        governorate, "reportedAt", "descriptionAr", "descriptionEn", casualties,
        "damageLevel", source, "sourceUrl", "evidenceUrls", status,
        "sheltersAffected", "hospitalsActivated"
      ) VALUES (
        gen_random_uuid()::TEXT,
        ${type},
        ${subtype || null},
        ${latitude},
        ${longitude},
        ${areaNameAr},
        ${areaNameLb || null},
        ${governorate || null},
        CURRENT_TIMESTAMP,
        ${descriptionAr},
        ${descriptionEn || null},
        ${casualties || null},
        ${damageLevel || null},
        ${source || "user"},
        ${sourceUrl || null},
        ${evidenceUrls || []},
        'pending',
        ARRAY[]::TEXT[],
        false
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      message: "تم إرسال البلاغ - في انتظار التحقق",
      id: result[0]?.id
    });
  } catch (error) {
    console.error("Threat report error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
