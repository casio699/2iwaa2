"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface HelpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultType?: "offer" | "request";
}

export function HelpFormModal({ isOpen, onClose, onSuccess, defaultType = "offer" }: HelpFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: defaultType,
    category: "shelter",
    titleAr: "",
    descriptionAr: "",
    contactName: "",
    contactPhone: "",
    contactWhatsApp: "",
    location: "",
    urgency: "normal",
  });

  const categories = [
    { key: "shelter", label: "سكن", icon: "🏠" },
    { key: "money", label: "مالي", icon: "💰" },
    { key: "food", label: "غذاء", icon: "🍞" },
    { key: "clothing", label: "ملابس", icon: "👕" },
    { key: "medical", label: "طبي", icon: "🏥" },
    { key: "utilities", label: "خدمات", icon: "⚡" },
    { key: "transport", label: "نقل", icon: "🚗" },
    { key: "volunteer", label: "تطوع", icon: "🤝" },
    { key: "other", label: "أخرى", icon: "📦" },
  ];

  const urgencyOptions = [
    { key: "low", label: "منخفض", color: "bg-zinc-100" },
    { key: "normal", label: "عادي", color: "bg-blue-100" },
    { key: "high", label: "عالي", color: "bg-orange-100" },
    { key: "urgent", label: "عاجل", color: "bg-red-100" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setFormData({
          type: defaultType,
          category: "shelter",
          titleAr: "",
          descriptionAr: "",
          contactName: "",
          contactPhone: "",
          contactWhatsApp: "",
          location: "",
          urgency: "normal",
        });
      }, 1500);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const title = formData.type === "offer" ? "عرض مساعدة" : "طلب مساعدة";
  const icon = formData.type === "offer" ? "🤝" : "🆘";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${icon} ${title}`} size="md">
      {success ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-medium text-emerald-600">
            {formData.type === "offer" ? "تم نشر عرض المساعدة!" : "تم إرسال طلب المساعدة!"}
          </p>
          <p className="text-sm text-zinc-500 mt-2">سنتواصل معك قريباً</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">نوع الطلب</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "offer" })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.type === "offer"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                🤝 عرض مساعدة
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "request" })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.type === "request"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                🆘 طلب مساعدة
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">الفئة</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.key })}
                  className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                    formData.category === cat.key
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">الأولوية</label>
            <div className="flex gap-2">
              {urgencyOptions.map((urgency) => (
                <button
                  key={urgency.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: urgency.key })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    formData.urgency === urgency.key
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : `${urgency.color} border-zinc-300 text-zinc-600 hover:bg-zinc-50`
                  }`}
                >
                  {urgency.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">العنوان *</label>
            <input
              type="text"
              required
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              placeholder={formData.type === "offer" ? "مثال: شقة متاحة للإيواء" : "مثال: بحاجة لمساعدة مالية"}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">التفاصيل *</label>
            <textarea
              required
              rows={3}
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder="اشرح تفاصيل العرض أو الطلب..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">المنطقة</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="مثال: بيروت - الضاحية الجنوبية"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          {/* Contact */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-zinc-900 mb-3">معلومات التواصل</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">الاسم</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="96131234567+"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-zinc-700 mb-1">واتساب (اختياري)</label>
              <input
                type="tel"
                value={formData.contactWhatsApp}
                onChange={(e) => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                placeholder="96131234567+"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جارٍ الحفظ..." : formData.type === "offer" ? "نشر العرض" : "إرسال الطلب"}
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
