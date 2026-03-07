/**
 * 2iwa2 Notification Utility - KiTS
 * Handles permission requests and subscription for Web Push.
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('هذا المتصفح لا يدعم الإشعارات');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker Registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker Registration Failed:', error);
    }
  }
}

/**
 * Mock function to subscribe the user to push notifications.
 * In production, you would send the subscription object to your server (Supabase).
 */
export async function subscribeToPushNotifications() {
  const registration = await registerServiceWorker();
  if (!registration) return;

  // This would typically involve a VAPID public key
  // const subscription = await registration.pushManager.subscribe({ ... });
  // await saveSubscriptionToSupabase(subscription);
  
  console.log('User subscribed to push notifications (Mock)');
}

/**
 * Trigger a local notification (fallback or UI feedback)
 */
export function showLocalNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png'
    });
  }
}
