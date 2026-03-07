import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { ok: false as const, error: "ADMIN_PASSWORD is not set" };
  }

  // MVP: Authorization: Bearer <ADMIN_PASSWORD>
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (token !== expected) {
    return { ok: false as const, error: "Unauthorized" };
  }

  return { ok: true as const };
}
