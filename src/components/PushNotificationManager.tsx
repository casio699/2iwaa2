"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      setSubscription(existingSub);
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  }

  async function subscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("يجب السماح بالإشعارات لتلقي التنبيهات");
        return;
      }

      // Subscribe
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
      });

      // Send to server
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint: localStorage.getItem("2iwaa2-fingerprint") || "unknown",
          pushSubscription: newSubscription.toJSON(),
          pushEnabled: true,
        }),
      });

      setSubscription(newSubscription);
    } catch (e) {
      console.error("Error subscribing:", e);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
      }
    } catch (e) {
      console.error("Error unsubscribing:", e);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-zinc-500">المتصفح لا يدعم الإشعارات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔔 الإشعارات الفورية</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 mb-4">
          احصل على تنبيهات فورية للتهديدات في منطقتك مباشرة على جهازك
        </p>
        
        {subscription ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
              ✅ الإشعارات مفعلة
            </div>
            <Button 
              variant="outline" 
              onClick={unsubscribe}
              disabled={loading}
            >
              {loading ? "جارٍ..." : "إلغاء الإشعارات"}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={subscribe}
            disabled={loading}
            className="w-full"
          >
            {loading ? "جارٍ التفعيل..." : "تفعيل الإشعارات"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
