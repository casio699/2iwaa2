"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className={`${isOnline ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <CardContent className="py-2 px-4 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className={`text-sm font-medium ${isOnline ? "text-emerald-700" : "text-amber-700"}`}>
            {isOnline ? "متصل" : "غير متصل - العمل بدون إنترنت متاح"}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
