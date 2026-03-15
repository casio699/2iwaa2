import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/housing - List available housing
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const governorate = url.searchParams.get("governorate");
    const verified = url.searchParams.get("verified");
    const available = url.searchParams.get("available");

    // Use separate queries for different filter combinations
    let housing;
    
    if (type && governorate && verified === "true" && available !== "false") {
      housing = await prisma.$queryRaw`
        SELECT id, type, price, currency, capacity, amenities, photos,
               "hostName", "hostPhone", "hostWhatsApp", "hostType",
               latitude, longitude, "addressAr", "governorateAr", "districtAr",
               "availableFrom", "availableTo", verified, featured
        FROM "Housing"
        WHERE type = ${type} 
          AND "governorateAr" = ${governorate}
          AND verified = true 
          AND "isAvailable" = true
        ORDER BY featured DESC, verified DESC, "createdAt" DESC
      `;
    } else if (type && governorate) {
      housing = await prisma.$queryRaw`
        SELECT id, type, price, currency, capacity, amenities, photos,
               "hostName", "hostPhone", "hostWhatsApp", "hostType",
               latitude, longitude, "addressAr", "governorateAr", "districtAr",
               "availableFrom", "availableTo", verified, featured
        FROM "Housing"
        WHERE type = ${type} 
          AND "governorateAr" = ${governorate}
          AND "isAvailable" = true
        ORDER BY featured DESC, verified DESC, "createdAt" DESC
      `;
    } else if (type) {
      housing = await prisma.$queryRaw`
        SELECT id, type, price, currency, capacity, amenities, photos,
               "hostName", "hostPhone", "hostWhatsApp", "hostType",
               latitude, longitude, "addressAr", "governorateAr", "districtAr",
               "availableFrom", "availableTo", verified, featured
        FROM "Housing"
        WHERE type = ${type} 
          AND "isAvailable" = true
        ORDER BY featured DESC, verified DESC, "createdAt" DESC
      `;
    } else if (governorate) {
      housing = await prisma.$queryRaw`
        SELECT id, type, price, currency, capacity, amenities, photos,
               "hostName", "hostPhone", "hostWhatsApp", "hostType",
               latitude, longitude, "addressAr", "governorateAr", "districtAr",
               "availableFrom", "availableTo", verified, featured
        FROM "Housing"
        WHERE "governorateAr" = ${governorate}
          AND "isAvailable" = true
        ORDER BY featured DESC, verified DESC, "createdAt" DESC
      `;
    } else {
      housing = await prisma.$queryRaw`
        SELECT id, type, price, currency, capacity, amenities, photos,
               "hostName", "hostPhone", "hostWhatsApp", "hostType",
               latitude, longitude, "addressAr", "governorateAr", "districtAr",
               "availableFrom", "availableTo", verified, featured
        FROM "Housing"
        WHERE "isAvailable" = true
        ORDER BY featured DESC, verified DESC, "createdAt" DESC
      `;
    }

    return NextResponse.json({ housing: housing as unknown[] || [], count: (housing as unknown[])?.length || 0 });
  } catch (error) {
    console.error("Housing API error:", error);
    return NextResponse.json({ housing: [], count: 0, error: "Failed to fetch housing" }, { status: 500 });
  }
}

// POST /api/housing - Create new housing listing
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      type,
      price,
      currency,
      capacity,
      amenities,
      photos,
      hostName,
      hostPhone,
      hostWhatsApp,
      hostType,
      latitude,
      longitude,
      addressAr,
      governorateAr,
      districtAr,
      availableFrom,
      availableTo,
    } = body;

    // Validation
    if (!type || !capacity || !hostName || !hostPhone || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$executeRaw`
      INSERT INTO "Housing" (id, type, price, currency, capacity, amenities, photos,
        "hostName", "hostPhone", "hostWhatsApp", "hostType", latitude, longitude,
        "addressAr", "governorateAr", "districtAr", "availableFrom", "availableTo",
        "isAvailable", verified, featured)
      VALUES (
        gen_random_uuid()::TEXT,
        ${type},
        ${price || null},
        ${currency || null},
        ${capacity},
        ${amenities || []},
        ${photos || []},
        ${hostName},
        ${hostPhone},
        ${hostWhatsApp || null},
        ${hostType || "civilian"},
        ${latitude},
        ${longitude},
        ${addressAr || null},
        ${governorateAr || null},
        ${districtAr || null},
        ${availableFrom ? new Date(availableFrom) : new Date()},
        ${availableTo ? new Date(availableTo) : null},
        true,
        false,
        false
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      message: "تم إضافة العرض بنجاح - في انتظار التحقق",
      id: result
    });
  } catch (error) {
    console.error("Housing creation error:", error);
    return NextResponse.json(
      { error: "Failed to create listing", details: String(error) },
      { status: 500 }
    );
  }
}
