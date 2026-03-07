import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">2iwa2 - منصة إيواء</h1>
        <p className="mt-3 text-zinc-700">
          منصة لمساعدة النازحين في لبنان: مراكز إيواء، مساكن، تنبيهات، وبلاغات.
        </p>

        <div className="mt-8 grid gap-3">
          <Link
            className="rounded-lg border bg-white px-4 py-3 hover:bg-zinc-50"
            href="/shelters"
          >
            مراكز الإيواء
          </Link>
          <Link
            className="rounded-lg border bg-white px-4 py-3 hover:bg-zinc-50"
            href="/alerts"
          >
            تنبيهات الخطر
          </Link>
          <Link
            className="rounded-lg border bg-white px-4 py-3 hover:bg-zinc-50"
            href="/reports"
          >
            بلاغات مباشرة
          </Link>
          <Link
            className="rounded-lg border bg-white px-4 py-3 hover:bg-zinc-50"
            href="/admin"
          >
            لوحة الإدارة
          </Link>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          اللغة الأساسية: العربية الفصحى. (سنضيف لهجة لبنانية كخيار لاحقاً داخل
          التطبيق.)
        </p>
      </div>
    </main>
  );
}
