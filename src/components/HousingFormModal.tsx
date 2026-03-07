"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface HousingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function HousingFormModal({ isOpen, onClose, onSuccess }: HousingFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: "free",
    price: "",
    currency: "USD",
    capacity: "",
    amenities: [] as string[],
    hostName: "",
    hostPhone: "",
    hostWhatsApp: "",
    hostType: "civilian",
    latitude: "",
    longitude: "",
    addressAr: "",
    governorateAr: "",
  });

  const amenityOptions = [
    { key: "electricity", label: "كهرباء", icon: "⚡" },
    { key: "water", label: "ماء", icon: "💧" },
    { key: "hot_water", label: "ماء ساخن", icon: "🚿" },
    { key: "internet", label: "انترنت", icon: "📶" },
    { key: "heating", label: "تدفئة", icon: "🔥" },
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

  function toggleAmenity(amenity: string) {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/housing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          capacity: parseInt(formData.capacity),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setFormData({
          type: "free",
          price: "",
          currency: "USD",
          capacity: "",
          amenities: [],
          hostName: "",
          hostPhone: "",
          hostWhatsApp: "",
          hostType: "civilian",
          latitude: "",
          longitude: "",
          addressAr: "",
          governorateAr: "",
        });
      }, 1500);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="عرض سكن للإيواء" size="lg">
      {success ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-medium text-emerald-600">تم إضافة العرض بنجاح!</p>
          <p className="text-sm text-zinc-500 mt-2">في انتظار التحقق من قبل المشرفين</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">نوع العرض</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="free">🏠 مجاني</option>
              <option value="rent">🔑 للإيجار</option>
              <option value="hotel">🏨 فندق</option>
            </select>
          </div>

          {/* Price (if rent) */}
          {formData.type === "rent" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">السعر</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="100"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">العملة</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                >
                  <option value="USD">USD</option>
                  <option value="LBP">LBP</option>
                </select>
              </div>
            </div>
          )}

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">السعة (عدد الأشخاص) *</label>
            <input
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="4"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">المرافق المتاحة</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity.key}
                  type="button"
                  onClick={() => toggleAmenity(amenity.key)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    formData.amenities.includes(amenity.key)
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {amenity.icon} {amenity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">خط العرض *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="33.8938"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">خط الطول *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="35.5018"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">المحافظة</label>
            <select
              value={formData.governorateAr}
              onChange={(e) => setFormData({ ...formData, governorateAr: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">اختر المحافظة</option>
              {governorates.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">العنوان التفصيلي</label>
            <input
              type="text"
              value={formData.addressAr}
              onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
              placeholder="شارع، منطقة، علامة مميزة"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          {/* Contact */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-zinc-900 mb-3">معلومات التواصل</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">اسم المضيف *</label>
                <input
                  type="text"
                  required
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">نوع المضيف</label>
                <select
                  value={formData.hostType}
                  onChange={(e) => setFormData({ ...formData, hostType: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                >
                  <option value="civilian">مواطن</option>
                  <option value="ngo">جمعية/NGO</option>
                  <option value="municipality">بلدية</option>
                  <option value="hotel">فندق</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={formData.hostPhone}
                  onChange={(e) => setFormData({ ...formData, hostPhone: e.target.value })}
                  placeholder="96131234567+"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">واتساب (اختياري)</label>
                <input
                  type="tel"
                  value={formData.hostWhatsApp}
                  onChange={(e) => setFormData({ ...formData, hostWhatsApp: e.target.value })}
                  placeholder="96131234567+"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جارٍ الحفظ..." : "نشر العرض"}
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
