"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  HandHelping, 
  Coins, 
  Shirt, 
  Box, 
  Plus,
  MessageSquare,
  MapPin,
  Clock,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import Skeleton from "@/components/Skeleton";

interface HelpOffer {
  id: string;
  title: string;
  titleLb: string;
  type: 'money' | 'shelter' | 'utilities' | 'clothing' | 'other';
  location: string;
  locationLb: string;
  time: string;
  contact: string;
}

const mockHelpOffers: HelpOffer[] = [
  { 
    id: "1", 
    title: "توزيع ثياب وأحذية للأطفال", 
    titleLb: "في ثياب وصبابيط لولاد صغار", 
    type: 'clothing', 
    location: "الحمرا، بيروت", 
    locationLb: "الحمرا، بيروت", 
    time: "منذ ساعة", 
    contact: "01-750123" 
  },
  { 
    id: "2", 
    title: "مساعدة مالية للعائلات النازحة", 
    titleLb: "مساعدة مصاري للعيل يلي تهجرت", 
    type: 'money', 
    location: "صيدا، الجنوب", 
    locationLb: "صيدا، الجنوب", 
    time: "منذ ساعتين", 
    contact: "07-720456" 
  },
  { 
    id: "3", 
    title: "تأمين وجبات ساخنة يومياً", 
    titleLb: "في أكل سخن كل يوم ببلاش", 
    type: 'utilities', 
    location: "طرابلس، التل", 
    locationLb: "طرابلس، التل", 
    time: "منذ ٣ ساعات", 
    contact: "06-444555" 
  },
];

export default function HelpPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-24">
      <header className="p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "بدي ساعد" : "مساعدة وتبرع"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100 font-black text-emerald-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2">
            <Box className="w-3 h-3" />
            الكل
          </button>
          <button className="px-5 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-xs font-black flex items-center gap-2">
            <Coins className="w-3 h-3" />
            مصاري
          </button>
          <button className="px-5 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-xs font-black flex items-center gap-2">
            <Shirt className="w-3 h-3" />
            ثياب
          </button>
          <button className="px-5 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-xs font-black flex items-center gap-2">
            <HandHelping className="w-3 h-3" />
            أخرى
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="w-14 h-14 rounded-2xl" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1 rounded-2xl" />
                <Skeleton className="h-12 w-16 rounded-2xl" />
              </div>
            </div>
          ))
        ) : (
          mockHelpOffers.map(offer => (
            <div key={offer.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-lg text-slate-900 leading-tight">
                      {useLebanese ? offer.titleLb : offer.title}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1 text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{useLebanese ? offer.locationLb : offer.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{offer.time}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${
                  offer.type === 'money' ? 'bg-amber-100 text-amber-600' : 
                  offer.type === 'clothing' ? 'bg-blue-100 text-blue-600' : 
                  offer.type === 'utilities' ? 'bg-orange-100 text-orange-600' : 
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {offer.type === 'money' ? <Coins className="w-6 h-6" /> : 
                   offer.type === 'clothing' ? <Shirt className="w-6 h-6" /> : 
                   offer.type === 'utilities' ? <HandHelping className="w-6 h-6" /> : 
                   <Box className="w-6 h-6" />}
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`tel:${offer.contact}`}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:bg-emerald-700 transition-colors shadow-xl"
                >
                  <MessageSquare className="w-4 h-4" />
                  {useLebanese ? "تواصل معي" : "تواصل مع المتبرع"}
                </a>
                <button className="bg-white border-2 border-slate-100 text-slate-900 px-5 py-3 rounded-2xl text-xs font-black active:bg-slate-50 transition-colors">
                  {useLebanese ? "تفاصيل" : "التفاصيل"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button to Add an Offer */}
      <button className="fixed bottom-24 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-black z-50 active:scale-90 transition-transform hover:bg-emerald-700">
        <Heart className="w-6 h-6 fill-white" />
        <span className="text-sm">{useLebanese ? "بدي ساعد" : "تقديم مساعدة"}</span>
      </button>
    </main>
  );
}
