"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Shelter = {
  id: string;
  type: string;
  nameAr: string;
  addressAr?: string | null;
  governorateAr?: string | null;
  districtAr?: string | null;
  capacityTotal?: number | null;
  capacityUsed?: number | null;
  statusTextAr?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  updatedAt: string;
};

const typeLabel: Record<string, string> = {
  government: "رسمي",
  ngo: "جمعية",
  municipality: "بلدية",
  civilian: "مدني",
  hotel: "فندق",
};

function getCapacityBadge(s: Shelter) {
  if (typeof s.capacityUsed === "number" && typeof s.capacityTotal === "number") {
    const pct = s.capacityUsed / s.capacityTotal;
    if (pct >= 0.9) return { label: `ممتلئ (${s.capacityUsed}/${s.capacityTotal})`, variant: "danger" as const };
    if (pct >= 0.7) return { label: `شبه ممتلئ (${s.capacityUsed}/${s.capacityTotal})`, variant: "warning" as const };
    return { label: `متاح (${s.capacityUsed}/${s.capacityTotal})`, variant: "success" as const };
  }
  return { label: "السعة غير معروفة", variant: "default" as const };
}

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/shelters");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setShelters(json.shelters ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    const t = setTimeout(() => load().catch(() => {}), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">مراكز الإيواء</h1>
            <p className="mt-2 text-zinc-600">
              قائمة مراكز الإيواء والمساكن المتاحة. قريباً: خريطة + بحث + فلترة.
            </p>
          </div>
          <Button onClick={() => load().catch((e) => alert(String(e)))} disabled={loading} variant="secondary">
            {loading ? "جارٍ التحديث..." : "تحديث القائمة"}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{shelters.length}</div>
            <div className="text-sm text-zinc-500">مركز إيواء</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">
              {shelters.filter((s) => {
                if (typeof s.capacityUsed !== "number" || typeof s.capacityTotal !== "number") return false;
                return s.capacityUsed / s.capacityTotal < 0.7;
              }).length}
            </div>
            <div className="text-sm text-zinc-500">متاح بشكل جيد</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">
              {shelters.filter((s) => s.type === "government").length}
            </div>
            <div className="text-sm text-zinc-500">مراكز رسمية</div>
          </div>
        </div>

        {/* List */}
        <div className="mt-8 grid gap-4">
          {shelters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🏠</div>
                <p className="text-zinc-600">لا توجد مراكز بعد</p>
                <p className="mt-1 text-sm text-zinc-500">سيتم إضافة بيانات أولية قريباً</p>
              </CardContent>
            </Card>
          ) : (
            shelters.map((s) => {
              const cap = getCapacityBadge(s);
              return (
                <Card key={s.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-zinc-900">{s.nameAr}</h3>
                          <Badge variant="default">{typeLabel[s.type] || s.type}</Badge>
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
                          {s.governorateAr ? s.governorateAr : ""}
                          {s.districtAr ? ` · ${s.districtAr}` : ""}
                          {s.addressAr ? ` · ${s.addressAr}` : ""}
                        </div>
                      </div>
                      <Badge variant={cap.variant}>{cap.label}</Badge>
                    </div>
                    {s.statusTextAr ? (
                      <p className="mt-3 text-sm text-zinc-700 bg-zinc-50 rounded-lg p-3">
                        {s.statusTextAr}
                      </p>
                    ) : null}
                    {s.sourceUrl ? (
                      <a
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        المصدر{s.sourceName ? `: ${s.sourceName}` : ""}
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : null}
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
