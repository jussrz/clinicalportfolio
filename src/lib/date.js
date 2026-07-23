// 'YYYY-MM-DD' -> 'July 23, 2026'. Built from local date parts (not
// `new Date(isoDate)`, which parses as UTC and can shift a day depending on
// the viewer's timezone).
export function formatLongDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatDateRange(start, end) {
  const s = formatLongDate(start)
  const e = formatLongDate(end)
  if (s && e) return `${s} – ${e}`
  return s || e || ''
}
