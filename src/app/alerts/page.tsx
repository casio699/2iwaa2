"use client";

import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Alert = {
  id: string;
  titleAr: string;
  bodyAr: string;
  severity: "urgent" | "warning" | "info";
  publishedAt?: string;
  createdAt?: string;
};

const severityConfig: Record<Alert["severity"], { label: string; variant: "default" | "success" | "warning" | "danger" | "info"; icon: string }> = {
  urgent: { label: "عاجل", variant: "danger", icon: "🚨" },
  warning: { label: "تحذير", variant: "warning", icon: "⚠️" },
  info: { label: "معلومة", variant: "info", icon: "ℹ️" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const json = await res.json();
      setAlerts(json.alerts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // WebSocket connection
  useEffect(() => {
    const socketInstance = io("/api/socket", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      const areas = ["بيروت", "جبل لبنان", "الشمال", "البقاع", "الجنوب"];
      areas.forEach((area) => socketInstance.emit("subscribe-area", area));
    });

    socketInstance.on("disconnect", () => setConnected(false));

    socketInstance.on("urgent-alert", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    socketInstance.on("warning-alert", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    socketInstance.on("info-alert", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => { socketInstance.disconnect(); };
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
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${connected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`} />
              {connected ? "متصل" : "غير متصل"}
            </div>
            <Button
              variant="outline"
              onClick={() => load()}
              disabled={loading}
            >
              {loading ? "جارٍ التحديث..." : "تحديث"}
            </Button>
          </div>
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
                <Card key={a.id} className={`overflow-hidden ${a.severity === "urgent" ? "border-red-500 border-l-4" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{config.icon}</span>
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {a.publishedAt && (
                        <span className="text-xs text-zinc-500 mr-auto">
                          {new Date(a.publishedAt).toLocaleString("ar-LB")}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{a.titleAr}</CardTitle>
                    <CardDescription className="mt-1 leading-relaxed">{a.bodyAr}</CardDescription>
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
