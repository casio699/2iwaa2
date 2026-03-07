"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const LEBANESE_GOVERNORATES = [
  "بيروت",
  "جبل لبنان",
  "الشمال",
  "البقاع",
  "الجنوب",
  "النبطية",
  "عكار",
  "بعلبك - الهرمل",
  "الجنوبية",
  "كسروان - جبيل",
];

const ALERT_TYPES = [
  { key: "urgent", label: "عاجل", icon: "🚨" },
  { key: "warning", label: "تحذير", icon: "⚠️" },
  { key: "info", label: "معلومة", icon: "ℹ️" },
];

export default function SubscriptionsPage() {
  const [fingerprint, setFingerprint] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["urgent", "warning"]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Generate or retrieve fingerprint on mount
  useEffect(() => {
    let fp = localStorage.getItem("2iwaa2-fingerprint");
    if (!fp) {
      fp = "fp_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("2iwaa2-fingerprint", fp);
    }
    setFingerprint(fp);
    loadSubscription(fp);
  }, []);

  async function loadSubscription(fp: string) {
    try {
      const res = await fetch(`/api/subscriptions?fingerprint=${fp}`);
      const json = await res.json();
      if (json.subscription) {
        setSelectedAreas(json.subscription.areas || []);
        setSelectedTypes(json.subscription.alertTypes || ["urgent", "warning"]);
        setSmsEnabled(json.subscription.smsEnabled || false);
        if (json.subscription.phoneNumber) {
          setPhoneNumber(json.subscription.phoneNumber);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveSubscription() {
    if (!fingerprint) return;
    
    setLoading(true);
    setSaved(false);
    
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint,
          areas: selectedAreas,
          alertTypes: selectedTypes,
          categories: ["all"],
          phoneNumber: phoneNumber || null,
          smsEnabled,
        }),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">إدارة التنبيهات</h1>
          <p className="mt-2 text-zinc-600">
            اختر المناطق وأنواع التنبيهات التي تريد متابعتها
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 rounded-lg bg-emerald-100 p-4 text-emerald-800">
            ✅ تم حفظ الإعدادات بنجاح
          </div>
        )}

        {/* Areas Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>المناطق المتابعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LEBANESE_GOVERNORATES.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedAreas.includes(area)
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {selectedAreas.includes(area) ? "✓ " : ""}
                  {area}
                </button>
              ))}
            </div>
            {selectedAreas.length === 0 && (
              <p className="mt-4 text-sm text-amber-600">
                ⚠️ ستحصل على تنبيهات من جميع المناطق إذا لم تختر منطقة محددة
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alert Types */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>أنواع التنبيهات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALERT_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => toggleType(type.key)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTypes.includes(type.key)
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إشعارات SMS (قريباً)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="sms"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="sms" className="text-sm">
                تفعيل إشعارات الرسائل النصية (SMS)
              </label>
            </div>
            {smsEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-700">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="مثال: 96131234567+"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  أدخل الرقم مع رمز الدولة (مثال: 96131234567+)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={saveSubscription}
            disabled={loading}
            className="px-8"
          >
            {loading ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">📝 ملاحظات:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>ستصلك التنبيهات على هذا الجهاز مباشرة</li>
            <li>يمكنك تثبيت التطبيق على الشاشة الرئيسية للحصول على إشعارات فورية</li>
            <li>لا نشارك بياناتك مع أي طرف ثالث</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
