"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Feature = {
  type: "Feature";
  id: string;
  properties: {
    name?: string | null;
    amenity?: string | null;
    source?: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

type Amenity = "hospital" | "clinic" | "pharmacy";

const amenityConfig: Record<Amenity, { label: string; icon: string; badge: "default" | "success" | "warning" | "danger" | "info" }> = {
  hospital: { label: "مستشفيات", icon: "🏥", badge: "danger" },
  clinic: { label: "عيادات", icon: "🩺", badge: "info" },
  pharmacy: { label: "صيدليات", icon: "💊", badge: "success" },
};

export default function HospitalsPage() {
  const [amenity, setAmenity] = useState<Amenity>("hospital");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = useMemo(() => amenityConfig[amenity], [amenity]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/pois/healthcare?amenity=${amenity}&limit=800`);
      const json = (await res.json()) as FeatureCollection & { error?: string };
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setData(json);
    } catch (e) {
      setError(String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {
      // ignore
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amenity]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">خدمات صحية</h1>
            <p className="mt-2 text-zinc-600">
              بيانات أولية من OpenStreetMap (قد تحتوي أخطاء). يُفضّل الاتصال بالطوارئ عند الحاجة.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => load().catch((e) => setError(String(e)))}
            disabled={loading}
          >
            {loading ? "جارٍ التحديث..." : "تحديث"}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{data?.features.length ?? 0}</div>
            <div className="text-sm text-zinc-500">{config.label}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">OSM</div>
            <div className="text-sm text-zinc-500">المصدر</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">قيد التحديث</div>
            <div className="text-sm text-zinc-500">الحالة</div>
          </div>
        </div>

        {/* Type Selector */}
        <Card className="mt-8">
          <CardHeader className="pb-3">
            <div className="text-sm font-semibold text-zinc-800">اختر النوع</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["hospital", "clinic", "pharmacy"] as Amenity[]).map((k) => (
                <button
                  key={k}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    amenity === k
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                  onClick={() => setAmenity(k)}
                >
                  <span>{amenityConfig[k].icon}</span>
                  {amenityConfig[k].label}
                </button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Results */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={config.badge}>{config.label}</Badge>
            <span className="text-sm text-zinc-500">
              {data ? `(${data.features.length} نتيجة)` : ""}
            </span>
          </div>

          {error ? (
            <Card>
              <CardContent className="py-8 text-center text-red-600">{error}</CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3">
            {!data ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-3">{config.icon}</div>
                  <p className="text-zinc-600">{loading ? "جارٍ التحميل..." : "لا توجد بيانات حالياً."}</p>
                </CardContent>
              </Card>
            ) : data.features.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-zinc-600">لا توجد نتائج.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="border-b px-4 py-3 text-sm text-zinc-600">
                  العدد: {data.features.length}
                </div>
                <div className="divide-y">
                  {data.features.slice(0, 200).map((f) => (
                    <div key={f.id} className="px-4 py-3">
                      <div className="font-semibold text-zinc-900">{f.properties.name || "بدون اسم"}</div>
                      <div className="mt-1 text-sm text-zinc-500">
                        {f.geometry.coordinates[1].toFixed(5)}, {f.geometry.coordinates[0].toFixed(5)}
                      </div>
                    </div>
                  ))}
                </div>
                {data.features.length > 200 ? (
                  <div className="border-t px-4 py-3 text-sm text-zinc-600">
                    عرض أول 200 نتيجة فقط (للسرعة). لاحقاً سنضيف بحث/خريطة.
                  </div>
                ) : null}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
