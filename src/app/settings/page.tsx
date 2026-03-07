"use client";

import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  MapPin, 
  Shield, 
  Smartphone, 
  ChevronRight,
  Globe,
  MessageCircle,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";

export default function SettingsPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [area, setArea] = useState("بيروت");

  const areas = ["بيروت", "الضاحية الجنوبية", "الجنوب", "البقاع", "الشمال", "الجبل"];

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6 rotate-180" />
          </a>
          <h1 className="font-black text-xl">{useLebanese ? "إعدادات المنصة" : "الإعدادات"}</h1>
        </div>
        <button 
          onClick={() => setUseLebanese(!useLebanese)}
          className="text-xs px-2 py-1 bg-slate-100 rounded-full border border-slate-200 font-black text-slate-600 uppercase"
        >
          {useLebanese ? "AR" : "LB"}
        </button>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">2</div>
            <div>
              <h2 className="font-black text-lg text-slate-900">مستخدم 2iwa2</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{useLebanese ? "عضو بالمنصة" : "عضو في منصة إيواء"}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-black">{useLebanese ? "اللغة المفضلة" : "لغة التطبيق"}</span>
              </div>
              <button 
                onClick={() => setUseLebanese(!useLebanese)}
                className="text-xs font-black text-red-600"
              >
                {useLebanese ? "لبناني" : "العربية"}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {useLebanese ? "تنبيهات الموبايل" : "إعدادات التنبيهات"}
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900">{useLebanese ? "تنبيهات فورية" : "إشعارات مباشرة"}</p>
                <p className="text-[10px] text-slate-400 font-medium">{useLebanese ? "لأخبار الغارات والتهديدات" : "للتنبيهات الأمنية العاجلة"}</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-red-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-7' : 'right-1'}`}></div>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <p className="text-sm font-black text-slate-900 mb-4">{useLebanese ? "المنطقة يلي بدك تنبهك أكتر شي" : "منطقة التغطية القصوى"}</p>
              <div className="grid grid-cols-2 gap-2">
                {areas.map(a => (
                  <button 
                    key={a}
                    onClick={() => setArea(a)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${
                      area === a ? 'bg-red-50 border-red-600 text-red-600 shadow-md' : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Smartphone className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <h3 className="font-black text-lg mb-2">{useLebanese ? "تواصل مع KiTS" : "الدعم الفني والتقني"}</h3>
            <p className="text-[10px] text-slate-400 mb-6 font-medium leading-relaxed">
              {useLebanese ? "نحن فريق لبناني عم نحاول نساعد بلي بنقدر عليه، إذا عندك فكرة أو مشكلة حكينا." : "نحن فريق لبناني نسعى لتقديم الحلول البرمجية لدعم مجتمعنا."}
            </p>
            <button className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-xs active:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              تواصل عبر واتساب
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-widest mt-4">2iwa2 v0.1.0-alpha</p>
    </main>
  );
}
