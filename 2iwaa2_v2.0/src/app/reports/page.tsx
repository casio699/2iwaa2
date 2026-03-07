"use client";

import { useEffect, useState } from "react";

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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">بلاغات مباشرة</h1>
        <p className="mt-2 text-zinc-700">
          أرسل بلاغاً لمساعدة الناس. سيتم مراجعته قبل نشره.
        </p>

        <div className="mt-6 grid gap-3 rounded-lg border bg-white p-4">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">نوع البلاغ</span>
            <select
              className="rounded-md border px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="general">عام</option>
              <option value="shelter_status">حالة مركز إيواء</option>
              <option value="threat">تهديد</option>
              <option value="damage">أضرار</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">العنوان</span>
            <input
              className="rounded-md border px-3 py-2"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="مثال: مركز الإيواء ممتلئ"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">تفاصيل (اختياري)</span>
            <textarea
              className="min-h-28 rounded-md border px-3 py-2"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="اكتب التفاصيل التي تساعد على التحقق (وقت/مكان/معلومات إضافية)"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">رابط دليل (اختياري)</span>
            <input
              className="rounded-md border px-3 py-2"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <button
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            onClick={() => submit()}
            disabled={loading || titleAr.trim().length < 3}
          >
            {loading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
          </button>

          {message ? <div className="text-sm text-zinc-700">{message}</div> : null}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">بلاغات موثّقة (منشورة)</h2>
          <button
            className="rounded-md border bg-white px-3 py-1 text-sm hover:bg-zinc-50"
            onClick={() => loadVerified().catch((e) => alert(String(e)))}
          >
            تحديث
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {verifiedReports.length === 0 ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-zinc-600">
              لا توجد بلاغات موثّقة بعد.
            </div>
          ) : (
            verifiedReports.map((r) => (
              <div key={r.id} className="rounded-lg border bg-white p-4">
                <div className="text-sm text-zinc-600">
                  {reportTypeLabelsAr[r.type] ?? r.type}
                </div>
                <div className="mt-1 font-semibold">{r.titleAr}</div>
                {r.descriptionAr ? (
                  <div className="mt-2 text-sm text-zinc-800">{r.descriptionAr}</div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
