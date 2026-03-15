"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function DataExport() {
  const [loading, setLoading] = useState<string | null>(null);

  async function exportData(type: string) {
    setLoading(type);
    try {
      let data: unknown[] = [];
      let filename = "";

      switch (type) {
        case "shelters":
          const sheltersRes = await fetch("/api/shelters");
          const shelters = await sheltersRes.json();
          data = shelters.shelters || [];
          filename = "shelters.csv";
          break;
        case "housing":
          const housingRes = await fetch("/api/housing");
          const housing = await housingRes.json();
          data = housing.housing || [];
          filename = "housing.csv";
          break;
        case "threats":
          const threatsRes = await fetch("/api/threats");
          const threats = await threatsRes.json();
          data = threats.threats || [];
          filename = "threats.csv";
          break;
        case "help":
          const helpRes = await fetch("/api/help");
          const help = await helpRes.json();
          data = help.posts || [];
          filename = "help_requests.csv";
          break;
        case "hotlines":
          const hotlinesRes = await fetch("/api/hotlines");
          const hotlines = await hotlinesRes.json();
          data = hotlines.hotlines || [];
          filename = "hotlines.csv";
          break;
      }

      // Convert to CSV
      if (data.length > 0) {
        const headers = Object.keys(data[0] as Record<string, unknown>).join(",");
        const rows = data.map((row) => 
          Object.values(row as Record<string, unknown>).map((v: unknown) => 
            `"${String(v).replace(/"/g, '""')}"`
          ).join(",")
        );
        const csv = [headers, ...rows].join("\n");

        // Download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      }
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setLoading(null);
    }
  }

  const exportOptions = [
    { key: "shelters", label: "مراكز الإيواء", icon: "🏠" },
    { key: "housing", label: "سكن خاص", icon: "🔑" },
    { key: "threats", label: "التهديدات", icon: "⚠️" },
    { key: "help", label: "طلبات المساعدة", icon: "🤝" },
    { key: "hotlines", label: "أرقام الطوارئ", icon: "📞" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 تصدير البيانات</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 mb-4">
          تصدير البيانات بصيغة CSV للتحليل والتقارير
        </p>
        <div className="grid grid-cols-2 gap-3">
          {exportOptions.map((option) => (
            <Button
              key={option.key}
              variant="outline"
              onClick={() => exportData(option.key)}
              disabled={loading === option.key}
              className="justify-start"
            >
              <span className="mr-2">{option.icon}</span>
              {loading === option.key ? "جارٍ التصدير..." : option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
