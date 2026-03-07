"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  MapPin, 
  AlertTriangle, 
  Newspaper, 
  PhoneCall, 
  Heart, 
  TrendingUp, 
  Hotel,
  Activity,
  Settings as SettingsIcon,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types for services
interface Service {
  id: string;
  title: string;
  titleLb: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const services: Service[] = [
  { id: "shelters", title: "الملاجئ الرسمية", titleLb: "مراكز الإيواء", icon: <Home className="w-8 h-8" />, color: "bg-red-500", href: "/shelters" },
  { id: "housing", title: "سكن خاص", titleLb: "بيوت للإيجار أو ببلاش", icon: <MapPin className="w-8 h-8" />, color: "bg-blue-500", href: "/housing" },
  { id: "hotels", title: "فنادق وأوتيلات", titleLb: "أوتيلات متوفرة", icon: <Hotel className="w-8 h-8" />, color: "bg-indigo-500", href: "/hotels" },
  { id: "alerts", title: "تنبيهات أمنية", titleLb: "شو عم بيصير؟", icon: <AlertTriangle className="w-8 h-8" />, color: "bg-orange-500", href: "/alerts" },
  { id: "news", title: "أخبار المنصة", titleLb: "آخر الأخبار", icon: <Newspaper className="w-8 h-8" />, color: "bg-slate-700", href: "/news" },
  { id: "help", title: "مساعدة وتبرع", titleLb: "بدي ساعد", icon: <Heart className="w-8 h-8" />, color: "bg-emerald-500", href: "/help" },
  { id: "finance", title: "معلومات مالية", titleLb: "صرف الدولار والذهب", icon: <TrendingUp className="w-8 h-8" />, color: "bg-amber-500", href: "/finance" },
  { id: "hospitals", title: "طوارئ ومستشفيات", titleLb: "صحة وطوارئ", icon: <Activity className="w-8 h-8" />, color: "bg-rose-600", href: "/hospitals" },
  { id: "hotlines", title: "أرقام الطوارئ", titleLb: "تلفونات مهمة", icon: <PhoneCall className="w-8 h-8" />, color: "bg-cyan-600", href: "/hotlines" },
  { id: "guide", title: "دليل الاستخدام", titleLb: "كيف بتستخدمها؟", icon: <BookOpen className="w-8 h-8" />, color: "bg-slate-500", href: "/guide" },
];

export default function HomeView() {
  const [useLebanese, setUseLebanese] = useState(false);

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full pb-20">
      {/* Header */}
      <header className="p-4 bg-white border-b sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">2</div>
          <div>
            <h1 className="font-bold text-lg leading-none">2iwa2 - منصة إيواء</h1>
            <p className="text-xs text-slate-500">منصة دعم النازحين في لبنان</p>
          </div>
        </div>
        <button 
          onClick={() => setUseLebanese(!useLebanese)}
          className="text-xs px-2 py-1 bg-red-50 rounded-full border border-red-100 font-black text-red-600 uppercase"
        >
          {useLebanese ? "AR" : "LB"}
        </button>
      </header>

      {/* Real-time Alert Banner */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        className="bg-red-50 p-3 flex items-center gap-3 border-b border-red-100 overflow-hidden"
      >
        <div className="bg-red-100 p-1.5 rounded-full animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-red-900 truncate">
            {useLebanese ? "في غارات بالجنوب والضاحية حالياً" : "تنبيه: غارات جوية مكثفة في الجنوب والضاحية الآن"}
          </p>
          <p className="text-[10px] text-red-700">منذ دقيقتين - يرجى الحذر</p>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {services.map((service, index) => (
          <motion.a 
            key={service.id}
            href={service.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-colors duration-75"
          >
            <div className={`${service.color} p-3 rounded-2xl text-white mb-3 shadow-md`}>
              {service.icon}
            </div>
            <span className="text-sm font-bold text-slate-800 text-center">
              {useLebanese ? service.titleLb : service.title}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Financial Quick Info */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mx-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center mb-6"
      >
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">الدولار</p>
          <p className="font-black text-slate-900">89,500</p>
        </div>
        <div className="h-8 w-[1px] bg-slate-100"></div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">البنزين (95)</p>
          <p className="font-black text-slate-900">1,640,000</p>
        </div>
        <div className="h-8 w-[1px] bg-slate-100"></div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">الذهب (24ق)</p>
          <p className="font-black text-slate-900">$2,145</p>
        </div>
      </div>

      {/* Footer / Powered By */}
      <footer className="mt-auto p-8 text-center">
        <p className="text-xs text-slate-400">بكل حب من KiTS للبرمجيات</p>
        <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">Built for Lebanon 🇱🇧</p>
      </footer>

      {/* Navigation Tab Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-6 py-3 flex justify-between items-center z-50">
        <a href="/" className="text-red-600 flex flex-col items-center">
          <Home className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">الرئيسية</span>
        </a>
        <a href="/map" className="text-slate-400 flex flex-col items-center">
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">الخريطة</span>
        </a>
        <a href="/alerts" className="text-slate-400 flex flex-col items-center relative">
          <AlertTriangle className="w-6 h-6" />
          <span className="absolute top-0 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[10px] mt-1 font-bold">تنبيهات</span>
        </a>
        <a href="/news" className="text-slate-400 flex flex-col items-center">
          <Newspaper className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">أخبار</span>
        </a>
        <a href="/settings" className="text-slate-400 flex flex-col items-center">
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">إعدادات</span>
        </a>
      </nav>
    </main>
  );
}
