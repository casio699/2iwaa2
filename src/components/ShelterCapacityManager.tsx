"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface CapacityManagerProps {
  shelterId: string;
  shelterName: string;
  currentCapacity: number;
  maxCapacity: number;
}

export function ShelterCapacityManager({ 
  shelterId, 
  shelterName, 
  currentCapacity, 
  maxCapacity 
}: CapacityManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCurrent, setNewCurrent] = useState(currentCapacity);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function updateCapacity() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shelters/${shelterId}/capacity`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin-password") || ""}`
        },
        body: JSON.stringify({
          currentCapacity: newCurrent,
          maxCapacity: maxCapacity,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 1500);
      }
    } catch (e) {
      console.error("Failed to update capacity:", e);
    } finally {
      setLoading(false);
    }
  }

  const percentFull = Math.round((currentCapacity / maxCapacity) * 100);
  const statusColor = percentFull >= 90 ? "bg-red-500" : percentFull >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-zinc-500 hover:text-indigo-600 underline"
      >
        تحديث السعة
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="تحديث سعة المركز" size="sm">
        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-medium text-emerald-600">تم تحديث السعة بنجاح!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-medium text-zinc-900">{shelterName}</h3>
            </div>

            {/* Current Status */}
            <Card>
              <CardContent className="py-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-600">السعة الحالية</span>
                  <span className="font-medium">{currentCapacity} / {maxCapacity}</span>
                </div>
                <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${statusColor} transition-all duration-300`}
                    style={{ width: `${percentFull}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  {percentFull >= 90 ? "⚠️ السعة شبه ممتلئة" : 
                   percentFull >= 70 ? "⚡ السعة متوسطة" : 
                   "✅ السعة متاحة"}
                </p>
              </CardContent>
            </Card>

            {/* Update Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  العدد الحالي للنازحين
                </label>
                <input
                  type="number"
                  value={newCurrent}
                  onChange={(e) => setNewCurrent(parseInt(e.target.value) || 0)}
                  min={0}
                  max={maxCapacity}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  السعة القصوى
                </label>
                <input
                  type="number"
                  value={maxCapacity}
                  disabled
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 bg-zinc-100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={updateCapacity} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "جارٍ التحديث..." : "حفظ التغييرات"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
