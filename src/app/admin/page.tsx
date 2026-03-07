"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AdminStats } from "@/components/AdminStats";
import { DataExport } from "@/components/DataExport";

function isReportStatus(v: string): v is "pending" | "verified" | "rejected" | "archived" {
  return v === "pending" || v === "verified" || v === "rejected" || v === "archived";
}

function isShelterType(
  v: string
): v is "government" | "ngo" | "municipality" | "civilian" | "hotel" {
  return (
    v === "government" || v === "ngo" || v === "municipality" || v === "civilian" || v === "hotel"
  );
}

function isAlertSeverity(v: string): v is "urgent" | "warning" | "info" {
  return v === "urgent" || v === "warning" || v === "info";
}

type Report = {
  id: string;
  type: string;
  titleAr: string;
  descriptionAr?: string | null;
  reviewStatus: string;
  createdAt: string;
};

type AlertItem = {
  id: string;
  titleAr: string;
  bodyAr: string;
  severity: string;
  reviewStatus: string;
  createdAt: string;
  publishedAt?: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"pending" | "verified" | "rejected" | "archived">(
    "pending"
  );
  const [reports, setReports] = useState<Report[]>([]);
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${password}` }), [password]);

  const [shelterType, setShelterType] = useState<
    "government" | "ngo" | "municipality" | "civilian" | "hotel"
  >("government");
  const [shelterNameAr, setShelterNameAr] = useState("");
  const [shelterLat, setShelterLat] = useState("");
  const [shelterLng, setShelterLng] = useState("");
  const [shelterCapacityTotal, setShelterCapacityTotal] = useState("");
  const [shelterCapacityUsed, setShelterCapacityUsed] = useState("");
  const [shelterStatusTextAr, setShelterStatusTextAr] = useState("");
  const [shelterSourceUrl, setShelterSourceUrl] = useState("");
  const [shelterCreateMsg, setShelterCreateMsg] = useState<string | null>(null);

  const [alertTitleAr, setAlertTitleAr] = useState("");
  const [alertBodyAr, setAlertBodyAr] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"urgent" | "warning" | "info">("warning");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsMsg, setAlertsMsg] = useState<string | null>(null);

  async function loadReports() {
    const res = await fetch(`/api/admin/reports?status=${status}`, {
      headers: authHeader,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Failed");
    setReports(json.reports);
  }

  async function verify(id: string) {
    const res = await fetch(`/api/admin/reports/${id}/verify`, {
      method: "POST",
      headers: authHeader,
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error ?? "Failed");
    }
    await loadReports();
  }

  const loadAlerts = useCallback(async () => {
    const res = await fetch("/api/admin/alerts?status=pending", {
      headers: authHeader,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Failed");
    setAlerts(json.alerts ?? []);
  }, [authHeader]);

  async function createAlert() {
    setAlertsMsg(null);

    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        titleAr: alertTitleAr,
        bodyAr: alertBodyAr,
        severity: alertSeverity,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAlertsMsg(`خطأ: ${json?.error ?? "فشل إنشاء التنبيه"}`);
      return;
    }

    setAlertTitleAr("");
    setAlertBodyAr("");
    if (password) setAlertsMsg("تم إنشاء التنبيه. (قيد المراجعة/النشر)");

    await loadAlerts();
  }

  async function publishAlert(id: string) {
    setAlertsMsg(null);
    const res = await fetch(`/api/admin/alerts/${id}/publish`, {
      method: "POST",
      headers: authHeader,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAlertsMsg(`خطأ: ${json?.error ?? "فشل نشر التنبيه"}`);
      return;
    }

    if (json?.telegram?.skipped) {
      setAlertsMsg("تم نشر التنبيه. (Telegram غير مُعدّ بعد)");
    } else {
      setAlertsMsg("تم نشر التنبيه");
    }

    await loadAlerts();
  }

  useEffect(() => {
    loadAlerts().catch(() => {
      // ignore
    });
  }, [loadAlerts]);

  async function createShelter() {
    setShelterCreateMsg(null);

    const latitude = Number(shelterLat);
    const longitude = Number(shelterLng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setShelterCreateMsg("خطأ: يرجى إدخال خط عرض/خط طول صحيحين");
      return;
    }

    const capacityTotal = shelterCapacityTotal ? Number(shelterCapacityTotal) : undefined;
    const capacityUsed = shelterCapacityUsed ? Number(shelterCapacityUsed) : undefined;

    const res = await fetch("/api/admin/shelters", {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({
        type: shelterType,
        nameAr: shelterNameAr,
        latitude,
        longitude,
        capacityTotal: Number.isFinite(capacityTotal) ? capacityTotal : undefined,
        capacityUsed: Number.isFinite(capacityUsed) ? capacityUsed : undefined,
        statusTextAr: shelterStatusTextAr || undefined,
        sourceName: "يدوي (MVP)",
        sourceUrl: shelterSourceUrl || undefined,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setShelterCreateMsg(`خطأ: ${json?.error ?? "فشل إنشاء المركز"}`);
      return;
    }

    setShelterNameAr("");
    setShelterLat("");
    setShelterLng("");
    setShelterCapacityTotal("");
    setShelterCapacityUsed("");
    setShelterStatusTextAr("");
    setShelterSourceUrl("");
    setShelterCreateMsg("تم إنشاء مركز الإيواء بنجاح");
  }

  async function reject(id: string) {
    const res = await fetch(`/api/admin/reports/${id}/reject`, {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ note: "" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error ?? "Failed");
    }
    await loadReports();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">لوحة الإدارة</h1>
          <p className="mt-2 text-zinc-600">إدارة البلاغات، مراكز الإيواء، والتنبيهات.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar - Auth & Quick Actions */}
          <div className="space-y-6">
            <AdminStats />
            
            <DataExport />

            <Card>
              <CardHeader>
                <CardTitle>تسجيل الدخول</CardTitle>
                <CardDescription>أدخل كلمة مرور الإدارة للوصول</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="كلمة المرور"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ADMIN_PASSWORD"
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">الحالة</label>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    value={status}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isReportStatus(v)) setStatus(v);
                    }}
                  >
                    <option value="pending">قيد المراجعة</option>
                    <option value="verified">موثّق</option>
                    <option value="rejected">مرفوض</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => loadReports().catch((e) => alert(String(e)))}
                >
                  تحميل البلاغات
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

        <div className="mt-6 rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">إضافة مركز إيواء</h2>
          <p className="mt-1 text-sm text-zinc-600">
            إدخال يدوي سريع (MVP). لاحقاً: استيراد CSV + مصادر رسمية.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">النوع</span>
              <select
                className="rounded-md border px-3 py-2"
                value={shelterType}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isShelterType(v)) setShelterType(v);
                }}
              >
                <option value="government">رسمي</option>
                <option value="ngo">جمعية / NGO</option>
                <option value="municipality">بلدية</option>
                <option value="civilian">مواطن</option>
                <option value="hotel">فندق</option>
              </select>
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-zinc-600">الاسم</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterNameAr}
                onChange={(e) => setShelterNameAr(e.target.value)}
                placeholder="مثال: مدرسة رسمية - ..."
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">خط العرض (Latitude)</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterLat}
                onChange={(e) => setShelterLat(e.target.value)}
                placeholder="33.8938"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">خط الطول (Longitude)</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterLng}
                onChange={(e) => setShelterLng(e.target.value)}
                placeholder="35.5018"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">السعة الإجمالية (اختياري)</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterCapacityTotal}
                onChange={(e) => setShelterCapacityTotal(e.target.value)}
                placeholder="350"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">المشغول (اختياري)</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterCapacityUsed}
                onChange={(e) => setShelterCapacityUsed(e.target.value)}
                placeholder="150"
              />
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-zinc-600">الحالة (اختياري)</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterStatusTextAr}
                onChange={(e) => setShelterStatusTextAr(e.target.value)}
                placeholder="مثال: متاح جزئياً"
              />
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-zinc-600">رابط المصدر (اختياري)</span>
              <input
                className="rounded-md border px-3 py-2"
                value={shelterSourceUrl}
                onChange={(e) => setShelterSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={() => createShelter().catch((e) => setShelterCreateMsg(String(e)))}
              disabled={
                !password ||
                shelterNameAr.trim().length < 2 ||
                shelterLat.trim().length === 0 ||
                shelterLng.trim().length === 0
              }
            >
              إنشاء
            </button>

            {shelterCreateMsg ? (
              <div className="text-sm text-zinc-700">{shelterCreateMsg}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">تنبيهات الخطر</h2>
              <p className="mt-1 text-sm text-zinc-600">
                (MVP) إنشاء تنبيه ثم نشره. إرسال Telegram سيتم تخطيه إذا لم يتم إعداد التوكن.
              </p>
            </div>
            <button
              className="rounded-md border bg-white px-3 py-1 text-sm hover:bg-zinc-50"
              onClick={() => loadAlerts().catch((e) => setAlertsMsg(String(e)))}
            >
              تحديث
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">مستوى التنبيه</span>
              <select
                className="rounded-md border px-3 py-2"
                value={alertSeverity}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isAlertSeverity(v)) setAlertSeverity(v);
                }}
              >
                <option value="urgent">عاجل</option>
                <option value="warning">تحذير</option>
                <option value="info">معلومة</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">عنوان التنبيه</span>
              <input
                className="rounded-md border px-3 py-2"
                value={alertTitleAr}
                onChange={(e) => setAlertTitleAr(e.target.value)}
                placeholder="مثال: تهديد على منطقة ..."
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-zinc-600">نص التنبيه</span>
              <textarea
                className="min-h-28 rounded-md border px-3 py-2"
                value={alertBodyAr}
                onChange={(e) => setAlertBodyAr(e.target.value)}
                placeholder="ماذا حدث؟ ماذا يجب أن يفعل الناس الآن؟"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
                onClick={() => createAlert().catch((e) => setAlertsMsg(String(e)))}
                disabled={alertTitleAr.trim().length < 3 || alertBodyAr.trim().length < 3}
              >
                إنشاء تنبيه
              </button>
              {alertsMsg ? <div className="text-sm text-zinc-700">{alertsMsg}</div> : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {alerts.length === 0 ? (
              <div className="rounded-lg border bg-zinc-50 p-4 text-sm text-zinc-600">
                لا توجد تنبيهات قيد المراجعة حالياً.
              </div>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-zinc-600">{a.severity}</div>
                      <div className="mt-1 font-semibold">{a.titleAr}</div>
                      <div className="mt-2 text-sm text-zinc-800">{a.bodyAr}</div>
                    </div>

                    <div className="grid gap-2">
                      <button
                        className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-50 disabled:opacity-50"
                        onClick={() => publishAlert(a.id).then(() => loadAlerts())}
                        disabled={!password}
                      >
                        نشر
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.titleAr}</div>
                  <div className="mt-1 text-sm text-zinc-600">{r.type}</div>
                  {r.descriptionAr ? (
                    <div className="mt-3 text-sm text-zinc-800">{r.descriptionAr}</div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <button
                    className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-50"
                    onClick={() => verify(r.id).catch((e) => alert(String(e)))}
                  >
                    توثيق
                  </button>
                  <button
                    className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-50"
                    onClick={() => reject(r.id).catch((e) => alert(String(e)))}
                  >
                    رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  </div>
  );
}
