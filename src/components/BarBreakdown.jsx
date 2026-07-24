/** A sorted horizontal bar list (e.g. cases per department). Single brand
 * hue at varying bar length — since items are already sorted by magnitude,
 * no legend or categorical color is needed to read it. */
export default function BarBreakdown({ items, title }) {
  if (!items.length) return null
  const max = Math.max(...items.map(([, count]) => count))

  return (
    <div>
      {title && <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">{title}</p>}
      <div className="space-y-2.5">
        {items.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-32 sm:w-40 shrink-0 text-sm text-ink-700 truncate">{label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-ink-100 overflow-hidden">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-medium text-ink-500 tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
