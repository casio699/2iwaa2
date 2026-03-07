"use client";

import { useEffect, useState } from "react";

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
    load().catch(() => {
      // ignore
    });

    const t = setTimeout(() => {
      load().catch(() => {
        // ignore
      });
    }, 1200);

    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">مراكز الإيواء</h1>
            <p className="mt-2 text-zinc-700">
              قائمة مراكز الإيواء (مبدئياً). قريباً: خريطة + بحث + فلترة.
            </p>
            <div className="mt-2 text-sm text-zinc-600">العدد: {shelters.length}</div>
          </div>

          <button
            className="rounded-md border bg-white px-3 py-1 text-sm hover:bg-zinc-50 disabled:opacity-50"
            onClick={() => load().catch((e) => alert(String(e)))}
            disabled={loading}
          >
            {loading ? "جارٍ التحديث..." : "تحديث"}
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {shelters.length === 0 ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-zinc-600">
              لا توجد مراكز بعد. (سيتم إضافة بيانات أولية قريباً)
            </div>
          ) : (
            shelters.map((s) => {
              const cap =
                typeof s.capacityUsed === "number" && typeof s.capacityTotal === "number"
                  ? `${s.capacityUsed}/${s.capacityTotal}`
                  : null;

              return (
                <div key={s.id} className="rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{s.nameAr}</div>
                      <div className="mt-1 text-sm text-zinc-600">
                        {s.governorateAr ? `${s.governorateAr}` : ""}
                        {s.districtAr ? ` - ${s.districtAr}` : ""}
                        {s.addressAr ? ` - ${s.addressAr}` : ""}
                      </div>
                      {s.statusTextAr ? (
                        <div className="mt-2 text-sm text-zinc-800">{s.statusTextAr}</div>
                      ) : null}
                      {s.sourceUrl ? (
                        <a
                          className="mt-2 inline-block text-sm text-blue-700 underline"
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          المصدر{ s.sourceName ? `: ${s.sourceName}` : "" }
                        </a>
                      ) : null}
                    </div>

                    <div className="text-sm text-zinc-700">
                      {cap ? (
                        <div className="rounded-md border bg-zinc-50 px-2 py-1">السعة: {cap}</div>
                      ) : (
                        <div className="rounded-md border bg-zinc-50 px-2 py-1">السعة: غير متوفرة</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
