"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HousingFormModal } from "@/components/HousingFormModal";

type Housing = {
  id: string;
  type: string;
  price: number | null;
  currency: string | null;
  capacity: number;
  amenities: string[];
  hostName: string;
  hostPhone: string;
  hostWhatsApp: string | null;
  hostType: string;
  latitude: number;
  longitude: number;
  addressAr: string | null;
  governorateAr: string | null;
  verified: boolean;
  featured: boolean;
};

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  free: { label: "مجاني", color: "bg-emerald-100 text-emerald-800", icon: "🏠" },
  rent: { label: "للإيجار", color: "bg-blue-100 text-blue-800", icon: "🔑" },
  hotel: { label: "فندق", color: "bg-purple-100 text-purple-800", icon: "🏨" },
};

const amenityIcons: Record<string, string> = {
  electricity: "⚡",
  water: "💧",
  hot_water: "🚿",
  internet: "📶",
  heating: "🔥",
};

export default function HousingPage() {
  const [housing, setHousing] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/housing?available=true");
      const json = await res.json();
      setHousing(json.housing || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" 
    ? housing 
    : housing.filter((h) => h.type === filter);

  const counts = {
    all: housing.length,
    free: housing.filter((h) => h.type === "free").length,
    rent: housing.filter((h) => h.type === "rent").length,
    hotel: housing.filter((h) => h.type === "hotel").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">سكن وإيواء</h1>
          <p className="mt-2 text-zinc-600">
            منازل، شقق، وفنادق متاحة للإيواء المؤقت - مجانية أو للإيجار
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{counts.all}</div>
            <div className="text-sm text-zinc-500">الكل</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{counts.free}</div>
            <div className="text-sm text-zinc-500">مجاني</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{counts.rent}</div>
            <div className="text-sm text-zinc-500">للإيجار</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{counts.hotel}</div>
            <div className="text-sm text-zinc-500">فنادق</div>
          </div>
        </div>

        {/* Filter & Add */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "الكل" },
              { key: "free", label: "مجاني" },
              { key: "rent", label: "للإيجار" },
              { key: "hotel", label: "فنادق" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "إلغاء" : "+ عرض سكن"}
          </Button>
        </div>

        {/* Housing List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-zinc-600">جارٍ التحميل...</p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🏠</div>
                <p className="text-zinc-600">لا توجد عروض متاحة حالياً</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((h) => (
              <Card key={h.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeLabels[h.type]?.icon || "🏠"}</span>
                      <Badge className={typeLabels[h.type]?.color || ""}>
                        {typeLabels[h.type]?.label || h.type}
                      </Badge>
                      {h.verified && (
                        <Badge variant="success">✓ موثق</Badge>
                      )}
                    </div>
                    {h.price && (
                      <div className="text-lg font-bold text-emerald-600">
                        {h.price} {h.currency}
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-lg">
                    سعة {h.capacity} أشخاص
                  </CardTitle>
                  <p className="text-sm text-zinc-500">
                    {h.governorateAr || "موقع غير محدد"}
                    {h.addressAr && ` - ${h.addressAr}`}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Amenities */}
                  {h.amenities.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {h.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs"
                        >
                          {amenityIcons[amenity] || "✓"} {amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact */}
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-zinc-600">
                      <span className="font-medium">المضيف:</span> {h.hostName}
                    </div>
                    <a
                      href={`tel:${h.hostPhone}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {h.hostPhone}
                    </a>
                    {h.hostWhatsApp && (
                      <a
                        href={`https://wa.me/${h.hostWhatsApp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.955L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        واتساب
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <HousingFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={load}
      />
    </div>
  );
}
