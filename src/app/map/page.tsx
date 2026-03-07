"use client";

import React, { useState, useEffect } from "react";
import { 
  Map as MapIcon, 
  Layers, 
  Navigation, 
  Search,
  Filter,
  Home,
  Activity,
  AlertTriangle,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";

// Dynamic import for Leaflet because it needs 'window'
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapPage() {
  const [useLebanese, setUseLebanese] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Leaflet CSS needs to be loaded
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  const center: [number, number] = [33.8938, 35.5018]; // Beirut

  const locations = [
    { id: 1, type: 'shelter', pos: [33.86, 35.52], title: "مدرسة الشياح", titleLb: "مدرسة الشياح" },
    { id: 2, type: 'hospital', pos: [33.87, 35.49], title: "مستشفى بيروت الحكومي", titleLb: "مستشفى الحريري" },
    { id: 3, type: 'alert', pos: [33.85, 35.51], title: "تحذير إخلاء", titleLb: "انذار اخلاء" },
  ];

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen pb-20">
      <header className="p-4 bg-white border-b sticky top-0 z-[1000] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </a>
            <h1 className="font-black text-xl">{useLebanese ? "الخريطة" : "خريطة الخدمات"}</h1>
          </div>
          <button 
            onClick={() => setUseLebanese(!useLebanese)}
            className="text-xs px-2 py-1 bg-slate-100 rounded-full border border-slate-200 font-black text-slate-600 uppercase"
          >
            {useLebanese ? "AR" : "LB"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button className="px-4 py-2 bg-red-600 text-white rounded-2xl text-[10px] font-black flex items-center gap-2 whitespace-nowrap shadow-md">
            <Home className="w-3 h-3" />
            {useLebanese ? "الملاجئ" : "الملاجئ"}
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-[10px] font-black flex items-center gap-2 whitespace-nowrap">
            <Activity className="w-3 h-3" />
            {useLebanese ? "المستشفيات" : "المستشفيات"}
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-100 rounded-2xl text-[10px] font-black flex items-center gap-2 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            {useLebanese ? "تحذيرات" : "تحذيرات"}
          </button>
        </div>
      </header>

      <div className="flex-1 relative min-h-[500px] z-0">
        {isMounted && (
          <MapContainer 
            center={center} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc: any) => (
              <Marker key={loc.id} position={loc.pos}>
                <Popup>
                  <div className="font-black text-xs text-right">
                    {useLebanese ? loc.titleLb : loc.title}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        
        {/* Floating Map Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-[500]">
          <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 active:scale-95 transition-transform">
            <Layers className="w-5 h-5 text-slate-600" />
          </button>
          <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 active:scale-95 transition-transform">
            <Navigation className="w-5 h-5 text-red-600" />
          </button>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-4 z-[500]">
          <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <MapIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">الموقع المختار</p>
              <p className="text-sm font-black text-slate-900 leading-tight">حارة حريك، الضاحية الجنوبية</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg">
              التفاصيل
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar (Mobile) - Replicated for consistency */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-6 py-3 flex justify-between items-center z-[1000]">
        <a href="/" className="text-slate-400 flex flex-col items-center">
          <Home className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">الرئيسية</span>
        </a>
        <a href="/map" className="text-red-600 flex flex-col items-center">
          <MapIcon className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">الخريطة</span>
        </a>
        <a href="/alerts" className="text-slate-400 flex flex-col items-center relative">
          <AlertTriangle className="w-6 h-6" />
          <span className="absolute top-0 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[10px] mt-1 font-bold">تنبيهات</span>
        </a>
        <a href="/news" className="text-slate-400 flex flex-col items-center">
          <Newspaper className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">أخبار</span>
        </a>
      </nav>
    </main>
  );
}
