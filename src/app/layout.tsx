"use client";

import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/notifications";

const inter = Inter({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"], weight: ["200", "300", "400", "500", "600", "700", "800", "900"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>2iwa2 - منصة إيواء</title>
        <meta name="description" content="منصة لدعم النازحين وتوفير الملاجئ والخدمات في لبنان" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ef4444" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${cairo.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
