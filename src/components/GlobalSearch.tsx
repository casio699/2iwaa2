"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: "shelter" | "housing" | "threat" | "help" | "hospital";
  title: string;
  subtitle?: string;
  url: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function search(q: string) {
    setLoading(true);
    try {
      // Search across all endpoints
      const [shelters, housing, threats, help] = await Promise.all([
        fetch(`/api/shelters`).then(r => r.json()).catch(() => null),
        fetch(`/api/housing`).then(r => r.json()).catch(() => null),
        fetch(`/api/threats`).then(r => r.json()).catch(() => null),
        fetch(`/api/help`).then(r => r.json()).catch(() => null),
      ]);

      const allResults: SearchResult[] = [];

      // Process shelters
      if (shelters?.shelters) {
        shelters.shelters
          .filter((s: { nameAr?: string; addressAr?: string }) => s.nameAr?.includes(q) || s.addressAr?.includes(q))
          .forEach((s: { id: string; nameAr: string; addressAr: string }) => {
            allResults.push({
              id: s.id,
              type: "shelter",
              title: s.nameAr,
              subtitle: s.addressAr,
              url: `/shelters`,
            });
          });
      }

      // Process housing
      if (housing?.housing) {
        housing.housing
          .filter((h: { hostName?: string; addressAr?: string }) => h.hostName?.includes(q) || h.addressAr?.includes(q))
          .forEach((h: { id: string; hostName: string; addressAr: string }) => {
            allResults.push({
              id: h.id,
              type: "housing",
              title: `سكن - ${h.hostName}`,
              subtitle: h.addressAr,
              url: `/housing`,
            });
          });
      }

      // Process threats
      if (threats?.threats) {
        threats.threats
          .filter((t: { areaNameAr?: string; descriptionAr?: string }) => t.areaNameAr?.includes(q) || t.descriptionAr?.includes(q))
          .slice(0, 5)
          .forEach((t: { id: string; areaNameAr: string; type: string }) => {
            allResults.push({
              id: t.id,
              type: "threat",
              title: t.areaNameAr,
              subtitle: t.type,
              url: `/threats`,
            });
          });
      }

      // Process help
      if (help?.posts) {
        help.posts
          .filter((p: { titleAr?: string; descriptionAr?: string }) => p.titleAr?.includes(q) || p.descriptionAr?.includes(q))
          .slice(0, 5)
          .forEach((p: { id: string; titleAr: string; type: string }) => {
            allResults.push({
              id: p.id,
              type: "help",
              title: p.titleAr,
              subtitle: p.type === "offer" ? "عرض مساعدة" : "طلب مساعدة",
              url: `/help`,
            });
          });
      }

      setResults(allResults.slice(0, 10));
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result: SearchResult) {
    setShowResults(false);
    setQuery("");
    router.push(result.url);
  }

  const typeIcons: Record<string, string> = {
    shelter: "🏠",
    housing: "🔑",
    threat: "⚠️",
    help: "🤝",
    hospital: "🏥",
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="البحث في المنصة..."
          className="w-full rounded-lg border border-zinc-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-zinc-200 max-h-80 overflow-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">
              {loading ? "جارٍ البحث..." : "لا توجد نتائج"}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-50 flex items-center gap-3"
                >
                  <span className="text-lg">{typeIcons[result.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-zinc-900 truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-zinc-500 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
