"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Stats {
  shelters: number;
  housing: number;
  threats: number;
  helpPosts: number;
  alerts: number;
  news: number;
  hotlines: number;
  users: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      // Fetch all stats in parallel
      const [shelters, housing, threats, helpPosts, alerts, news, hotlines] = await Promise.all([
        fetch("/api/shelters").then(r => r.json()).catch(() => ({ count: 0 })),
        fetch("/api/housing").then(r => r.json()).catch(() => ({ count: 0 })),
        fetch("/api/threats").then(r => r.json()).catch(() => ({ count: 0 })),
        fetch("/api/help").then(r => r.json()).catch(() => ({ count: 0 })),
        fetch("/api/alerts").then(r => r.json()).catch(() => ({ alerts: [] })),
        fetch("/api/news").then(r => r.json()).catch(() => ({ count: 0 })),
        fetch("/api/hotlines").then(r => r.json()).catch(() => ({ hotlines: [] })),
      ]);

      setStats({
        shelters: shelters.count || 0,
        housing: housing.count || 0,
        threats: threats.count || 0,
        helpPosts: helpPosts.count || 0,
        alerts: alerts.alerts?.length || 0,
        news: news.count || 0,
        hotlines: hotlines.hotlines?.length || 0,
        users: 0, // Would come from analytics
      });
    } catch (e) {
      console.error("Failed to load stats:", e);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { key: "shelters", label: "مراكز إيواء", color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "housing", label: "سكن خاص", color: "text-blue-600", bg: "bg-blue-50" },
    { key: "threats", label: "تهديدات", color: "text-red-600", bg: "bg-red-50" },
    { key: "helpPosts", label: "طلبات مساعدة", color: "text-amber-600", bg: "bg-amber-50" },
    { key: "alerts", label: "تنبيهات", color: "text-purple-600", bg: "bg-purple-50" },
    { key: "news", label: "أخبار", color: "text-indigo-600", bg: "bg-indigo-50" },
    { key: "hotlines", label: "أرقام طوارئ", color: "text-pink-600", bg: "bg-pink-50" },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.key} className="animate-pulse">
            <CardContent className="py-6">
              <div className="h-8 bg-zinc-200 rounded w-16 mb-2" />
              <div className="h-4 bg-zinc-200 rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card key={card.key} className={`${card.bg} border-none`}>
          <CardContent className="py-6">
            <div className={`text-3xl font-bold ${card.color}`}>
              {stats?.[card.key as keyof Stats] || 0}
            </div>
            <div className="text-sm text-zinc-600 mt-1">{card.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
