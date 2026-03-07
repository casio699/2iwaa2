"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Search, MapPin, Users, Phone, Plus,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import ReportForm from "@/components/ReportForm";
import { CardSkeleton } from "@/components/Skeleton";

interface Shelter {
  id: string;
  name: string;
  nameLb: string;
  location: string;
  locationLb: string;
  capacity: number;
  occupied: number;
  contact: string;
  status: 'available' | 'full' | 'limited';
}

const mockShelters: Shelter[] = [
  { id: "1", name: "مدرسة الشياح الرسمية", nameLb: "مدرسة الشياح", location: "الشياح، بعبدا", locationLb: "الشياح", capacity: 350, occupied: 350, contact: "01-123456", status: 'full' },
  { id: "2", name: "ثانوية بعلبك للبنات", nameLb: "ثانوية البنات ببعلبك", location: "بعلبك، البقاع", locationLb: "بعلبك", capacity: 500, occupied: 420, contact: "08-654321", status: 'limited' },
  { id: "3", name: "مركز بلدية طرابلس", nameLb: "بلدية طرابلس", location: "طرابلس، الشمال", locationLb: "طرابلس", capacity: 200, occupied: 50, contact: "06-987654", status: 'available' },
];

export default function SheltersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [useLebanese, setUseLebanese] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredShelters = mockShelters.filter(s => 
    s.name.includes(searchTerm) || s.location.includes(searchTerm)
  );

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen">
      <header className="p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "وين في محلات؟" : "الملاجئ الرسمية"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-red-50 rounded-full border border-red-100 font-black text-red-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={useLebanese ? "فتش ع منطقة أو مدرسة..." : "ابحث عن منطقة أو مدرسة..."}
            className="w-full bg-slate-100 border-none rounded-xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {["الكل", "بيروت", "الجنوب", "البقاع", "الشمال"].map(area => (
            <button key={area} className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap active:bg-red-600 active:text-white transition-colors">
              {area}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          filteredShelters.map(shelter => {
            const occupancyPercent = Math.round((shelter.occupied / shelter.capacity) * 100);
            const isFull = shelter.status === 'full';
            
            return (
              <div key={shelter.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{useLebanese ? shelter.nameLb : shelter.name}</h3>
                    <div className="flex items-center gap-1 text-slate-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px]">{useLebanese ? shelter.locationLb : shelter.location}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    isFull ? "bg-red-100 text-red-700" : 
                    shelter.status === 'limited' ? "bg-orange-100 text-orange-700" : 
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {isFull ? (useLebanese ? "مفول" : "ممتلئ") : (useLebanese ? "في محل" : "متوفر")}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>{useLebanese ? "القدرة الاستيعابية" : "نسبة الإشغال"}</span>
                    <span>{shelter.occupied} / {shelter.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        occupancyPercent > 90 ? "bg-red-500" : 
                        occupancyPercent > 70 ? "bg-orange-500" : 
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <a 
                    href={`tel:${shelter.contact}`}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:bg-slate-200 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {useLebanese ? "حكيهن" : "اتصال"}
                  </a>
                  <button className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:bg-red-700 transition-colors shadow-sm">
                    <MapPin className="w-3 h-3" />
                    {useLebanese ? "دلني وين" : "الاتجاهات"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <button 
        onClick={() => setUseLebanese(!useLebanese)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center font-bold text-xs text-red-600 z-50 active:scale-95 transition-transform"
      >
        {useLebanese ? "AR" : "LB"}
      </button>

      {/* Floating Action Button to Update Status */}
      <button 
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-black z-50 active:scale-90 transition-transform hover:bg-red-700"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm">{useLebanese ? "تحديث وضع" : "تحديث حالة"}</span>
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <ReportForm 
          onClose={() => setShowReportModal(false)} 
          useLebanese={useLebanese} 
          type="shelter" 
        />
      )}
    </main>
  );
}
