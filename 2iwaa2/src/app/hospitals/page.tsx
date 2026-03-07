"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  MapPin, 
  Phone, 
  Search, 
  PlusCircle, 
  AlertCircle,
  Stethoscope,
  Info,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import Skeleton from "@/components/Skeleton";

interface Hospital {
  id: string;
  name: string;
  nameLb: string;
  location: string;
  locationLb: string;
  status: 'active' | 'busy' | 'full' | 'closed';
  services: string[];
  servicesLb: string[];
  contact: string;
}

const mockHospitals: Hospital[] = [
  { 
    id: "1", 
    name: "مستشفى بيروت الحكومي", 
    nameLb: "مستشفى بيروت الحكومي (الحريري)", 
    location: "بئر حسن، بيروت", 
    locationLb: "بئر حسن، بيروت", 
    status: 'busy', 
    services: ["طوارئ", "عناية فائقة", "عمليات"], 
    servicesLb: ["طوارئ", "عناية فائقة", "عمليات"], 
    contact: "01-830000" 
  },
  { 
    id: "2", 
    name: "مستشفى النبطية الحكومي", 
    nameLb: "مستشفى النبطية الحكومي", 
    location: "النبطية، الجنوب", 
    locationLb: "النبطية، الجنوب", 
    status: 'full', 
    services: ["طوارئ", "غسيل كلى"], 
    servicesLb: ["طوارئ", "غسيل كلى"], 
    contact: "07-766777" 
  },
  { 
    id: "3", 
    name: "مستشفى الهيكل", 
    nameLb: "مستشفى الهيكل بطرابلس", 
    location: "طرابلس، الشمال", 
    locationLb: "طرابلس، الشمال", 
    status: 'active', 
    services: ["طوارئ", "توليد", "أطفال"], 
    servicesLb: ["طوارئ", "توليد", "ولاد"], 
    contact: "06-411111" 
  },
];

export default function HospitalsPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredHospitals = mockHospitals.filter(h => 
    h.name.includes(searchTerm) || h.location.includes(searchTerm)
  );

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "صحة وطوارئ" : "طوارئ ومستشفيات"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-rose-50 rounded-full border border-rose-100 font-black text-rose-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={useLebanese ? "فتش ع مستشفى أو منطقة..." : "ابحث عن مستشفى أو منطقة..."}
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pr-10 pl-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Warning Bar */}
      <div className="p-4 bg-rose-600 text-white flex items-center gap-3 animate-pulse">
        <AlertCircle className="w-8 h-8 opacity-70" />
        <p className="text-[10px] font-black leading-tight uppercase tracking-wider">
          {useLebanese ? "في ضغط كبير ع الطوارئ بالجنوب والضاحية حالياً" : "ضغط استثنائي على أقسام الطوارئ في مناطق النزاع حالياً"}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1 rounded-2xl" />
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
            </div>
          ))
        ) : (
          filteredHospitals.map(hospital => (
            <div key={hospital.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-lg text-slate-900 leading-tight">
                    {useLebanese ? hospital.nameLb : hospital.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{useLebanese ? hospital.locationLb : hospital.location}</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl font-black text-[8px] uppercase tracking-widest ${
                hospital.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                hospital.status === 'busy' ? 'bg-orange-100 text-orange-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {hospital.status === 'active' ? (useLebanese ? "شغال عادي" : "متاح") : 
                 hospital.status === 'busy' ? (useLebanese ? "في ضغط" : "مزدحم") : 
                 (useLebanese ? "مفول" : "ممتلئ")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(useLebanese ? hospital.servicesLb : hospital.services).map((service, idx) => (
                <div key={idx} className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 border border-slate-100">
                  <PlusCircle className="w-2 h-2" />
                  {service}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <a 
                href={`tel:${hospital.contact}`}
                className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:bg-black transition-colors"
              >
                <Phone className="w-4 h-4" />
                {useLebanese ? "حكيهن" : "اتصال بالمستشفى"}
              </a>
              <button className="bg-rose-600 text-white px-5 py-3 rounded-2xl text-xs font-black active:bg-rose-700 transition-colors shadow-xl">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
