"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ThreatFormModal } from "@/components/ThreatFormModal";

type Threat = {
  id: string;
  type: string;
  subtype: string | null;
  latitude: number;
  longitude: number;
  areaNameAr: string;
  governorate: string | null;
  reportedAt: string;
  descriptionAr: string;
  casualties: number | null;
  damageLevel: string | null;
  source: string;
  status: string;
};

type Stats = Array<{ type: string; count: number }>;

const threatLabels: Record<string, { label: string; icon: string; color: string }> = {
  rocket: { label: "صاروخ", icon: "🚀", color: "bg-red-100 text-red-800" },
  airstrike: { label: "غارة جوية", icon: "✈️", color: "bg-red-100 text-red-800" },
  shelling: { label: "قصف", icon: "💥", color: "bg-orange-100 text-orange-800" },
  border_clash: { label: "اشتباك حدودي", icon: "⚔️", color: "bg-yellow-100 text-yellow-800" },
  drone: { label: "طائرة مسيّرة", icon: "🛸", color: "bg-purple-100 text-purple-800" },
  naval: { label: "بحري", icon: "🚢", color: "bg-blue-100 text-blue-800" },
  ground: { label: "بري", icon: "🪖", color: "bg-zinc-100 text-zinc-800" },
};

const damageLabels: Record<string, string> = {
  minor: "طفيف",
  moderate: "متوسط",
  severe: "شديد",
  unknown: "غير معروف",
};

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [stats, setStats] = useState<Stats>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [days, setDays] = useState(7);
  const [threatModalOpen, setThreatModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/threats?days=${days}`);
      const json = await res.json();
      setThreats(json.threats || []);
      setStats(json.stats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [days]);

  const filtered = filter === "all"
    ? threats
    : threats.filter((t) => t.type === filter);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">قاعدة بيانات التهديدات</h1>
          <p className="mt-2 text-zinc-600">
            تتبع التهديدات والحوادث الأمنية مع التحقق من المصادر
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{threats.length}</div>
            <div className="text-sm text-zinc-500">تهديد مسجّل</div>
          </div>
          {stats.slice(0, 3).map((s) => (
            <div key={s.type} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-zinc-700">{s.count}</div>
              <div className="text-sm text-zinc-500">
                {threatLabels[s.type]?.label || s.type}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              الكل
            </button>
            {Object.entries(threatLabels).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  filter === key
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {value.icon} {value.label}
              </button>
            ))}
          </div>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value={1}>آخر 24 ساعة</option>
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
          </select>
        </div>

        {/* Threats List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-600">جارٍ تحميل البيانات...</p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🛡️</div>
                <p className="text-zinc-600">لا توجد تهديدات مسجّلة في هذه الفترة</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((threat) => (
              <Card key={threat.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-2xl">{threatLabels[threat.type]?.icon || "⚠️"}</span>
                    <Badge className={threatLabels[threat.type]?.color || "bg-zinc-100"}>
                      {threatLabels[threat.type]?.label || threat.type}
                    </Badge>
                    <Badge variant={threat.status === "verified" ? "success" : "warning"}>
                      {threat.status === "verified" ? "✓ موثق" : "قيد التحقق"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{threat.areaNameAr}</CardTitle>
                  <p className="text-sm text-zinc-500">
                    {threat.governorate && `${threat.governorate} - `}
                    {new Date(threat.reportedAt).toLocaleString("ar-LB")}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-700 mb-4">{threat.descriptionAr}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {threat.casualties !== null && threat.casualties > 0 && (
                      <div className="text-red-600">
                        <span className="font-medium">الإصابات:</span> {threat.casualties}
                      </div>
                    )}
                    {threat.damageLevel && (
                      <div className="text-zinc-600">
                        <span className="font-medium">الأضرار:</span> {damageLabels[threat.damageLevel] || threat.damageLevel}
                      </div>
                    )}
                    <div className="text-zinc-500">
                      <span className="font-medium">المصدر:</span> {threat.source}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                      الإحداثيات: {threat.latitude.toFixed(4)}, {threat.longitude.toFixed(4)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Report Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setThreatModalOpen(true)}>
            📢 الإبلاغ عن تهديد
          </Button>
        </div>

        {/* Modal */}
        <ThreatFormModal
          isOpen={threatModalOpen}
          onClose={() => setThreatModalOpen(false)}
          onSuccess={load}
        />
      </div>
    </div>
  );
}
