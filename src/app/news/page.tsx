"use client";

import React, { useState } from "react";
import { 
  Newspaper, 
  ExternalLink, 
  Clock, 
  Share2, 
  ChevronRight,
  Filter,
  Eye,
  MessageSquare,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";

interface NewsSource {
  name: string;
  bias: 'left' | 'center' | 'right';
  coverage: string;
}

interface NewsItem {
  id: string;
  title: string;
  titleLb: string;
  source: string;
  category: 'security' | 'humanitarian' | 'financial';
  time: string;
  views: number;
  comments: number;
  content: string;
  relatedSources?: NewsSource[];
}

const mockNews: NewsItem[] = [
  { 
    id: "1", 
    title: "وزارة الصحة: ارتفاع عدد الشهداء في غارات الأمس", 
    titleLb: "آخر أخبار الشهداء والجرحى مبارح", 
    source: "MTV Lebanon", 
    category: 'security', 
    time: "منذ ١٠ دقائق", 
    views: 1240, 
    comments: 45,
    content: "أعلنت وزارة الصحة اللبنانية عن حصيلة جديدة للضحايا...",
    relatedSources: [
      { name: "Al Manar", bias: 'right', coverage: "ركزت على الأضرار المادية وصمود الأهالي" },
      { name: "MTV Lebanon", bias: 'left', coverage: "ركزت على حصيلة الضحايا المدنيين" },
      { name: "LBCI", bias: 'center', coverage: "نقلت الإحصاءات الرسمية لوزارة الصحة" }
    ]
  },
  { 
    id: "2", 
    title: "خطة طوارئ جديدة لتوزيع المساعدات في عكار", 
    titleLb: "في مساعدات جديدة عم تتوزع بعكار", 
    source: "LBCI News", 
    category: 'humanitarian', 
    time: "منذ ٣٠ دقيقة", 
    views: 850, 
    comments: 12,
    content: "بدأت الجمعيات المحلية بالتعاون مع البلديات..."
  },
  { 
    id: "3", 
    title: "استقرار سعر صرف الدولار في السوق الموازية", 
    titleLb: "الدولار بعده عم يحوم حول الـ ٨٩٥٠٠", 
    source: "Lira Rate", 
    category: 'financial', 
    time: "منذ ساعة", 
    views: 3200, 
    comments: 156,
    content: "سجل سعر صرف الدولار استقراراً نسبياً اليوم..."
  },
];

export default function NewsPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleShare = async (item: NewsItem) => {
    const text = `${item.title}\n\nتابع آخر الأخبار عبر منصة إيواء:\n${window.location.origin}/news`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert(useLebanese ? "انسخ الخبر وابعته!" : "تم نسخ نص الخبر للمشاركة");
    }
  };

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "آخر الأخبار" : "أخبار المنصة"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-slate-100 rounded-full border border-slate-200 font-black text-slate-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button className="px-5 py-2 bg-red-600 text-white rounded-2xl text-xs font-black shadow-md">الكل</button>
          <button className="px-5 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-xs font-black">أمنية</button>
          <button className="px-5 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-xs font-black">إنسانية</button>
          <button className="px-5 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-xs font-black">مالية</button>
        </div>
      </header>

      {/* Featured News / Ground News Style Comparison */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Newspaper className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <span className="bg-red-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block">تغطية متعددة</span>
            <h2 className="text-xl font-black mb-3 leading-tight">تغطية شاملة لمستجدات الهدنة والوضع الميداني</h2>
            <p className="text-xs text-slate-400 mb-4 font-medium italic opacity-80">نحلل الخبر من ٣ مصادر مختلفة لضمان الدقة</p>
            <button className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-xs active:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              عرض التحليل المقارن
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {mockNews.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-600">
                    {item.source.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900">{item.source}</h4>
                    <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                      <Clock className="w-2 h-2" />
                      {item.time}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleShare(item)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors active:scale-90"
                >
                  <Share2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <h3 className="font-black text-lg text-slate-900 mb-3 leading-snug">
                {useLebanese ? item.titleLb : item.title}
              </h3>

              {item.relatedSources && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 flex-1 bg-red-200 rounded-full"></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">مقارنة التغطية</span>
                    <div className="h-1 flex-1 bg-blue-200 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {item.relatedSources.map((rel, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-900 truncate">{rel.name}</p>
                        <div className={`w-full h-1 rounded-full mt-1 ${rel.bias === 'left' ? 'bg-blue-500' : rel.bias === 'right' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                      </div>
                    ))}
                  </div>
                  {expandedItem === item.id && (
                    <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      {item.relatedSources.map((rel, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-900">{rel.name}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${rel.bias === 'left' ? 'bg-blue-100 text-blue-600' : rel.bias === 'right' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                              {rel.bias === 'left' ? 'توجه يساري' : rel.bias === 'right' ? 'توجه يميني' : 'مستقل'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{rel.coverage}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                  <Eye className="w-3 h-3" />
                  {item.views}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                  <MessageSquare className="w-3 h-3" />
                  {item.comments}
                </div>
                <button 
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="mr-auto text-red-600 text-[10px] font-black flex items-center gap-1 hover:underline"
                >
                  {expandedItem === item.id ? (useLebanese ? "خلص" : "إغلاق") : (useLebanese ? "قارن المصادر" : "قارن التغطية")}
                  <ChevronRight className={`w-3 h-3 transition-transform ${expandedItem === item.id ? 'rotate-90' : 'rotate-180'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
