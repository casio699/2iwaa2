"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft as ArrowLeftIcon,
  Plus,
  Info,
  ShieldAlert as ShieldAlertIcon
} from "lucide-react";
import ReportForm from "@/components/ReportForm";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  type: 'threat' | 'strike' | 'evacuation';
  title: string;
  titleLb: string;
  location: string;
  locationLb: string;
  time: string;
  date: string;
  isVerified: boolean;
  source: 'idf' | 'official' | 'user';
  description?: string;
  status: 'active' | 'recent' | 'old';
}

const mockAlerts: Alert[] = [
  { 
    id: "1", 
    type: 'evacuation', 
    title: "تحذير إخلاء عاجل", 
    titleLb: "انذار اخلاء من الجيش الإسرائيلي", 
    location: "حارة حريك، الضاحية الجنوبية", 
    locationLb: "حارة حريك، الضاحية", 
    time: "14:20", 
    date: "2026-03-07",
    isVerified: true, 
    source: 'idf',
    description: "يرجى الابتعاد عن المباني المحددة في الخرائط المرفقة فوراً.",
    status: 'active'
  },
  { 
    id: "2", 
    type: 'strike', 
    title: "غارة جوية", 
    titleLb: "في ضربة بالجنوب", 
    location: "النبطية، الجنوب", 
    locationLb: "النبطية", 
    time: "12:15", 
    date: "2026-03-07",
    isVerified: true, 
    source: 'official',
    status: 'recent'
  },
  { 
    id: "3", 
    type: 'threat', 
    title: "اشتباه بمسيرة", 
    titleLb: "في صوت طيران مسير قوي", 
    location: "صيدا، الجنوب", 
    locationLb: "صيدا", 
    time: "09:30", 
    date: "2026-03-07",
    isVerified: false, 
    source: 'user',
    status: 'recent'
  },
  { 
    id: "4", 
    type: 'strike', 
    title: "قصف مدفعي", 
    titleLb: "قصف مدفعي ع أطراف الضيعة", 
    location: "الخيام، الجنوب", 
    locationLb: "الخيام", 
    time: "22:00", 
    date: "2026-03-06",
    isVerified: true, 
    source: 'official',
    status: 'old'
  },
];

export default function AlertsPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filter, setFilter] = useState<'active' | 'recent' | 'old'>('active');

  const filteredAlerts = mockAlerts.filter(a => a.status === filter);

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-24">
      <header className="p-4 bg-white border-b sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6 rotate-180" />
          </a>
          <h1 className="font-black text-xl">{useLebanese ? "تنبيهات عاجلة" : "صفحة التنبيهات"}</h1>
        </div>
        <button 
          onClick={() => setUseLebanese(!useLebanese)}
          className="text-xs px-2 py-1 bg-red-50 rounded-full border border-red-100 font-black text-red-600 uppercase"
        >
          {useLebanese ? "AR" : "LB"}
        </button>
      </header>

      {/* Critical Status Info */}
      <div className="p-4 bg-red-600 text-white flex items-center gap-4">
        <ShieldAlertIcon className="w-10 h-10 animate-pulse" />
        <div>
          <h2 className="font-black text-lg leading-tight">{useLebanese ? "وضع مش طبيعي حالياً" : "حالة طوارئ نشطة"}</h2>
          <p className="text-[10px] opacity-90">{useLebanese ? "انتبه ع حالك وخليك بعيد عن الضاحية والجنوب" : "يرجى اتباع تعليمات السلامة والابتعاد عن مناطق النزاع"}</p>
        </div>
      </div>

      {/* Threat Database Filters */}
      <div className="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setFilter('active')}
          className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all ${filter === 'active' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          {useLebanese ? "هلق عم بصير" : "تهديدات نشطة"}
        </button>
        <button 
          onClick={() => setFilter('recent')}
          className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all ${filter === 'recent' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          {useLebanese ? "من شوي" : "حديثة"}
        </button>
        <button 
          onClick={() => setFilter('old')}
          className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all ${filter === 'old' ? 'bg-slate-400 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          {useLebanese ? "قديمة" : "أرشيف التهديدات"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, index) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden"
            >
              {/* Source Badge */}
              <div className={`absolute top-0 left-0 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white ${
                alert.source === 'idf' ? 'bg-red-600' : alert.source === 'official' ? 'bg-blue-600' : 'bg-slate-600'
              }`}>
                {alert.source}
              </div>

              <div className="flex justify-between items-start mt-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900 text-lg">
                      {useLebanese ? alert.titleLb : alert.title}
                    </h3>
                    {alert.isVerified && (
                      <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-50" />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{useLebanese ? alert.locationLb : alert.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">{alert.time}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl ${
                  alert.type === 'evacuation' ? 'bg-red-100 text-red-600' : 
                  alert.type === 'strike' ? 'bg-orange-100 text-orange-600' : 
                  'bg-amber-100 text-amber-600'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {alert.description && (
                <p className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed font-medium border-r-4 border-red-500">
                  {alert.description}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-slate-100 text-slate-800 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 active:bg-slate-200 transition-colors uppercase">
                  <Info className="w-3 h-3" />
                  {useLebanese ? "تفاصيل" : "مزيد من المعلومات"}
                </button>
                <button className="flex-1 bg-red-600 text-white py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 active:bg-red-700 transition-colors shadow-md uppercase">
                  <MapPin className="w-3 h-3" />
                  {useLebanese ? "الموقع ع الخريطة" : "رؤية على الخريطة"}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button to Report */}
      <button 
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-20 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-black z-50 active:scale-90 transition-transform hover:bg-red-700"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm">{useLebanese ? "خبرنا شي" : "تبليغ عن تهديد"}</span>
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <ReportForm 
          onClose={() => setShowReportModal(false)} 
          useLebanese={useLebanese} 
          type="threat" 
        />
      )}
    </main>
  );
}
