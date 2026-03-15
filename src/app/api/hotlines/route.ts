/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dataSync } from "@/lib/data-sync";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";
import { prisma } from "@/lib/prisma";

// GET /api/hotlines - List all active hotlines with caching
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Use our new data sync system with caching
    const hotlines = await dataSync.getFreshData('hotlines', { limit, offset }) as any[];
    
    return NextResponse.json({ 
      success: true,
      hotlines,
      pagination: {
        limit,
        offset,
        total: hotlines.length
      }
    });
  } catch (error) {
    console.error('Hotlines API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotlines', success: false },
      { status: 500 }
    );
  }
}

// POST /api/admin/hotlines/import - Import from seed file (admin only)
export async function POST(req: Request) {
  // Simple auth check
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Read and parse CSV
    const csvPath = path.join(process.cwd(), "data", "seed", "hotlines.csv");
    const csvContent = await fs.readFile(csvPath, "utf-8");
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<{
      name_ar: string;
      phone: string;
      region: string;
      category: string;
      notes: string;
      source_url: string;
    }>;

    // Clear existing hotlines and insert new ones
    await prisma.$executeRaw`DELETE FROM "Hotline"`;

    const categoryOrder: Record<string, number> = {
      emergency: 1,
      medical: 2,
      police: 3,
      military: 4,
      health: 5,
      traffic: 6,
      transport: 7,
      customs: 8,
      tourism: 9,
      utilities: 10,
    };

    let imported = 0;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (!record.name_ar || !record.phone) continue;

      await prisma.$executeRaw`
        INSERT INTO "Hotline" (id, "nameAr", phone, region, category, notes, "sourceUrl", "displayOrder", "isActive")
        VALUES (
          gen_random_uuid()::TEXT,
          ${record.name_ar},
          ${record.phone},
          ${record.region || "Lebanon"},
          ${record.category || "general"},
          ${record.notes || null},
          ${record.source_url || null},
          ${categoryOrder[record.category] || 99},
          true
        )
      `;
      imported++;
    }

    return NextResponse.json({ 
      success: true, 
      imported,
      total: records.length 
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    );
  }
}
