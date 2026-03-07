"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HelpFormModal } from "@/components/HelpFormModal";

type HelpPost = {
  id: string;
  type: string;
  category: string;
  titleAr: string;
  descriptionAr: string;
  contactName: string | null;
  contactPhone: string;
  contactWhatsApp: string | null;
  location: string | null;
  urgency: string;
  status: string;
  verified: boolean;
  createdAt: string;
};

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  offer: { label: "عرض مساعدة", color: "bg-emerald-100 text-emerald-800", icon: "🤝" },
  request: { label: "طلب مساعدة", color: "bg-blue-100 text-blue-800", icon: "🆘" },
};

const categoryLabels: Record<string, string> = {
  shelter: "سكن",
  money: "مالي",
  food: "غذاء",
  clothing: "ملابس",
  medical: "طبي",
  utilities: "خدمات",
  transport: "نقل",
  volunteer: "تطوع",
  other: "أخرى",
};

const urgencyLabels: Record<string, { label: string; color: string }> = {
  low: { label: "منخفض", color: "bg-zinc-100 text-zinc-600" },
  normal: { label: "عادي", color: "bg-blue-100 text-blue-600" },
  high: { label: "عالي", color: "bg-orange-100 text-orange-600" },
  urgent: { label: "عاجل", color: "bg-red-100 text-red-600" },
};

export default function HelpPage() {
  const [posts, setPosts] = useState<HelpPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpModalType, setHelpModalType] = useState<"offer" | "request">("offer");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/help?status=active");
      const json = await res.json();
      setPosts(json.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = posts.filter((p) => {
    if (filter !== "all" && p.urgency !== filter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    return true;
  });

  const offers = posts.filter((p) => p.type === "offer").length;
  const requests = posts.filter((p) => p.type === "request").length;
  const urgent = posts.filter((p) => p.urgency === "urgent").length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">التبرعات والمساعدات</h1>
          <p className="mt-2 text-zinc-600">
            ساعد الآخرين أو اطلب المساعدة - تبرع بالوقت، المال، أو الموارد
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{offers}</div>
            <div className="text-sm text-zinc-500">عروض مساعدة</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{requests}</div>
            <div className="text-sm text-zinc-500">طلبات مساعدة</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{urgent}</div>
            <div className="text-sm text-zinc-500">حالات عاجلة</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === "all"
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTypeFilter("offer")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === "offer"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              🤝 عروض
            </button>
            <button
              onClick={() => setTypeFilter("request")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === "request"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              🆘 طلبات
            </button>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">كل الأولويات</option>
            <option value="urgent">🚨 عاجل</option>
            <option value="high">⚠️ عالي</option>
            <option value="normal">📋 عادي</option>
            <option value="low">📎 منخفض</option>
          </select>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-zinc-600">جارٍ التحميل...</p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🤲</div>
                <p className="text-zinc-600">لا توجد طلبات أو عروض متاحة</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeLabels[post.type]?.icon || "📌"}</span>
                      <Badge className={typeLabels[post.type]?.color || ""}>
                        {typeLabels[post.type]?.label || post.type}
                      </Badge>
                      <Badge className={urgencyLabels[post.urgency]?.color || ""}>
                        {urgencyLabels[post.urgency]?.label || post.urgency}
                      </Badge>
                    </div>
                    {post.verified && (
                      <Badge variant="success">✓ موثق</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-lg">{post.titleAr}</CardTitle>
                  <p className="text-sm text-zinc-500">
                    {categoryLabels[post.category] || post.category}
                    {post.location && ` - ${post.location}`}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-zinc-700">{post.descriptionAr}</p>

                  <div className="flex flex-col gap-2">
                    {post.contactName && (
                      <div className="text-sm text-zinc-600">
                        <span className="font-medium">التواصل:</span> {post.contactName}
                      </div>
                    )}
                    <a
                      href={`tel:${post.contactPhone}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {post.contactPhone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Post Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => { setHelpModalType("offer"); setHelpModalOpen(true); }}>
            🤝 عرض مساعدة
          </Button>
          <Button onClick={() => { setHelpModalType("request"); setHelpModalOpen(true); }}>
            🆘 طلب مساعدة
          </Button>
        </div>

        {/* Modal */}
        <HelpFormModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          onSuccess={load}
          defaultType={helpModalType}
        />
      </div>
    </div>
  );
}
