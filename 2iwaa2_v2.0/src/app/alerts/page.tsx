"use client";

import { useEffect, useState } from "react";

type AlertItem = {
  id: string;
  titleAr: string;
  bodyAr: string;
  severity: "urgent" | "warning" | "info";
  publishedAt?: string | null;
  createdAt: string;
};

const severityLabelAr: Record<AlertItem["severity"], string> = {
  urgent: "عاجل",
  warning: "تحذير",
  info: "معلومة",
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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">تنبيهات الخطر</h1>
            <p className="mt-2 text-zinc-700">آخر التنبيهات المنشورة.</p>
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
          {alerts.length === 0 ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-zinc-600">
              لا توجد تنبيهات منشورة حالياً.
            </div>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className="rounded-lg border bg-white p-4">
                <div className="text-sm text-zinc-600">{severityLabelAr[a.severity] ?? a.severity}</div>
                <div className="mt-1 font-semibold">{a.titleAr}</div>
                <div className="mt-2 text-sm text-zinc-800">{a.bodyAr}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
