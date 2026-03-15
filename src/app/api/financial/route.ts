import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock data for fallback when database is empty
const mockFinancialData = [
  {
    id: "mock-1",
    type: "lira_official",
    value: 15000,
    currency: "LBP",
    sourceName: "مصرف لبنان",
    sourceUrl: "https://bdl.gov.lb",
    previousValue: 15000,
    changePercent: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    type: "lira_black",
    value: 85000,
    currency: "LBP",
    sourceName: "LiraRate",
    sourceUrl: "https://lirarate.org",
    previousValue: 83000,
    changePercent: 2.41,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    type: "lira_sayrafa",
    value: 88000,
    currency: "LBP",
    sourceName: "منصة صيرفة",
    sourceUrl: "https://sayrafa.gov.lb",
    previousValue: 87500,
    changePercent: 0.57,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    type: "fuel_95",
    value: 38000,
    currency: "LBP",
    sourceName: "وزارة الطاقة",
    sourceUrl: "https://www.energyandwater.gov.lb",
    previousValue: 37000,
    changePercent: 2.70,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-5",
    type: "fuel_98",
    value: 40000,
    currency: "LBP",
    sourceName: "وزارة الطاقة",
    sourceUrl: "https://www.energyandwater.gov.lb",
    previousValue: 39000,
    changePercent: 2.56,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-6",
    type: "fuel_diesel",
    value: 35000,
    currency: "LBP",
    sourceName: "وزارة الطاقة",
    sourceUrl: "https://www.energyandwater.gov.lb",
    previousValue: 34000,
    changePercent: 2.94,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-7",
    type: "gold_24k",
    value: 75.50,
    currency: "USD",
    sourceName: "World Gold Council",
    sourceUrl: "https://www.gold.org",
    previousValue: 74.80,
    changePercent: 0.94,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-8",
    type: "gold_21k",
    value: 66.06,
    currency: "USD",
    sourceName: "World Gold Council",
    sourceUrl: "https://www.gold.org",
    previousValue: 65.45,
    changePercent: 0.93,
    createdAt: new Date().toISOString(),
  },
];

// GET /api/financial - Get latest financial rates
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // lira_official | lira_black | fuel_95 | gold_24k | etc

    // Get latest rates for each type
    let rates;
    if (type) {
      rates = await prisma.$queryRaw`
        SELECT * FROM "FinancialRate" 
        WHERE type = ${type}
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `;
    } else {
      // Get latest rate for each type
      const latestRates = await prisma.$queryRaw`
        SELECT DISTINCT ON (type) *
        FROM "FinancialRate" 
        ORDER BY type, "createdAt" DESC
      `;
      rates = latestRates;
    }

    // If no data in database, return mock data
    if (!rates || (Array.isArray(rates) && rates.length === 0)) {
      const mockRates = type ? 
        mockFinancialData.filter(rate => rate.type === type) : 
        mockFinancialData;
      
      return NextResponse.json({ 
        rates: mockRates, 
        history: [],
        count: mockRates.length,
        source: "Mock data - database is empty"
      });
    }

    // Get 24h history for trend charts
    const since24h = new Date();
    since24h.setHours(since24h.getHours() - 24);

    const history = await prisma.$queryRaw`
      SELECT type, value, "createdAt"
      FROM "FinancialRate"
      WHERE "createdAt" >= ${since24h}
      ORDER BY "createdAt" ASC
    `;

    return NextResponse.json({ 
      rates: rates || [], 
      history: history || [],
      count: Array.isArray(rates) ? rates.length : 1
    });
  } catch (error) {
    console.error("Financial API error:", error);
    // Return mock data on error
    return NextResponse.json({ 
      rates: mockFinancialData, 
      history: [],
      count: mockFinancialData.length,
      source: "Mock data - API error"
    });
  }
}

// POST /api/admin/financial - Add new rate (admin only)
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      value,
      currency,
      sourceName,
      sourceUrl,
      previousValue,
      notes,
    } = body;

    if (!type || !value || !currency || !sourceName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate change percentage
    let changePercent = null;
    if (previousValue) {
      changePercent = ((value - previousValue) / previousValue) * 100;
    }

    await prisma.$executeRaw`
      INSERT INTO "FinancialRate" (
        id, type, value, currency, "sourceName", "sourceUrl",
        "previousValue", "changePercent", region, notes
      ) VALUES (
        gen_random_uuid()::TEXT,
        ${type},
        ${value},
        ${currency},
        ${sourceName},
        ${sourceUrl || null},
        ${previousValue || null},
        ${changePercent},
        'Lebanon',
        ${notes || null}
      )
    `;

    return NextResponse.json({ success: true, message: "تم تحديث السعر" });
  } catch (error) {
    console.error("Financial rate error:", error);
    return NextResponse.json(
      { error: "Failed to add rate" },
      { status: 500 }
    );
  }
}
