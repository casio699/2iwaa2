"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingDown, 
  DollarSign, 
  Fuel, 
  CircleDollarSign, 
  History,
  Info,
  TrendingUp as TrendingUpIcon,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import Skeleton from "@/components/Skeleton";

interface FinancialItem {
  id: string;
  label: string;
  labelLb: string;
  value: string;
  change: string;
  isUp: boolean;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const mockFinance: FinancialItem[] = [
  { 
    id: "1", 
    label: "سعر صرف الدولار", 
    labelLb: "صرف الدولار بالسوق", 
    value: "89,500", 
    change: "+500", 
    isUp: true, 
    unit: "ل.ل", 
    icon: <DollarSign className="w-6 h-6" />, 
    color: "bg-emerald-500" 
  },
  { 
    id: "2", 
    label: "بنزين 95 أوكتان", 
    labelLb: "تنكة البنزين (95)", 
    value: "1,640,000", 
    change: "-12,000", 
    isUp: false, 
    unit: "ل.ل", 
    icon: <Fuel className="w-6 h-6" />, 
    color: "bg-amber-500" 
  },
  { 
    id: "3", 
    label: "سعر غرام الذهب (24)", 
    labelLb: "غرام الذهب (24)", 
    value: "72.45", 
    change: "+0.15", 
    isUp: true, 
    unit: "$", 
    icon: <CircleDollarSign className="w-6 h-6" />, 
    color: "bg-yellow-500" 
  },
  { 
    id: "4", 
    label: "برميل النفط العالمي", 
    labelLb: "سعر النفط العالمي", 
    value: "82.34", 
    change: "-1.20", 
    isUp: false, 
    unit: "$", 
    icon: <History className="w-6 h-6" />, 
    color: "bg-slate-700" 
  },
  { 
    id: "5", 
    label: "مؤشر البورصة", 
    labelLb: "مؤشر بيروت", 
    value: "5,137", 
    change: "+12.4", 
    isUp: true, 
    unit: "نقطة", 
    icon: <TrendingUpIcon className="w-6 h-6" />, 
    color: "bg-indigo-600" 
  },
  { 
    id: "6", 
    label: "بيتكوين (BTC)", 
    labelLb: "سعر البيتكوين", 
    value: "67,430", 
    change: "+1,200", 
    isUp: true, 
    unit: "$", 
    icon: <CircleDollarSign className="w-6 h-6" />, 
    color: "bg-orange-400" 
  },
];

export default function FinancePage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "أخبار المصاري" : "المعلومات المالية"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-amber-50 rounded-full border border-amber-100 font-black text-amber-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>
        
        <div className="p-4 bg-amber-600 rounded-2xl text-white shadow-xl flex items-center gap-4">
          <Info className="w-10 h-10 opacity-50" />
          <div>
            <h2 className="font-black text-lg">{useLebanese ? "معلومة مهمة" : "تنبيه مالي"}</h2>
            <p className="text-[10px] opacity-90 font-medium">
              {useLebanese ? "الأسعار عم تتغير بسرعة حسب السوق السوداء، الأفضل تتأكد قبل ما تصرف." : "الأسعار متغيرة باستمرار حسب تقلبات السوق الموازية."}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
          ))
        ) : (
          mockFinance.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`${item.color} p-4 rounded-2xl text-white shadow-lg`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-500 uppercase tracking-widest mb-1">
                    {useLebanese ? item.labelLb : item.label}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-2xl text-slate-900">{item.value}</span>
                    <span className="font-black text-xs text-slate-400">{item.unit}</span>
                  </div>
                </div>
              </div>
              <div className={`flex flex-col items-end ${item.isUp ? "text-emerald-500" : "text-red-500"}`}>
                {item.isUp ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                <span className="font-black text-[10px] mt-1">{item.change}</span>
              </div>
            </div>
          ))
        )}

        <div className="mt-8 p-6 bg-slate-100 rounded-3xl text-center border-2 border-dashed border-slate-200">
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">مصدر البيانات</p>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
            {useLebanese ? "عم نجمع هالأرقام من أكتر من موقع (ليرة ريت، جدول المحروقات الرسمي، وأسعار الذهب العالمية)." : "يتم تجميع البيانات من مصادر متعددة تشمل أسواق الصرف الموازية والمواقع الرسمية."}
          </p>
        </div>
      </div>
    </main>
  );
}
