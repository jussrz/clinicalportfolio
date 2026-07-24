/** A single at-a-glance metric (e.g. "12 Cases Logged"). Uses the display
 * font for the number so it reads as a headline figure, not a form value. */
export default function StatTile({ label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white card-shadow p-4 sm:p-5">
      <p className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 tabular-nums">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mt-1.5">{label}</p>
      {sublabel && <p className="text-xs text-ink-400 mt-0.5">{sublabel}</p>}
    </div>
  )
}
