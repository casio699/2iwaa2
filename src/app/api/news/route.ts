/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dataSync } from "@/lib/data-sync";
import { prisma } from "@/lib/prisma";

// GET /api/news - Get news articles with caching and filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const breaking = searchParams.get("breaking") === "true";
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    // Use our new data sync system with caching
    const news = await dataSync.getFreshData('news', { 
      category, 
      source, 
      breaking, 
      limit, 
      offset 
    }) as any[];
    
    // Get sources count
    const sourcesCount = news.reduce((acc, article) => {
      const sourceName = article.sourceName || 'Unknown';
      acc[sourceName] = (acc[sourceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sources = Object.entries(sourcesCount).map(([sourceName, count]) => ({
      sourceName,
      count
    }));
    
    return NextResponse.json({ 
      success: true,
      articles: news,
      sources,
      pagination: {
        limit,
        offset,
        total: news.length
      }
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', success: false },
      { status: 500 }
    );
  }
}

// POST /api/admin/news - Create news article (admin only)
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      titleAr,
      titleEn,
      summaryAr,
      content,
      sourceName,
      sourceUrl,
      originalUrl,
      sourceType,
      category,
      tags,
      imageUrl,
      publishedAt,
      isBreaking,
    } = body;

    await prisma.$executeRaw`
      INSERT INTO "NewsArticle" (
        id, "titleAr", "titleEn", "summaryAr", content, "sourceName", "sourceUrl",
        "originalUrl", "sourceType", category, tags, "imageUrl", "publishedAt",
        "isBreaking", "isVerified", coverage, "viewCount"
      ) VALUES (
        gen_random_uuid()::TEXT,
        ${titleAr},
        ${titleEn || null},
        ${summaryAr || null},
        ${content || null},
        ${sourceName},
        ${sourceUrl},
        ${originalUrl},
        ${sourceType || "admin"},
        ${category || "general"},
        ${tags || []},
        ${imageUrl || null},
        ${publishedAt ? new Date(publishedAt) : new Date()},
        ${isBreaking || false},
        true,
        ARRAY[]::TEXT[],
        0
      )
    `;

    return NextResponse.json({ success: true, message: "تم إضافة الخبر" });
  } catch (error) {
    console.error("News creation error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
