import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function initSocketServer(server: NetServer) {
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

    // Join area-specific rooms for targeted alerts
    socket.on("subscribe-area", (area: string) => {
      socket.join(`area:${area}`);
      console.log(`Socket ${socket.id} subscribed to area: ${area}`);
    });

    socket.on("unsubscribe-area", (area: string) => {
      socket.leave(`area:${area}`);
      console.log(`Socket ${socket.id} unsubscribed from area: ${area}`);
    });

    // Subscribe to severity levels
    socket.on("subscribe-severity", (levels: string[]) => {
      levels.forEach((level) => socket.join(`severity:${level}`));
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

// Emit alert to specific areas or all users
export function emitAlert(alert: {
  id: string;
  type: "urgent" | "warning" | "info";
  titleAr: string;
  bodyAr: string;
  areas?: string[];
  timestamp: string;
}) {
  if (!io) return;

  const event = alert.type === "urgent" ? "urgent-alert" : alert.type === "warning" ? "warning-alert" : "info-alert";

  if (alert.areas && alert.areas.length > 0) {
    // Target specific areas
    alert.areas.forEach((area) => {
      io?.to(`area:${area}`).emit(event, alert);
    });
  } else {
    // Broadcast to all
    io?.emit(event, alert);
  }
}

// Emit threat update
export function emitThreatUpdate(threat: {
  id: string;
  type: string;
  location: { lat: number; lng: number; address: string };
  status: string;
  timestamp: string;
}) {
  if (!io) return;
  io.emit("threat-update", threat);
}
