"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SheltersPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">مراكز الإيواء</h1>
            <p className="mt-2 text-zinc-600">
              قائمة مراكز الإيواء والمساكن المتاحة. قريباً: خريطة + بحث + فلترة.
            </p>
          </div>
        </div>

        {/* ArcGIS Integration */}
        <Card className="mt-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-right">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  🗺️ قاعدة البيانات الرسمية للإيواء
                </h2>
                <p className="text-zinc-700 mb-6 text-lg">
                  للحصول على قائمة كاملة ومحدثة بجميع مراكز الإيواء في لبنان، قم بزيارة المنصة الرسمية
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>خرائط تفاعلية مفصلة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span>بيانات حية ومحدثة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <span>بحث متقدم بالمنطقة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <span>متوافق مع الجوال</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <span>مصدر رسمي حكومي</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => window.open("https://experience.arcgis.com/experience/af252d852fd144ad98242eba8b6d60b3/?draft=true", "_blank")}
                  variant="primary"
                  className="w-full sm:w-auto text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform transition-all hover:scale-105"
                >
                  <span className="flex items-center gap-3 text-lg font-semibold">
                    🗺️ 
                    <span>الوصول إلى قاعدة البيانات الرسمية</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </Button>
                <div className="text-sm text-zinc-600 text-center space-y-1">
                  <div>🏛️ المنصة الرسمية الحكومية</div>
                  <div>📍 خرائط تفاعلية مفصلة</div>
                  <div>📊 بيانات حية ومحدثة</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        
        {/* List */}
        <div className="mt-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="text-zinc-600">الوصول إلى قاعدة البيانات الرسمية</p>
              <p className="mt-1 text-sm text-zinc-500">
                استخدم المنصة الرسمية للحصول على قائمة كاملة ومحدثة بجميع مراكز الإيواء في لبنان
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
