"use client";

import React, { useState, useEffect } from "react";
import { 
  PhoneCall, 
  Ambulance, 
  Flame, 
  HeartHandshake, 
  Search,
  ExternalLink,
  ShieldCheck as ShieldCheckIcon,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import Skeleton from "@/components/Skeleton";

interface Hotline {
  id: string;
  name: string;
  nameLb: string;
  number: string;
  category: 'security' | 'medical' | 'fire' | 'social';
  icon: React.ReactNode;
  color: string;
}

const mockHotlines: Hotline[] = [
  { 
    id: "1", 
    name: "الصليب الأحمر اللبناني", 
    nameLb: "الصليب الأحمر", 
    number: "140", 
    category: 'medical', 
    icon: <Ambulance className="w-6 h-6" />, 
    color: "bg-red-600" 
  },
  { 
    id: "2", 
    name: "الدفاع المدني", 
    nameLb: "الدفاع المدني", 
    number: "125", 
    category: 'fire', 
    icon: <Flame className="w-6 h-6" />, 
    color: "bg-orange-600" 
  },
  { 
    id: "3", 
    name: "قوى الأمن الداخلي", 
    nameLb: "الدرك (قوى الأمن)", 
    number: "112", 
    category: 'security', 
    icon: <ShieldCheckIcon className="w-6 h-6" />, 
    color: "bg-blue-600" 
  },
  { 
    id: "4", 
    name: "الجيش اللبناني", 
    nameLb: "الجيش", 
    number: "1701", 
    category: 'security', 
    icon: <ShieldCheckIcon className="w-6 h-6" />, 
    color: "bg-emerald-700" 
  },
  { 
    id: "5", 
    name: "وزارة الشؤون الاجتماعية", 
    nameLb: "الشؤون الاجتماعية", 
    number: "01-381234", 
    category: 'social', 
    icon: <HeartHandshake className="w-6 h-6" />, 
    color: "bg-indigo-600" 
  },
];

export default function HotlinesPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredHotlines = mockHotlines.filter(h => 
    h.name.includes(searchTerm) || h.number.includes(searchTerm)
  );

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "تلفونات مهمة" : "أرقام الطوارئ"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-cyan-50 rounded-full border border-cyan-100 font-black text-cyan-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={useLebanese ? "فتش ع رقم أو خدمة..." : "ابحث عن رقم أو خدمة..."}
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pr-10 pl-4 text-sm font-black focus:ring-2 focus:ring-cyan-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="w-12 h-12 rounded-2xl" />
            </div>
          ))
        ) : (
          filteredHotlines.map(hotline => (
            <a 
              key={hotline.id} 
              href={`tel:${hotline.number}`}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group"
            >
              <div className="flex items-center gap-4">
                <div className={`${hotline.color} p-4 rounded-2xl text-white shadow-lg`}>
                  {hotline.icon}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 mb-1 leading-tight">
                    {useLebanese ? hotline.nameLb : hotline.name}
                  </h3>
                  <span className="font-black text-2xl text-slate-400 group-hover:text-cyan-600 transition-colors">{hotline.number}</span>
                </div>
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl group-active:bg-cyan-100 transition-colors">
                <PhoneCall className="w-6 h-6 text-slate-400 group-hover:text-cyan-600" />
              </div>
            </a>
          ))
        )}

        <div className="mt-8 p-6 bg-red-50 rounded-3xl text-center border-2 border-dashed border-red-100">
          <p className="text-xs text-red-600 font-black uppercase tracking-widest mb-2 italic">تنبيه هام</p>
          <p className="text-[10px] text-red-500 font-medium leading-relaxed">
            {useLebanese ? "استخدم هالارقام بس وقت الضرورة والطارئ الحقيقي كرمال ما نعطل شغل فرق الإنقاذ." : "يرجى استخدام هذه الأرقام في حالات الطوارئ القصوى فقط لضمان سرعة الاستجابة."}
          </p>
        </div>
      </div>
    </main>
  );
}
