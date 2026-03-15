import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock news data for fallback when database is empty
const mockNewsArticles = [
  {
    id: "mock-news-1",
    titleAr: "تطورات الأوضاع الإنسانية في جنوب لبنان",
    titleEn: "Humanitarian Situation Developments in Southern Lebanon",
    summaryAr: "تقرير حول الوضع الحالي للنازحين وجهود الإغاثة الجارية في المناطق المتأثرة",
    sourceName: "الوكالة الوطنية للإعلام",
    sourceUrl: "https://nna.gov.lb",
    originalUrl: "https://nna.gov.lb/ar/articles/12345",
    sourceType: "official",
    category: "humanitarian",
    tags: ["نازحون", "إغاثة", "جنوب لبنان"],
    imageUrl: null,
    coverage: ["NNA", "LBCI", "MTV"],
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isBreaking: true,
    isVerified: true,
    viewCount: 1250,
  },
  {
    id: "mock-news-2",
    titleAr: "افتتاح مركز إيواء جديد في ضواحي بيروت",
    titleEn: "New Shelter Center Opens in Beirut Suburbs",
    summaryAr: "بلدية بيروت تفتتح مركزاً جديداً يستوعب 500 نازح مع توفير جميع الخدمات الأساسية",
    sourceName: "LBCI",
    sourceUrl: "https://lbci.com",
    originalUrl: "https://lbci.com/news/article/67890",
    sourceType: "mainstream",
    category: "shelter",
    tags: ["مركز إيواء", "بيروت", "بلدية"],
    imageUrl: null,
    coverage: ["LBCI", "Future TV", "Al Jadeed"],
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isBreaking: false,
    isVerified: true,
    viewCount: 890,
  },
  {
    id: "mock-news-3",
    titleAr: "تحذير أمني من تحركات في المناطق الحدودية",
    titleEn: "Security Warning of Movements in Border Areas",
    summaryAr: "الجيش اللبناني يحذر المدنيين من الاقتراب من المناطق الحدودية الشرقية والجنوبية",
    sourceName: "الجيش اللبناني",
    sourceUrl: "https://army.gov.lb",
    originalUrl: "https://army.gov.lb/statements/2024/03",
    sourceType: "official",
    category: "threat",
    tags: ["تحذير", "جيش", "حدود"],
    imageUrl: null,
    coverage: ["Army", "NNA", "Reuters"],
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isBreaking: true,
    isVerified: true,
    viewCount: 2100,
  },
  {
    id: "mock-news-4",
    titleAr: "مبادرات مجتمعية لمساعدة المتأثرين من الأزمات",
    titleEn: "Community Initiatives to Help Crisis-Affected People",
    summaryAr: "متطوعون ينظمون حملات جمع تبرعات وتقديم المساعدات للعائلات المتضررة",
    sourceName: "النهار",
    sourceUrl: "https://annahar.com",
    originalUrl: "https://annahar.com/article/24680",
    sourceType: "mainstream",
    category: "humanitarian",
    tags: ["متطوعون", "تبرعات", "مجتمع"],
    imageUrl: null,
    coverage: ["An-Nahar", "Daily Star", "L'Orient-Le Jour"],
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isBreaking: false,
    isVerified: true,
    viewCount: 650,
  },
  {
    id: "mock-news-5",
    titleAr: "تدشين تطبيق جديد لتتبع مراكز الإيواء والمساعدات",
    titleEn: "New App Launches to Track Shelters and Aid",
    summaryAr: "منصة 2iwaa2 تطلق تطبيقاً ذكياً لمساعدة النازحين في العثور على أقرب مراكز الإيواء",
    sourceName: "منصة 2iwaa2",
    sourceUrl: "https://2iwaa2.com",
    originalUrl: "https://2iwaa2.com/news/app-launch",
    sourceType: "social",
    category: "general",
    tags: ["تطبيق", "تكنولوجيا", "إيواء"],
    imageUrl: null,
    coverage: ["2iwaa2", "Tech News"],
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isBreaking: false,
    isVerified: true,
    viewCount: 430,
  },
];

// GET /api/news - Get news articles with filtering
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const source = url.searchParams.get("source");
    const breaking = url.searchParams.get("breaking");
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build where clause
    const where: Record<string, unknown> = {
      isVerified: true
    };
    
    if (category) where.category = category;
    if (source) where.sourceName = source;
    if (breaking === "true") where.isBreaking = true;

    // Try to get articles from database first
    let articles: unknown[] = [];
    let sources: Array<{ sourceName: string; count: number }> = [];
    
    try {
      const queryResult = await prisma.$queryRaw<unknown[]>`
        SELECT * FROM "NewsArticle"
        WHERE "isVerified" = true
        ${category ? `AND category = ${category}` : ''}
        ${source ? `AND "sourceName" = ${source}` : ''}
        ${breaking === "true" ? `AND "isBreaking" = true` : ''}
        ORDER BY "isBreaking" DESC, "publishedAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      articles = queryResult || [];

      // Get source list for filter
      const sourceResult = await prisma.$queryRaw<Array<{ sourceName: string; count: string }>>`
        SELECT "sourceName", COUNT(*) as count
        FROM "NewsArticle"
        WHERE "isVerified" = true
        GROUP BY "sourceName"
        ORDER BY count DESC
      `;

      sources = sourceResult.map((s) => ({ sourceName: s.sourceName, count: parseInt(s.count) }));
    } catch (dbError) {
      console.log("Database query failed, using mock data:", dbError);
    }

    // If no data in database, use mock data
    if (articles.length === 0) {
      let filteredArticles = mockNewsArticles;
      
      if (category && category !== "all") {
        filteredArticles = mockNewsArticles.filter(article => article.category === category);
      }
      if (source) {
        filteredArticles = filteredArticles.filter(article => article.sourceName === source);
      }
      if (breaking === "true") {
        filteredArticles = filteredArticles.filter(article => article.isBreaking);
      }
      
      // Apply pagination
      articles = filteredArticles.slice(offset, offset + limit);
      
      // Generate mock sources
      const sourceCounts = mockNewsArticles.reduce((acc, article) => {
        acc[article.sourceName] = (acc[article.sourceName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      sources = Object.entries(sourceCounts).map(([sourceName, count]) => ({ sourceName, count }));
    }

    return NextResponse.json({ 
      articles, 
      sources, 
      count: articles.length,
      source: articles.length > 0 && mockNewsArticles.some((mockArticle) => articles.find((art: unknown) => (art as { id: string }).id === mockArticle.id)) ? "Mock data" : "Database"
    });
  } catch (error) {
    console.error("News API error:", error);
    // Return mock data on error
    return NextResponse.json({ 
      articles: mockNewsArticles.slice(0, 10), 
      sources: [
        { sourceName: "الوكالة الوطنية للإعلام", count: 1 },
        { sourceName: "LBCI", count: 1 },
        { sourceName: "الجيش اللبناني", count: 1 },
        { sourceName: "النهار", count: 1 },
        { sourceName: "منصة 2iwaa2", count: 1 },
      ], 
      count: 5,
      source: "Mock data - API error"
    });
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
