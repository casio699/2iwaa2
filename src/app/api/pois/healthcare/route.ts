import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedAmenity = new Set(["hospital", "clinic", "pharmacy"]);

function parseNumber(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Read-only endpoint backed by PostGIS views created from OSM import.
// Returns GeoJSON points (centroids for polygons).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const amenity = url.searchParams.get("amenity") ?? "hospital";
  const limit = Math.min(2000, Math.max(1, parseNumber(url.searchParams.get("limit"), 500)));

  if (!allowedAmenity.has(amenity)) {
    return NextResponse.json(
      { error: "Invalid amenity. Use hospital|clinic|pharmacy" },
      { status: 400 }
    );
  }

  // Points
  const points = await prisma.$queryRaw<
    Array<{ osm_id: bigint; name: string | null; amenity: string | null; lon: number; lat: number }>
  >`
    SELECT
      osm_id,
      name,
      amenity,
      ST_X(geom_wgs84) AS lon,
      ST_Y(geom_wgs84) AS lat
    FROM osm_healthcare_points
    WHERE amenity = ${amenity}
    LIMIT ${limit};
  `;

  // Polygons -> centroid points
  const polys = await prisma.$queryRaw<
    Array<{ osm_id: bigint; name: string | null; amenity: string | null; lon: number; lat: number }>
  >`
    SELECT
      osm_id,
      name,
      amenity,
      ST_X(ST_Centroid(geom_wgs84)) AS lon,
      ST_Y(ST_Centroid(geom_wgs84)) AS lat
    FROM osm_healthcare_polygons
    WHERE amenity = ${amenity}
    LIMIT ${limit};
  `;

  const features = [...points, ...polys].map((row) => ({
    type: "Feature" as const,
    id: row.osm_id.toString(),
    properties: {
      name: row.name,
      amenity: row.amenity,
      source: "osm",
    },
    geometry: {
      type: "Point" as const,
      coordinates: [row.lon, row.lat],
    },
  }));

  return NextResponse.json({
    type: "FeatureCollection",
    features,
  });
}
