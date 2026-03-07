"use client";

import React, { useState, useEffect } from "react";
import { 
  Hotel, 
  MapPin, 
  Phone, 
  Search, 
  DollarSign, 
  Star,
  CheckCircle2,
  ExternalLink,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import Skeleton from "@/components/Skeleton";

interface HotelItem {
  id: string;
  name: string;
  nameLb: string;
  location: string;
  locationLb: string;
  pricePerNight: number;
  rating: number;
  available: boolean;
  contact: string;
}

const mockHotels: HotelItem[] = [
  { 
    id: "1", 
    name: "فندق الساحة التراثي", 
    nameLb: "فندق الساحة بالضاحية (مغلق حالياً)", 
    location: "طريق المطار، بيروت", 
    locationLb: "طريق المطار، بيروت", 
    pricePerNight: 80, 
    rating: 4.5, 
    available: false, 
    contact: "01-450900" 
  },
  { 
    id: "2", 
    name: "رويال لوميير", 
    nameLb: "أوتيل رويال لوميير بكسروان", 
    location: "جونية، كسروان", 
    locationLb: "جونية، كسروان", 
    pricePerNight: 120, 
    rating: 4.8, 
    available: true, 
    contact: "09-123456" 
  },
  { 
    id: "3", 
    name: "فندق مونرو", 
    nameLb: "فندق مونرو بعين المريسة", 
    location: "عين المريسة، بيروت", 
    locationLb: "عين المريسة، بيروت", 
    pricePerNight: 95, 
    rating: 4.2, 
    available: true, 
    contact: "01-371122" 
  },
];

export default function HotelsPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const filteredHotels = mockHotels.filter(h => 
    h.name.includes(searchTerm) || h.location.includes(searchTerm)
  );

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "أوتيلات وفنادق" : "الفنادق المتوفرة"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100 font-black text-indigo-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={useLebanese ? "فتش ع أوتيل أو منطقة..." : "ابحث عن فندق أو منطقة..."}
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pr-10 pl-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-3 w-8 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-xl" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1 rounded-2xl" />
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
            </div>
          ))
        ) : (
          filteredHotels.map(hotel => (
            <div key={hotel.id} className={`bg-white rounded-3xl p-5 border shadow-sm transition-opacity ${hotel.available ? "border-slate-100" : "opacity-60 border-red-100 grayscale"}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-lg text-slate-900 leading-tight">
                      {useLebanese ? hotel.nameLb : hotel.name}
                    </h3>
                    {hotel.available && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{useLebanese ? hotel.locationLb : hotel.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-[10px] font-black">{hotel.rating}</span>
                  </div>
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-0.5 shadow-md">
                    <DollarSign className="w-3 h-3" />
                    {hotel.pricePerNight}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href={hotel.available ? `tel:${hotel.contact}` : "#"}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    hotel.available 
                    ? "bg-indigo-600 text-white shadow-xl active:bg-indigo-700" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  {hotel.available ? (useLebanese ? "حكيهن هلق" : "اتصال بالفندق") : (useLebanese ? "مش متوفر" : "غير متوفر")}
                </a>
                <button className="bg-white border-2 border-slate-100 text-slate-900 px-5 py-3 rounded-2xl text-xs font-black active:bg-slate-50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              
              {!hotel.available && (
                <p className="mt-3 text-[10px] font-black text-red-600 text-center uppercase tracking-widest">
                  {useLebanese ? "هيدا الأوتيل مفول أو مسكر" : "هذا الفندق غير متاح حالياً"}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
