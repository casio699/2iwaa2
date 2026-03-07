"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/shelters", label: "مراكز الإيواء" },
  { href: "/housing", label: "سكن خاص" },
  { href: "/hotlines", label: "أرقام الطوارئ" },
  { href: "/hospitals", label: "خدمات صحية" },
  { href: "/threats", label: "التهديدات" },
  { href: "/alerts", label: "التنبيهات" },
  { href: "/news", label: "الأخبار" },
  { href: "/help", label: "مساعدات" },
  { href: "/financial", label: "الأسعار" },
  { href: "/flights", label: "الطيران" },
  { href: "/reports", label: "البلاغات" },
  { href: "/admin", label: "الإدارة" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">2iwaa2</span>
            <span className="text-sm text-zinc-500">منصة إيواء</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
