export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid gap-4">
      <span className="sr-only">جارٍ التحميل…</span>
      <div className="h-10 w-1/3 animate-pulse rounded-lg bg-brand-soft" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-brand-soft" />
        ))}
      </div>
    </div>
  );
}
