"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Check, 
  X, 
  Eye, 
  Clock, 
  Users,
  Database,
  RefreshCw,
  ShieldCheck as ShieldCheckIcon,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import Skeleton from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface Report {
  id: string;
  type: 'threat' | 'housing' | 'news';
  user: string;
  content: string;
  location: string;
  time: string;
  status: 'pending' | 'verified' | 'rejected';
}

const mockReports: Report[] = [
  { id: "1", type: 'threat', user: "مستخدم ٨٨", content: "سماع دوي انفجار قوي بالقرب من المطار", location: "طريق المطار", time: "قبل ٥ دقائق", status: 'pending' },
  { id: "2", type: 'housing', user: "علي خ.", content: "تأمين غرفة لعائلة نازحة في طرابلس", location: "طرابلس", time: "منذ ساعة", status: 'pending' },
  { id: "3", type: 'threat', user: "سارة م.", content: "تحليق مكثف للطيران المسير", location: "صور", time: "منذ ١٠ دقائق", status: 'pending' },
];

export default function AdminDashboard() {
  const [reports, setReports] = useState(mockReports);
  const [useLebanese, setUseLebanese] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (id: string, newStatus: 'verified' | 'rejected') => {
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-900 min-h-screen text-white pb-20">
      <header className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-50 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-slate-700 rounded-full">
            <ArrowLeftIcon className="w-6 h-6 rotate-180" />
          </a>
          <div>
            <h1 className="font-black text-xl flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
              لوحة التحكم
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إدارة منصة إيواء</p>
          </div>
        </div>
        <button 
          onClick={() => setUseLebanese(!useLebanese)}
          className="text-xs px-2 py-1 bg-slate-700 rounded-full border border-slate-600 font-black text-slate-300 uppercase"
        >
          {useLebanese ? "AR" : "LB"}
        </button>
      </header>

      {/* Admin Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">بلاغات قيد الانتظار</p>
          <p className="text-xl font-black text-amber-500">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">مستخدمين نشطين</p>
          <p className="text-xl font-black text-blue-500">١,٢٤٠</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">تهديدات مؤكدة</p>
          <p className="text-xl font-black text-red-500">١٢</p>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            طلبات التحقق
          </h2>
          <button className="text-[10px] font-black text-blue-400 flex items-center gap-1 uppercase">
            <RefreshCw className="w-3 h-3" />
            تحديث
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <motion.div 
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-800 rounded-3xl p-5 border border-slate-700 space-y-4"
                >
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl bg-slate-700" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20 bg-slate-700" />
                        <Skeleton className="h-2 w-32 bg-slate-700" />
                      </div>
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full bg-slate-700" />
                  </div>
                  <Skeleton className="h-20 w-full bg-slate-700" />
                  <div className="flex gap-2">
                    <Skeleton className="h-12 flex-1 rounded-2xl bg-slate-700" />
                    <Skeleton className="h-12 flex-1 rounded-2xl bg-slate-700" />
                  </div>
                </motion.div>
              ))
            ) : reports.filter(r => r.status === 'pending').map(report => (
              <motion.div 
                key={report.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-800 rounded-3xl p-5 border border-slate-700 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${report.type === 'threat' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {report.type === 'threat' ? <AlertTriangle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-black text-xs text-slate-300">{report.user}</h3>
                      <p className="text-[8px] text-slate-500 uppercase font-bold">{report.time} - {report.location}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-bold text-slate-100 mb-4 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  {report.content}
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(report.id, 'verified')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 transition-colors uppercase shadow-lg shadow-emerald-900/20"
                  >
                    <Check className="w-4 h-4" />
                    {useLebanese ? "مزبوط" : "تأكيد"}
                  </button>
                  <button 
                    onClick={() => handleAction(report.id, 'rejected')}
                    className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 transition-colors border border-red-500/20 uppercase"
                  >
                    <X className="w-4 h-4" />
                    {useLebanese ? "كذب" : "رفض"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {reports.filter(r => r.status === 'pending').length === 0 && (
            <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
              <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">لا يوجد طلبات جديدة</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto p-8 text-center">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">KiTS Admin Console v1.0</p>
      </footer>
    </main>
  );
}
