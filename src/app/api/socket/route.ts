import { NextResponse } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "@/lib/prisma";

// Global socket instance
let io: SocketIOServer | null = null;

export async function GET() {
  if (io) {
    return NextResponse.json({ status: "Socket server running" });
  }
  return NextResponse.json({ status: "Socket server not initialized" });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, titleAr, bodyAr, areas, severity } = body;

  if (!type || !titleAr || !bodyAr) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Save alert to database
  const alert = await prisma.$queryRaw<
    Array<{ id: string }>
  >`
    INSERT INTO "Alert" (
      id, "titleAr", "bodyAr", severity, "reviewStatus", "publishedAt", "publishedBy"
    ) VALUES (
      gen_random_uuid()::TEXT,
      ${titleAr},
      ${bodyAr},
      ${severity || "warning"},
      'verified',
      CURRENT_TIMESTAMP,
      'admin'
    )
    RETURNING id
  `;

  // Emit to connected clients if socket is initialized
  if (io) {
    const eventName = severity === "urgent" ? "urgent-alert" : severity === "warning" ? "warning-alert" : "info-alert";
    
    if (areas && areas.length > 0) {
      areas.forEach((area: string) => {
        io?.to(`area:${area}`).emit(eventName, {
          id: alert[0]?.id,
          type: severity,
          titleAr,
          bodyAr,
          areas,
          timestamp: new Date().toISOString(),
        });
      });
    } else {
      io?.emit(eventName, {
        id: alert[0]?.id,
        type: severity,
        titleAr,
        bodyAr,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "تم إرسال التنبيه",
    id: alert[0]?.id,
  });
}

// Initialize socket server (call this from server.ts or layout)
// Note: This function is exported for external use but not used as a route handler
function initSocketServer(server: NetServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("subscribe-area", (area: string) => {
      socket.join(`area:${area}`);
      console.log(`Socket ${socket.id} subscribed to: ${area}`);
    });

    socket.on("unsubscribe-area", (area: string) => {
      socket.leave(`area:${area}`);
    });

    socket.on("subscribe-severity", (levels: string[]) => {
      levels.forEach((level) => socket.join(`severity:${level}`));
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  return io;
}
