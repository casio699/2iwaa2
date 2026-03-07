"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  HelpCircle, 
  Shield, 
  Smartphone, 
  Bell, 
  MapPin,
  Heart,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";

export default function GuidePage() {
  const [useLebanese, setUseLebanese] = useState(false);

  const steps = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "تثبيت المنصة",
      titleLb: "كيف بتنزلها عندك",
      desc: "افتح الموقع من المتصفح واضغط على 'إضافة إلى الشاشة الرئيسية' ليعمل كـ تطبيق موبايل.",
      descLb: "افتح الموقع واكبس ع 'Add to Home Screen' كرمال يصير متل أي تطبيق ع تلفونك."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "تفعيل التنبيهات",
      titleLb: "كرمال يوصلك الخبر",
      desc: "تأكد من الموافقة على طلب الإشعارات لتصلك تحذيرات الإخلاء والتهديدات فوراً.",
      descLb: "وافق ع الـ Notifications كرمال أول ما يصير شي يوصلك تنبيه دغري."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "البحث عن ملجأ",
      titleLb: "كيف بتلاقي مطرح",
      desc: "استخدم صفحة الملاجئ أو الخريطة للعثور على أقرب مركز إيواء متوفر.",
      descLb: "فوت ع صفحة الملاجئ أو الخريطة وشوف وين في محل قريب عليك."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "المصداقية",
      titleLb: "الخبر الأكيد",
      desc: "نحن نعتمد فقط على المصادر الرسمية والبلاغات التي يؤكدها المشرفون (التاج الأزرق).",
      descLb: "ما تنشر حكيات، نحن بس بنحط الأخبار يلي منأكد منها (يلي عليها علامة زرقاء)."
    }
  ];

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6 rotate-180" />
          </a>
          <h1 className="font-black text-xl">{useLebanese ? "كيف بتستخدمها؟" : "دليل الاستخدام"}</h1>
        </div>
        <button 
          onClick={() => setUseLebanese(!useLebanese)}
          className="text-xs px-2 py-1 bg-slate-50 rounded-full border border-slate-100 font-black text-slate-600 uppercase"
        >
          {useLebanese ? "AR" : "LB"}
        </button>
      </header>

      <div className="p-6">
        <div className="bg-red-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">{useLebanese ? "منصة إيواء بخدمتكن" : "دليلك الشامل للمنصة"}</h2>
            <p className="text-xs text-red-100 font-medium leading-relaxed opacity-90">
              {useLebanese ? "هدفنا نساعد الكل يلاقوا مطرح آمن ويضلوا ع علم بكل شي عم بيصير." : "هدفنا مساعدة المواطنين في العثور على الأمان والبقاء على اطلاع دائم بالتطورات الميدانية."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-red-600 flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="font-black text-slate-900 mb-1">{useLebanese ? step.titleLb : step.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {useLebanese ? step.descLb : step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-4" />
          <h4 className="font-black text-slate-900 mb-2">{useLebanese ? "عندك سؤال تاني؟" : "هل تحتاج لمساعدة إضافية؟"}</h4>
          <p className="text-[10px] text-slate-400 font-medium mb-6">
            {useLebanese ? "تواصل مع فريق KiTS دغري عبر صفحة الإعدادات." : "يمكنك التواصل مع فريق الدعم الفني مباشرة عبر صفحة الإعدادات."}
          </p>
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:bg-black transition-colors flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            {useLebanese ? "دعم أهلنا بلبنان" : "دعم المجتمع اللبناني"}
          </button>
        </div>
      </div>
    </main>
  );
}
