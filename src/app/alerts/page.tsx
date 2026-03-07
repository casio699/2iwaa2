"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type AlertItem = {
  id: string;
  titleAr: string;
  bodyAr: string;
  severity: "urgent" | "warning" | "info";
  publishedAt?: string | null;
  createdAt: string;
};

const severityConfig: Record<AlertItem["severity"], { label: string; variant: "default" | "success" | "warning" | "danger" | "info"; icon: string }> = {
  urgent: { label: "عاجل", variant: "danger", icon: "🚨" },
  warning: { label: "تحذير", variant: "warning", icon: "⚠️" },
  info: { label: "معلومة", variant: "info", icon: "ℹ️" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setAlerts(json.alerts ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {
      // ignore
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">تنبيهات الخطر</h1>
            <p className="mt-2 text-zinc-600">آخر التنبيهات والتحذيرات المنشورة.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => load().catch((e) => alert(String(e)))}
            disabled={loading}
          >
            {loading ? "جارٍ التحديث..." : "تحديث"}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{alerts.length}</div>
            <div className="text-sm text-zinc-500">إجمالي التنبيهات</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter((a) => a.severity === "urgent").length}
            </div>
            <div className="text-sm text-zinc-500">تنبيهات عاجلة</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">
              {alerts.filter((a) => a.severity === "warning").length}
            </div>
            <div className="text-sm text-zinc-500">تحذيرات</div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="mt-8 grid gap-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">📢</div>
                <p className="text-zinc-600">لا توجد تنبيهات منشورة حالياً</p>
                <p className="mt-1 text-sm text-zinc-500">تابع الصفحة للحصول على آخر التحديثات</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((a) => {
              const config = severityConfig[a.severity];
              return (
                <Card key={a.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{config.icon}</span>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-zinc-900">{a.titleAr}</h3>
                        <p className="mt-2 text-zinc-700 leading-relaxed">{a.bodyAr}</p>
                      </div>
                    </div>
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
