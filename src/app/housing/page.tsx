"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Search, 
  Zap, 
  Droplets, 
  Wifi, 
  DollarSign, 
  Heart,
  Plus,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import ReportForm from "@/components/ReportForm";
import { CardSkeleton } from "@/components/Skeleton";

interface House {
  id: string;
  title: string;
  titleLb: string;
  location: string;
  locationLb: string;
  price: number; // 0 for free
  type: 'apartment' | 'room' | 'shared';
  amenities: {
    electricity: boolean;
    water: boolean;
    internet: boolean;
  };
  contact: string;
  description: string;
  descriptionLb: string;
}

const mockHouses: House[] = [
  { 
    id: "1", 
    title: "شقة مفروشة للنازحين - مجانية", 
    titleLb: "بيت مفروش للنازحين ببلاش", 
    location: "عالية، جبل لبنان", 
    locationLb: "عالية، الجبل", 
    price: 0, 
    type: 'apartment',
    amenities: { electricity: true, water: true, internet: false },
    contact: "03-111222",
    description: "شقة تتسع لعائلة من ٥ أشخاص، تتوفر فيها المياه والكهرباء (اشتراك).",
    descriptionLb: "بيت بيساع عيلة من ٥ أشخاص، في ماي وكهرباء (اشتراك)."
  },
  { 
    id: "2", 
    title: "غرفة نوم في منزل مشترك", 
    titleLb: "أوضة نوم ببيت مشترك", 
    location: "طرابلس، الميناء", 
    locationLb: "طرابلس، المينا", 
    price: 150, 
    type: 'room',
    amenities: { electricity: true, water: true, internet: true },
    contact: "06-333444",
    description: "غرفة نوم نظيفة مع حمام خاص، السعر لتغطية المصاريف فقط.",
    descriptionLb: "أوضة نوم نظيفة مع حمامها، السعر بس كرمال المصاريف."
  },
];

export default function HousingPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'free' | 'rent'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  const filteredHouses = mockHouses.filter(h => {
    const matchesSearch = h.title.includes(searchTerm) || h.location.includes(searchTerm);
    const matchesType = filterType === 'all' || (filterType === 'free' ? h.price === 0 : h.price > 0);
    return matchesSearch && matchesType;
  });

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-24">
      <header className="p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "بيوت وسكن" : "السكن الخاص"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-blue-50 rounded-full border border-blue-100 font-black text-blue-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={useLebanese ? "فتش ع بيت أو منطقة..." : "ابحث عن شقة أو منطقة..."}
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pr-10 pl-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all ${filterType === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setFilterType('free')}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all ${filterType === 'free' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
          >
            {useLebanese ? "ببلاش" : "مجاني"}
          </button>
          <button 
            onClick={() => setFilterType('rent')}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all ${filterType === 'rent' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
          >
            {useLebanese ? "إيجار" : "للإيجار"}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          filteredHouses.map(house => (
            <div key={house.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-black text-lg text-slate-900 leading-tight">
                  {useLebanese ? house.titleLb : house.title}
                </h3>
                <div className="flex items-center gap-1 text-slate-500 mt-2">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{useLebanese ? house.locationLb : house.location}</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 ${
                house.price === 0 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              }`}>
                {house.price === 0 ? (
                  <>
                    <Heart className="w-3 h-3" />
                    {useLebanese ? "ببلاش" : "مجاني"}
                  </>
                ) : (
                  <>
                    <DollarSign className="w-3 h-3" />
                    {house.price}$
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
              {useLebanese ? house.descriptionLb : house.description}
            </p>

            <div className="flex gap-4 mb-6">
              <div className={`flex flex-col items-center gap-1 ${house.amenities.electricity ? "text-amber-500" : "text-slate-200"}`}>
                <Zap className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{useLebanese ? "كهربا" : "كهرباء"}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 ${house.amenities.water ? "text-blue-500" : "text-slate-200"}`}>
                <Droplets className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{useLebanese ? "ماي" : "مياه"}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 ${house.amenities.internet ? "text-indigo-500" : "text-slate-200"}`}>
                <Wifi className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{useLebanese ? "نت" : "إنترنت"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href={`tel:${house.contact}`}
                className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:bg-black transition-colors"
              >
                <Phone className="w-4 h-4" />
                {useLebanese ? "حكيني" : "اتصال بالمؤجر"}
              </a>
              <button className="flex-1 bg-white border-2 border-slate-100 text-slate-900 py-3 rounded-2xl text-xs font-black active:bg-slate-50 transition-colors">
                {useLebanese ? "التفاصيل" : "عرض التفاصيل"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button to List a House */}
      <button 
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-black z-50 active:scale-90 transition-transform hover:bg-blue-700"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm">{useLebanese ? "حط بيتك" : "عرض منزلك"}</span>
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <ReportForm 
          onClose={() => setShowReportModal(false)} 
          useLebanese={useLebanese} 
          type="damage" 
        />
      )}
    </main>
  );
}
