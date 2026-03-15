"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type NewsArticle = {
  id: string;
  titleAr: string;
  titleEn: string | null;
  summaryAr: string | null;
  sourceName: string;
  sourceUrl: string;
  originalUrl: string;
  sourceType: string;
  category: string;
  tags: string[];
  imageUrl: string | null;
  coverage: string[];
  publishedAt: string;
  isBreaking: boolean;
  viewCount: number;
};

const categoryLabels: Record<string, string> = {
  threat: "تهديد",
  shelter: "إيواء",
  humanitarian: "إنساني",
  general: "عام",
};

const categoryBadge: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  threat: "danger",
  shelter: "success",
  humanitarian: "info",
  general: "default",
};

const sourceIcons: Record<string, string> = {
  official: "🏛️",
  mainstream: "📺",
  social: "📱",
  international: "🌍",
};

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<Array<{ sourceName: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=50");
      const json = await res.json();
      setArticles(json.articles || []);
      setSources(json.sources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all"
    ? articles
    : filter === "breaking"
    ? articles.filter((a) => a.isBreaking)
    : articles.filter((a) => a.category === filter);

  const breakingCount = articles.filter((a) => a.isBreaking).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">أخبار المنصة</h1>
          <p className="mt-2 text-zinc-600">
            جمع الأخبار من مصادر متعددة للحصول على الصورة الكاملة
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{articles.length}</div>
            <div className="text-sm text-zinc-500">خبر اليوم</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{breakingCount}</div>
            <div className="text-sm text-zinc-500">عاجل</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{sources.length}</div>
            <div className="text-sm text-zinc-500">مصادر</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">مُحايد</div>
            <div className="text-sm text-zinc-500">التحليل</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "breaking", label: "🔴 عاجل" },
            { key: "threat", label: "تهديدات" },
            { key: "shelter", label: "إيواء" },
            { key: "humanitarian", label: "إنساني" },
            { key: "general", label: "عام" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.key
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-600">جارٍ تحميل الأخبار...</p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">📰</div>
                <p className="text-zinc-600">لا توجد أخبار في هذا القسم</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {article.isBreaking && (
                      <Badge variant="danger">🔴 عاجل</Badge>
                    )}
                    <Badge variant={categoryBadge[article.category] || "default"}>
                      {categoryLabels[article.category] || article.category || "عام"}
                    </Badge>
                    <span className="text-sm text-zinc-500">
                      {sourceIcons[article.sourceType] || "📰"} {article.sourceName}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-relaxed">
                    <a
                      href={article.originalUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {article.titleAr}
                    </a>
                  </CardTitle>
                  {article.summaryAr && (
                    <p className="mt-2 text-zinc-600">{article.summaryAr}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Coverage Analysis */}
                  {article.coverage && article.coverage.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-zinc-500">غطّى الخبر:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {article.coverage.map((source) => (
                          <span
                            key={source}
                            className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-zinc-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
                    <span>
                      {new Date(article.publishedAt || new Date()).toLocaleDateString("ar-LB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{article.viewCount || 0} مشاهدة</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sources Footer */}
        <div className="mt-12 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">المصادر المتاحة</h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <span
                key={s.sourceName}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm"
              >
                {s.sourceName}
                <span className="text-zinc-400">({s.count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
