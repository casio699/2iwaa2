"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "shelter" | "threat" | "hospital" | "housing";
  severity?: "urgent" | "warning" | "info";
}

interface MapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMaps = any;

export function MapView({ 
  markers, 
  center = { lat: 33.8938, lng: 35.5018 },
  zoom = 10,
  height = "400px",
  onMarkerClick 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapMarkers = useRef<any[]>([]);

  const initMap = useCallback(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps) return;
    
    map.current = new g.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: "roadmap",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });
  }, [center, zoom]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      mapMarkers.current.forEach((m: GoogleMaps) => m.setMap(null));
    };
  }, [initMap]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps) return;

    mapMarkers.current.forEach((m: GoogleMaps) => m.setMap(null));
    mapMarkers.current = [];

    const bounds = new g.maps.LatLngBounds();

    markers.forEach((marker) => {
      const color = marker.type === "threat" 
        ? marker.severity === "urgent" ? "#DC2626" : marker.severity === "warning" ? "#F59E0B" : "#3B82F6"
        : marker.type === "shelter" ? "#10B981"
        : marker.type === "hospital" ? "#EC4899"
        : "#6366F1";

      const mapMarker = new g.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: map.current,
        title: marker.title,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
          scale: marker.type === "threat" && marker.severity === "urgent" ? 12 : 8,
        },
      });

      const infoWindow = new g.maps.InfoWindow({
        content: `<div style="padding: 8px; direction: rtl;"><strong>${marker.title}</strong></div>`,
      });

      mapMarker.addListener("click", () => {
        onMarkerClick?.(marker);
      });

      mapMarker.addListener("mouseover", () => {
        infoWindow.open(map.current, mapMarker);
      });

      mapMarker.addListener("mouseout", () => {
        infoWindow.close();
      });

      mapMarkers.current.push(mapMarker);
      bounds.extend({ lat: marker.lat, lng: marker.lng });
    });

    if (markers.length > 0) {
      map.current.fitBounds(bounds);
    }
  }, [markers, onMarkerClick]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: "100%", height, borderRadius: "12px" }}
      className="bg-zinc-100"
    />
  );
}

// Simple SVG map fallback for when Google Maps isn't available
export function SimpleMapView({ 
  markers, 
  height = "400px" 
}: MapProps) {
  return (
    <div 
      className="relative bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center p-8">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-zinc-600 font-medium">خريطة التهديدات والمواقع</p>
        <p className="text-sm text-zinc-500 mt-2">
          {markers.length} موقع محدد
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {markers.slice(0, 5).map((m) => (
            <span 
              key={m.id}
              className="inline-block bg-white px-2 py-1 rounded text-xs shadow"
            >
              {m.type === "threat" ? "⚠️" : m.type === "shelter" ? "🏠" : "📍"} {m.title}
            </span>
          ))}
          {markers.length > 5 && (
            <span className="inline-block bg-white px-2 py-1 rounded text-xs shadow">
              +{markers.length - 5} أكثر
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
