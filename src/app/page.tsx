import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const features = [
  {
    href: "/shelters",
    title: "مراكز الإيواء الرسمية",
    description: "ابحث عن مراكز إيواء رسمية من الحكومة والبلديات مع معلومات السعة المحدثة",
    badge: "متاح",
    badgeVariant: "success" as const,
    icon: "🏛️",
  },
  {
    href: "/housing",
    title: "سكن خاص وإيواء",
    description: "منازل، شقق، وفنادق متاحة للإيواء المؤقت - مجانية أو للإيجار",
    badge: "جديد",
    badgeVariant: "info" as const,
    icon: "🏠",
  },
  {
    href: "/hotlines",
    title: "أرقام الطوارئ",
    description: "جميع أرقام الطوارئ والخطوط الساخنة: الدفاع المدني، الصليب الأحمر، والطوارئ الموحدة",
    badge: "24/7",
    badgeVariant: "danger" as const,
    icon: "🚨",
  },
  {
    href: "/flights",
    title: "معلومات الطيران",
    description: "معلومات مباشرة عن رحلات مطار بيروت - رفيق الحريري الدولي",
    badge: "مباشر",
    badgeVariant: "info" as const,
    icon: "✈️",
  },
  {
    href: "/threats",
    title: "قاعدة بيانات التهديدات",
    description: "تتبع التهديدات والحوادث الأمنية مع الخريطة التفاعلية والتحقق من المصادر",
    badge: "مباشر",
    badgeVariant: "warning" as const,
    icon: "⚠️",
  },
  {
    href: "/alerts",
    title: "تنبيهات الخطر",
    description: "نظام تنبيه فوري مشابه لتطبيق Red Alert - إشعارات فورية للتهديدات",
    badge: "فوري",
    badgeVariant: "danger" as const,
    icon: "🔔",
  },
  {
    href: "/news",
    title: "أخبار المنصة",
    description: "جمع الأخبار من مصادر متعددة (Ground News style) - مقارنة التغطية والمصادر",
    badge: "متعدد",
    badgeVariant: "info" as const,
    icon: "📰",
  },
  {
    href: "/help",
    title: "التبرعات والمساعدات",
    description: "ساعد الآخرين أو اطلب المساعدة - تبرع بالوقت، المال، السكن، أو الموارد",
    badge: "مجتمع",
    badgeVariant: "success" as const,
    icon: "🤝",
  },
  {
    href: "/hospitals",
    title: "خدمات صحية",
    description: "مستشفيات، عيادات، وصيدليات قريبة منك من خريطة OpenStreetMap",
    badge: "محدث",
    badgeVariant: "success" as const,
    icon: "🏥",
  },
  {
    href: "/financial",
    title: "المعلومات المالية",
    description: "أسعار صرف الليرة (رسمي/سوق سوداء/صيرفة)، أسعار المحروقات، والذهب",
    badge: "لحظي",
    badgeVariant: "info" as const,
    icon: "💱",
  },
  {
    href: "/reports",
    title: "البلاغات المباشرة",
    description: "أرسل بلاغاً عن تهديد، إيواء، أو أي معلومات مفيدة للمجتمع",
    badge: "نشط",
    badgeVariant: "warning" as const,
    icon: "📢",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-zinc-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            <span className="text-indigo-600">  Al-Menassa  </span>   المنصة  
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            منصة من لبنان لكل لبنان : 
            مجتمعنا أولويتنا.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shelters"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30"
            >
              ابحث عن إيواء
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-zinc-200 bg-white px-6 py-3 text-base font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
            >
              أرسل بلاغاً
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="h-full border-0 shadow-md transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{feature.icon}</span>
                    <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                  </div>
                  <CardTitle className="mt-3 text-xl">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    اكتشف المزيد
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 rounded-2xl bg-zinc-900 px-8 py-12 text-white">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">قيد التشغيل</div>
              <div className="mt-1 text-sm text-zinc-400">المنصة نشطة 24/7</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">آمن</div>
              <div className="mt-1 text-sm text-zinc-400">بياناتك محمية</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">مجاني</div>
              <div className="mt-1 text-sm text-zinc-400">لجميع المستخدمين</div>
            </div>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-12 text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700"
          >
            لوحة الإدارة
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
