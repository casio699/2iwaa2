"use client";

import React, { useState } from "react";
import { 
  Send, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  ShieldCheck, 
  X,
  Info,
  ShieldCheck as ShieldCheckIcon
} from "lucide-react";

interface ReportFormProps {
  onClose: () => void;
  useLebanese: boolean;
  type: 'threat' | 'shelter' | 'damage';
}

export default function ReportForm({ onClose, useLebanese, type }: ReportFormProps) {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'threat' ? 'bg-red-100 text-red-600' : type === 'shelter' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {type === 'threat' ? (useLebanese ? "خبرنا شو عم بيصير" : "تبليغ عن تهديد") : 
               type === 'shelter' ? (useLebanese ? "تحديث وضع الملجأ" : "تحديث حالة الملجأ") : 
               (useLebanese ? "تبليغ عن أضرار" : "تبليغ عن أضرار")}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-blue-100">
          <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
            {useLebanese ? "بلاغك رح يروح لعند المشرفين ليتأكدوا منه قبل ما ينزل عالمنصة. خليك دقيق بمكانك." : "سيتم مراجعة بلاغك من قبل المشرفين قبل نشره للجميع لضمان الدقة."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              {useLebanese ? "شو التفاصيل؟" : "تفاصيل البلاغ"}
            </label>
            <textarea 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-red-500 outline-none min-h-[100px] transition-all"
              placeholder={useLebanese ? "اكتب شو شفت أو سمعت..." : "اكتب تفاصيل ما حدث..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              {useLebanese ? "وين بالظبط؟" : "الموقع بالتفصيل"}
            </label>
            <div className="relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-12 text-sm font-bold focus:border-red-500 outline-none transition-all"
                placeholder={useLebanese ? "المنطقة، الشارع، أو معلم قريب..." : "المنطقة، الشارع، أو علامة مميزة..."}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button type="button" className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl text-xs font-black active:bg-slate-200 transition-all">
              <Camera className="w-4 h-4" />
              {useLebanese ? "صورة" : "إرفاق صورة"}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 ${
                isSubmitting 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                  {useLebanese ? "بعت التقرير" : "إرسال البلاغ"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
