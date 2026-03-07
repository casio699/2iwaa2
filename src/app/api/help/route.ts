import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/help - Get help offers and requests
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // offer | request
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status") || "active";
    const urgency = url.searchParams.get("urgency");
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));

    // Build where clause
    const where: any = {
      status: status
    };
    
    if (type) where.type = type;
    if (category) where.category = category;
    if (urgency) where.urgency = urgency;

    // Query posts with custom ordering for urgency
    const posts = await prisma.helpPost.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Sort by urgency manually (since Prisma doesn't support CASE in orderBy)
    const urgencyOrder = { 'urgent': 1, 'high': 2, 'normal': 3, 'low': 4 };
    const sortedPosts = posts.sort((a: any, b: any) => {
      const aUrgency = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 999;
      const bUrgency = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 999;
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ posts: sortedPosts, count: sortedPosts.length });
  } catch (error) {
    console.error("Help API error:", error);
    return NextResponse.json({ posts: [], count: 0, error: "Failed to fetch help posts" }, { status: 500 });
  }
}

// POST /api/help - Create help offer or request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      category,
      titleAr,
      descriptionAr,
      contactName,
      contactPhone,
      contactWhatsApp,
      location,
      latitude,
      longitude,
      urgency,
    } = body;

    if (!type || !category || !titleAr || !descriptionAr || !contactPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$queryRaw<
      Array<{ id: string }>
    >`
      INSERT INTO "HelpPost" (
        id, type, category, "titleAr", "descriptionAr", "contactName", "contactPhone",
        "contactWhatsApp", location, latitude, longitude, urgency, status, verified, "createdAt"
      ) VALUES (
        gen_random_uuid()::TEXT,
        ${type},
        ${category},
        ${titleAr},
        ${descriptionAr},
        ${contactName || null},
        ${contactPhone},
        ${contactWhatsApp || null},
        ${location || null},
        ${latitude || null},
        ${longitude || null},
        ${urgency || "normal"},
        'active',
        false,
        CURRENT_TIMESTAMP
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      message: type === "offer" ? "تم إضافة عرض المساعدة" : "تم إضافة طلب المساعدة",
      id: result[0]?.id
    });
  } catch (error) {
    console.error("Help post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
