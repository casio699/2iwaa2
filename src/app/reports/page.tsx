"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type VerifiedReport = {
  id: string;
  type: string;
  titleAr: string;
  descriptionAr?: string | null;
  createdAt: string;
};

const reportTypeLabelsAr: Record<string, string> = {
  shelter_status: "حالة مركز إيواء",
  threat: "تهديد",
  damage: "أضرار",
  general: "عام",
};

const reportTypeBadge: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  shelter_status: "info",
  threat: "danger",
  damage: "warning",
  general: "default",
};

export default function ReportsPage() {
  const [type, setType] = useState("general");
  const [titleAr, setTitleAr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [verifiedReports, setVerifiedReports] = useState<VerifiedReport[]>([]);

  async function loadVerified() {
    const res = await fetch("/api/reports");
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Failed");
    setVerifiedReports(json.reports ?? []);
  }

  useEffect(() => {
    loadVerified().catch(() => {
      // ignore initial load errors
    });
  }, []);

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          titleAr,
          descriptionAr: descriptionAr || undefined,
          evidenceUrl: evidenceUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? "Failed");
      }

      setTitleAr("");
      setDescriptionAr("");
      setEvidenceUrl("");

      setMessage("تم استلام البلاغ. (قيد المراجعة)");
    } catch (e) {
      setMessage(`خطأ: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">بلاغات مباشرة</h1>
          <p className="mt-2 text-zinc-600">
            أرسل بلاغاً لمساعدة الناس. سيتم مراجعته قبل نشره.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Submit Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>إرسال بلاغ جديد</CardTitle>
              <CardDescription>
                املأ التفاصيل أدناه. سيتم مراجعة البلاغ من قبل فريق التحقق.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">نوع البلاغ</label>
                <select
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="general">عام</option>
                  <option value="shelter_status">حالة مركز إيواء</option>
                  <option value="threat">تهديد</option>
                  <option value="damage">أضرار</option>
                </select>
              </div>

              <Input
                label="العنوان"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: مركز الإيواء ممتلئ"
              />

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">تفاصيل (اختياري)</label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="اكتب التفاصيل التي تساعد على التحقق (وقت/مكان/معلومات إضافية)"
                />
              </div>

              <Input
                label="رابط دليل (اختياري)"
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
              />

              <Button
                onClick={submit}
                disabled={loading || titleAr.trim().length < 3}
                className="w-full"
              >
                {loading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
              </Button>

              {message && (
                <div className={`rounded-lg p-3 text-sm ${message.includes("خطأ") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verified Reports */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900">بلاغات موثّقة</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadVerified().catch((e) => alert(String(e)))}
              >
                تحديث
              </Button>
            </div>

            <div className="space-y-3">
              {verifiedReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-zinc-600">لا توجد بلاغات موثّقة بعد</p>
                    <p className="mt-1 text-sm text-zinc-500">كن أول من يرسل بلاغاً مساعداً</p>
                  </CardContent>
                </Card>
              ) : (
                verifiedReports.map((r) => (
                  <Card key={r.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant={reportTypeBadge[r.type] || "default"}>
                          {reportTypeLabelsAr[r.type] ?? r.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{r.titleAr}</CardTitle>
                      {r.descriptionAr && (
                        <CardDescription className="mt-2">{r.descriptionAr}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
