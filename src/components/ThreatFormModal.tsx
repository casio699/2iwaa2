"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LocationInput } from "@/components/ui/LocationInput";

interface ThreatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ThreatFormModal({ isOpen, onClose, onSuccess }: ThreatFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: "rocket",
    areaNameAr: "",
    governorate: "",
    descriptionAr: "",
    latitude: "",
    longitude: "",
    casualties: "",
    damageLevel: "unknown",
  });

  const handleLocationChange = (location: { latitude: number; longitude: number; address?: string }) => {
    setFormData({
      ...formData,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      areaNameAr: location.address || formData.areaNameAr,
    });
  };

  const threatTypes = [
    { key: "rocket", label: "صاروخ", icon: "🚀" },
    { key: "airstrike", label: "غارة جوية", icon: "✈️" },
    { key: "shelling", label: "قصف", icon: "💥" },
    { key: "border_clash", label: "اشتباك حدودي", icon: "⚔️" },
    { key: "drone", label: "طائرة مسيّرة", icon: "🛸" },
    { key: "naval", label: "تهديد بحري", icon: "🚢" },
    { key: "ground", label: "اشتباك بري", icon: "🪖" },
  ];

  const governorates = [
    "بيروت",
    "جبل لبنان",
    "الشمال",
    "البقاع",
    "الجنوب",
    "النبطية",
    "عكار",
    "بعلبك - الهرمل",
  ];

  const damageLevels = [
    { key: "unknown", label: "غير معروف" },
    { key: "minor", label: "طفيف" },
    { key: "moderate", label: "متوسط" },
    { key: "severe", label: "شديد" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          casualties: formData.casualties ? parseInt(formData.casualties) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setFormData({
          type: "rocket",
          areaNameAr: "",
          governorate: "",
          descriptionAr: "",
          latitude: "",
          longitude: "",
          casualties: "",
          damageLevel: "unknown",
        });
      }, 1500);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🚨 الإبلاغ عن تهديد" size="md">
      {success ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-medium text-emerald-600">تم إرسال البلاغ بنجاح!</p>
          <p className="text-sm text-zinc-500 mt-2">في انتظار التحقق من قبل المشرفين</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Alert */}
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            ⚠️ هذا النموذج للإبلاغ عن التهديدات فقط. في حال الطوارئ الفورية، اتصل بـ 112
          </div>

          {/* Threat Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">نوع التهديد</label>
            <div className="flex flex-wrap gap-2">
              {threatTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.key })}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    formData.type === type.key
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">الموقع *</label>
            <LocationInput
              value={formData.latitude && formData.longitude ? {
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                address: formData.areaNameAr
              } : undefined}
              onChange={handleLocationChange}
              placeholder="اختر موقع التهديد من الخريطة"
              showAddressInput={true}
            />
          </div>

          {/* Governorate */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">المحافظة</label>
            <select
              value={formData.governorate}
              onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">اختر المحافظة</option>
              {governorates.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">تفاصيل التهديد *</label>
            <textarea
              required
              rows={3}
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder="اشرح ما حدث بالتفصيل..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          {/* Casualties */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">عدد الإصابات (إن وجد)</label>
              <input
                type="number"
                value={formData.casualties}
                onChange={(e) => setFormData({ ...formData, casualties: e.target.value })}
                placeholder="0"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">مستوى الضرر</label>
              <select
                value={formData.damageLevel}
                onChange={(e) => setFormData({ ...formData, damageLevel: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              >
                {damageLevels.map((level) => (
                  <option key={level.key} value={level.key}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700">
              {loading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
