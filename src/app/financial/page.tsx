"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type FinancialRate = {
  type: string;
  value: number;
  currency: string;
  sourceName: string;
  changePercent: number | null;
  createdAt: string;
};

const rateLabels: Record<string, { label: string; icon: string; unit: string }> = {
  lira_official: { label: "الليرة الرسمية", icon: "🏦", unit: "LBP/USD" },
  lira_black: { label: "السوق السوداء", icon: "💱", unit: "LBP/USD" },
  lira_sayrafa: { label: "منصة صيرفة", icon: "📱", unit: "LBP/USD" },
  fuel_95: { label: "بنزين 95", icon: "⛽", unit: "LBP/L" },
  fuel_98: { label: "بنزين 98", icon: "⛽", unit: "LBP/L" },
  fuel_diesel: { label: "مازوت", icon: "🛢️", unit: "LBP/L" },
  gold_24k: { label: "ذهب 24 قيراط", icon: "🥇", unit: "USD/g" },
  gold_21k: { label: "ذهب 21 قيراط", icon: "🥇", unit: "USD/g" },
  usd: { label: "دولار أمريكي", icon: "💵", unit: "指数" },
  eur: { label: "يورو", icon: "💶", unit: "指数" },
};

export default function FinancialPage() {
  const [rates, setRates] = useState<FinancialRate[]>([]);
  const [history, setHistory] = useState<Record<string, Array<{ value: number; time: string }>>>({});
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/financial");
      const json = await res.json();
      setRates(json.rates || []);
      
      // Convert history array to object keyed by type
      const historyObj: Record<string, Array<{ value: number; time: string }>> = {};
      if (json.history && Array.isArray(json.history)) {
        json.history.forEach((item: { type: string; value: number; createdAt: string }) => {
          if (!historyObj[item.type]) {
            historyObj[item.type] = [];
          }
          historyObj[item.type].push({
            value: item.value,
            time: item.createdAt
          });
        });
      }
      setHistory(historyObj);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Auto-refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, type: string) => {
    if (type.startsWith("lira")) {
      return num.toLocaleString("en-US");
    }
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">المعلومات المالية</h1>
          <p className="mt-2 text-zinc-600">
            أسعار الصرف، المحروقات، والذهب - تحديث مباشر
          </p>
        </div>

        {/* Last Updated */}
        <div className="mb-6 text-sm text-zinc-500">
          آخر تحديث: {new Date().toLocaleString("ar-LB")}
          <button
            onClick={load}
            className="mr-4 text-indigo-600 hover:text-indigo-800"
            disabled={loading}
          >
            {loading ? "جارٍ التحديث..." : "تحديث الآن"}
          </button>
        </div>

        {/* Lira Exchange Rates */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">أسعار صرف الليرة</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["lira_official", "lira_black", "lira_sayrafa"].map((type) => {
              const rate = rates.find((r) => r.type === type);
              if (!rate) return null;
              const config = rateLabels[type];
              return (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-zinc-900">
                      {formatNumber(rate.value, type)}
                    </div>
                    <div className="text-sm text-zinc-500">{config.unit}</div>
                    {rate.changePercent !== null && (
                      <div className={`mt-2 text-sm ${rate.changePercent > 0 ? "text-red-600" : rate.changePercent < 0 ? "text-green-600" : "text-zinc-600"}`}>
                        {rate.changePercent > 0 ? "▲" : rate.changePercent < 0 ? "▼" : "—"}
                        {Math.abs(rate.changePercent).toFixed(2)}%
                      </div>
                    )}
                    <div className="mt-2 text-xs text-zinc-400">
                      المصدر: {rate.sourceName}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fuel Prices */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">أسعار المحروقات</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["fuel_95", "fuel_98", "fuel_diesel"].map((type) => {
              const rate = rates.find((r) => r.type === type);
              if (!rate) return (
                <Card key={type} className="opacity-50">
                  <CardContent className="py-8 text-center text-zinc-500">
                    غير متوفر
                  </CardContent>
                </Card>
              );
              const config = rateLabels[type];
              return (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-zinc-900">
                      {formatNumber(rate.value, type)}
                    </div>
                    <div className="text-sm text-zinc-500">{config.unit}</div>
                    <div className="mt-2 text-xs text-zinc-400">
                      المصدر: {rate.sourceName}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Gold Prices */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">أسعار الذهب</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {["gold_24k", "gold_21k"].map((type) => {
              const rate = rates.find((r) => r.type === type);
              if (!rate) return null;
              const config = rateLabels[type];
              return (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-zinc-900">
                      ${formatNumber(rate.value, type)}
                    </div>
                    <div className="text-sm text-zinc-500">{config.unit}</div>
                    <div className="mt-2 text-xs text-zinc-400">
                      المصدر: {rate.sourceName}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Simple 24h Chart Placeholder */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>تحليل 24 ساعة - سعر الصرف</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(history["lira_black"]) && history["lira_black"].length > 0 ? (
              <div className="h-32 flex items-end gap-1">
                {history["lira_black"].slice(-20).map((point: { value: number; time: string }, i: number) => {
                  const max = Math.max(...history["lira_black"].slice(-20).map((p: { value: number }) => p.value));
                  const min = Math.min(...history["lira_black"].slice(-20).map((p: { value: number }) => p.value));
                  const range = max - min || 1;
                  const height = ((point.value - min) / range) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-indigo-500 hover:bg-indigo-600 transition-all"
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${point.value} - ${new Date(point.time).toLocaleTimeString("ar-LB")}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500">
                لا توجد بيانات تاريخية متاحة
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sources */}
        <div className="mt-8 text-center text-sm text-zinc-500">
          <p>المصادر: مصرف لبنان المركزي، منصة صيرفة، LiraRate.org، وزارة الطاقة والمياه، المجلس العالمي للذهب</p>
          <p className="mt-1">⚠️ الأسعار غير الرسمية للسوق السوداء هي تقديرات تقريبية</p>
        </div>
      </div>
    </div>
  );
}
