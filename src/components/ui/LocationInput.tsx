"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationInputProps {
  value?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  onChange: (location: { latitude: number; longitude: number; address?: string }) => void;
  placeholder?: string;
  className?: string;
  showAddressInput?: boolean;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationInput({ 
  value, 
  onChange, 
  placeholder = "اختر الموقع من الخريطة أو أدخل العنوان", 
  className = "",
  showAddressInput = true 
}: LocationInputProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState(value?.address || "");
  const mapRef = useRef<any>(null);

  // Default to Lebanon coordinates if no value provided
  const defaultLat = value?.latitude || 33.8938;
  const defaultLng = value?.longitude || 35.5018;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (value?.address) {
      setAddress(value.address);
    }
  }, [value?.address]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordinatesText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        onChange({ latitude, longitude, address: coordinatesText });
        setIsLoadingLocation(false);
        
        // Center map on new location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("تم رفض إذن الوصول للموقع");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("معلومات الموقع غير متاحة");
            break;
          case error.TIMEOUT:
            setLocationError("انتهت مهلة تحديد الموقع");
            break;
          default:
            setLocationError("حدث خطأ أثناء تحديد الموقع");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    const coordinatesText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    onChange({ latitude: lat, longitude: lng, address: coordinatesText });
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    if (value?.latitude && value?.longitude) {
      onChange({ 
        latitude: value.latitude, 
        longitude: value.longitude, 
        address: newAddress 
      });
    }
  };

  if (!isClient) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Address Input */}
      {showAddressInput && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">العنوان</label>
          <input
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      )}

      {/* Location Controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoadingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري تحديد الموقع...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              موقعي الحالي
            </>
          )}
        </button>

        {value?.latitude && value?.longitude && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span>الإحداثيات:</span>
            <span className="font-mono text-xs">
              {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {locationError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {locationError}
        </div>
      )}

      {/* Map */}
      <div className="relative">
        <div className="h-64 rounded-lg overflow-hidden border border-zinc-300">
          <MapContainer
            center={[defaultLat, defaultLng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapEvents onLocationSelect={handleMapClick} />
            
            {(value?.latitude && value?.longitude) && (
              <Marker position={[value.latitude, value.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">الموقع المحدد</div>
                    {address && <div className="text-zinc-600">{address}</div>}
                    <div className="text-xs text-zinc-500 mt-1">
                      {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-zinc-600">
          انقر على الخريطة لتحديد الموقع
        </div>
      </div>
    </div>
  );
}
