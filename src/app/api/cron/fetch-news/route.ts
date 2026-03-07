import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";

const rssParser = new Parser();

// RSS sources configuration
const RSS_SOURCES = [
  { name: "Naharnet", url: "https://www.naharnet.com/rss", type: "mainstream" },
  { name: "Daily Star Lebanon", url: "https://www.dailystar.com.lb/RSS.ashx", type: "international" },
  { name: "LBCI", url: "https://www.lbcgroup.tv/rss", type: "mainstream" },
  { name: "MTV Lebanon", url: "https://www.mtv.com.lb/rss", type: "mainstream" },
  { name: "National News Agency", url: "https://www.nna-leb.gov.lb/rss", type: "official" },
  { name: "L'Orient Today", url: "https://www.lorienttoday.com/rss", type: "international" },
];

// GET /api/cron/fetch-news - Manual trigger for news fetching
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow access with cron secret or admin password
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Allow
  } else {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await rssParser.parseURL(source.url);
      
      for (const item of feed.items.slice(0, 10)) { // Process last 10 items
        if (!item.title || !item.link) continue;

        // Check if article already exists
        const existing = await prisma.$queryRaw<
          Array<{ id: string }>
        >`
          SELECT id FROM "NewsArticle"
          WHERE "originalUrl" = ${item.link}
          LIMIT 1
        `;

        if (existing.length > 0) continue;

        // Determine category based on title keywords
        const title = item.title.toLowerCase();
        let category = "general";
        if (title.includes("rocket") || title.includes("missile") || title.includes("strike") || 
            title.includes("attack") || title.includes("war") || title.includes("قصف") || 
            title.includes("صاروخ") || title.includes("غارة")) {
          category = "threat";
        } else if (title.includes("shelter") || title.includes("housing") || title.includes("displaced") ||
                   title.includes("إيواء") || title.includes("نازح") || title.includes("لاجئ")) {
          category = "shelter";
        } else if (title.includes("aid") || title.includes("humanitarian") || title.includes("relief") ||
                   title.includes("مساعدة") || title.includes("إغاثة")) {
          category = "humanitarian";
        }

        // Insert article
        await prisma.$executeRaw`
          INSERT INTO "NewsArticle" (
            id, "titleAr", "titleEn", "summaryAr", "sourceName", "sourceUrl",
            "originalUrl", "sourceType", category, tags, "publishedAt", 
            "isBreaking", "isVerified", coverage, "viewCount"
          ) VALUES (
            gen_random_uuid()::TEXT,
            ${item.title},
            ${item.title},
            ${item.contentSnippet?.substring(0, 500) || null},
            ${source.name},
            ${source.url},
            ${item.link},
            ${source.type},
            ${category},
            ARRAY[]::TEXT[],
            ${item.pubDate ? new Date(item.pubDate) : new Date()},
            false,
            true,
            ARRAY[]::TEXT[],
            0
          )
        `;

        results.push({ source: source.name, title: item.title.substring(0, 50) });
      }
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      results.push({ source: source.name, error: String(error) });
    }
  }

  return NextResponse.json({ 
    success: true, 
    fetched: results.length,
    results 
  });
}

// POST to trigger with body auth
export async function POST(req: Request) {
  return GET(req);
}
