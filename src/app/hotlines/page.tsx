"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Hotline = {
  id: string;
  nameAr: string;
  phone: string;
  region: string;
  category: string;
  notes: string | null;
  sourceUrl: string | null;
  displayOrder: number;
};

const categoryLabel: Record<string, string> = {
  emergency: "طوارئ",
  medical: "طبي",
  police: "أمن",
  military: "عسكري",
  health: "صحة",
  traffic: "مرور",
  transport: "نقل",
  customs: "جمارك",
  tourism: "سياحة",
  utilities: "خدمات",
  general: "عام",
};

const categoryBadge: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  emergency: "danger",
  medical: "success",
  police: "info",
  military: "default",
  health: "success",
  traffic: "warning",
  transport: "info",
  customs: "default",
  tourism: "info",
  utilities: "warning",
  general: "default",
};

const categoryIcon: Record<string, string> = {
  emergency: "🚨",
  medical: "🏥",
  police: "👮",
  military: "🪖",
  health: "⚕️",
  traffic: "🚦",
  transport: "✈️",
  customs: "🛃",
  tourism: "🗺️",
  utilities: "⚡",
  general: "📞",
};

export default function HotlinesPage() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/hotlines");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setHotlines(json.hotlines ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = [...new Set(hotlines.map((h) => h.category))];
  
  const filteredHotlines = selectedCategory
    ? hotlines.filter((h) => h.category === selectedCategory)
    : hotlines;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">أرقام الطوارئ والاتصال</h1>
          <p className="mt-2 text-zinc-600">
            أرقام الطوارئ والخطوط الساخنة الهامة في لبنان
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{hotlines.length}</div>
            <div className="text-sm text-zinc-500">رقم متاح</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">112</div>
            <div className="text-sm text-zinc-500">الطوارئ الموحدة</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{categories.length}</div>
            <div className="text-sm text-zinc-500">فئات</div>
          </div>
        </div>

        {/* Category Filter */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">تصفية حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                الكل
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span>{categoryIcon[cat] || "📞"}</span>
                  {categoryLabel[cat] || cat}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hotlines List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-600">جارٍ التحميل...</p>
              </CardContent>
            </Card>
          ) : filteredHotlines.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">📞</div>
                <p className="text-zinc-600">لا توجد أرقام متاحة</p>
              </CardContent>
            </Card>
          ) : (
            filteredHotlines.map((h) => (
              <Card key={h.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{categoryIcon[h.category] || "📞"}</span>
                        <Badge variant={categoryBadge[h.category] || "default"}>
                          {categoryLabel[h.category] || h.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{h.nameAr}</CardTitle>
                      {h.notes && (
                        <CardDescription className="mt-1">{h.notes}</CardDescription>
                      )}
                    </div>
                    <div className="text-left">
                      <a
                        href={`tel:${h.phone}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {h.phone}
                      </a>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>البيانات مأخوذة من مصادر رسمية. يُرجى التحقق من صحة الأرقام.</p>
        </div>
      </div>
    </div>
  );
}
