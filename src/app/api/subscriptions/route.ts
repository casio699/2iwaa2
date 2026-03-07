import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/subscriptions - Create or update subscription
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fingerprint,
      areas,
      alertTypes,
      categories,
      pushSubscription,
      phoneNumber,
      smsEnabled,
      whatsappNumber,
      whatsappEnabled,
      email,
      emailEnabled,
    } = body;

    if (!fingerprint) {
      return NextResponse.json(
        { error: "Fingerprint required" },
        { status: 400 }
      );
    }

    // Check if subscription exists
    const existing = await prisma.$queryRaw<
      Array<{ id: string }>
    >`
      SELECT id FROM "UserAlertSubscription"
      WHERE fingerprint = ${fingerprint}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing
      await prisma.$executeRaw`
        UPDATE "UserAlertSubscription"
        SET 
          areas = ${areas || []},
          "alertTypes" = ${alertTypes || ["urgent", "warning"]},
          categories = ${categories || ["all"]},
          "pushSubscription" = ${pushSubscription ? JSON.stringify(pushSubscription) : null},
          "phoneNumber" = ${phoneNumber || null},
          "smsEnabled" = ${smsEnabled || false},
          "whatsappNumber" = ${whatsappNumber || null},
          "whatsappEnabled" = ${whatsappEnabled || false},
          email = ${email || null},
          "emailEnabled" = ${emailEnabled || false},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;

      return NextResponse.json({ 
        success: true, 
        message: "تم تحديث الاشتراك",
        id: existing[0].id 
      });
    } else {
      // Create new
      const result = await prisma.$queryRaw<
        Array<{ id: string }>
      >`
        INSERT INTO "UserAlertSubscription" (
          id, fingerprint, areas, "alertTypes", categories,
          "pushSubscription", "phoneNumber", "smsEnabled",
          "whatsappNumber", "whatsappEnabled", email, "emailEnabled",
          "isActive", "notificationCount"
        ) VALUES (
          gen_random_uuid()::TEXT,
          ${fingerprint},
          ${areas || []},
          ${alertTypes || ["urgent", "warning"]},
          ${categories || ["all"]},
          ${pushSubscription ? JSON.stringify(pushSubscription) : null},
          ${phoneNumber || null},
          ${smsEnabled || false},
          ${whatsappNumber || null},
          ${whatsappEnabled || false},
          ${email || null},
          ${emailEnabled || false},
          true,
          0
        )
        RETURNING id
      `;

      return NextResponse.json({ 
        success: true, 
        message: "تم إنشاء الاشتراك",
        id: result[0]?.id 
      });
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to manage subscription" },
      { status: 500 }
    );
  }
}

// GET /api/subscriptions/:fingerprint
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fingerprint = url.searchParams.get("fingerprint");

  if (!fingerprint) {
    return NextResponse.json(
      { error: "Fingerprint required" },
      { status: 400 }
    );
  }

  const subs = await prisma.$queryRaw<
    Array<{
      id: string;
      areas: string[];
      alertTypes: string[];
      categories: string[];
      smsEnabled: boolean;
      whatsappEnabled: boolean;
      emailEnabled: boolean;
    }>
  >`
    SELECT id, areas, "alertTypes", categories,
           "smsEnabled", "whatsappEnabled", "emailEnabled"
    FROM "UserAlertSubscription"
    WHERE fingerprint = ${fingerprint}
    AND "isActive" = true
    LIMIT 1
  `;

  return NextResponse.json({ subscription: subs[0] || null });
}

// DELETE /api/subscriptions - Unsubscribe
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const fingerprint = url.searchParams.get("fingerprint");

  if (!fingerprint) {
    return NextResponse.json(
      { error: "Fingerprint required" },
      { status: 400 }
    );
  }

  await prisma.$executeRaw`
    UPDATE "UserAlertSubscription"
    SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
    WHERE fingerprint = ${fingerprint}
  `;

  return NextResponse.json({ success: true, message: "تم إلغاء الاشتراك" });
}
