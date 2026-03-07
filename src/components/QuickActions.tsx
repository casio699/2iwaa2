"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HousingFormModal } from "./HousingFormModal";
import { HelpFormModal } from "./HelpFormModal";
import { ThreatFormModal } from "./ThreatFormModal";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"housing" | "help" | "threat" | null>(null);
  const router = useRouter();

  const actions = [
    {
      key: "housing",
      label: "عرض سكن",
      icon: "🏠",
      color: "bg-blue-500",
      onClick: () => setActiveModal("housing"),
    },
    {
      key: "help",
      label: "طلب مساعدة",
      icon: "🆘",
      color: "bg-red-500",
      onClick: () => setActiveModal("help"),
    },
    {
      key: "threat",
      label: "إبلاغ عن تهديد",
      icon: "🚨",
      color: "bg-amber-500",
      onClick: () => setActiveModal("threat"),
    },
    {
      key: "shelters",
      label: "البحث عن إيواء",
      icon: "🔍",
      color: "bg-emerald-500",
      onClick: () => router.push("/shelters"),
    },
    {
      key: "hotlines",
      label: "أرقام الطوارئ",
      icon: "📞",
      color: "bg-purple-500",
      onClick: () => router.push("/hotlines"),
    },
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all duration-300 ${
              isOpen ? "bg-zinc-700 rotate-45" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            title={isOpen ? "إغلاق القائمة" : "فتح الإجراءات السريعة"}
          >
            {isOpen ? "✕" : "+"}
          </button>
          
          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-zinc-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              إجراءات سريعة
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}>
          {actions.map((action, index) => (
            <button
              key={action.key}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 pr-2 transition-all duration-300 ${
                isOpen ? "translate-x-0" : "translate-x-4"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium text-zinc-700 bg-white px-2 py-1 rounded shadow">
                {action.label}
              </span>
              <span className={`h-10 w-10 rounded-full ${action.color} flex items-center justify-center text-white shadow-lg`}>
                {action.icon}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <HousingFormModal
        isOpen={activeModal === "housing"}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          setActiveModal(null);
          router.refresh();
        }}
      />
      <HelpFormModal
        isOpen={activeModal === "help"}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          setActiveModal(null);
          router.refresh();
        }}
        defaultType="request"
      />
      <ThreatFormModal
        isOpen={activeModal === "threat"}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          setActiveModal(null);
          router.refresh();
        }}
      />
    </>
  );
}
