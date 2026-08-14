export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-56 rounded-lg bg-brand-100" />
        <div className="h-4 w-96 max-w-full rounded bg-brand-100/70" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-surface rounded-3xl p-6 space-y-3">
              <div className="h-6 w-6 rounded-full bg-brand-100" />
              <div className="h-4 w-3/4 rounded bg-brand-100/70" />
              <div className="h-3 w-full rounded bg-brand-100/50" />
              <div className="h-3 w-2/3 rounded bg-brand-100/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
