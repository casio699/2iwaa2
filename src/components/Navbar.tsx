import Link from "next/link";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/shelters", label: "مراكز الإيواء" },
  { href: "/hotlines", label: "أرقام الطوارئ" },
  { href: "/reports", label: "البلاغات" },
  { href: "/alerts", label: "التنبيهات" },
  { href: "/hospitals", label: "خدمات صحية" },
  { href: "/admin", label: "الإدارة" },
];

export function Navbar() {
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

          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
