/** A highlighted excerpt of authored text (e.g. a case summary), styled to
 * draw the eye the way a magazine pull-quote does. Meant to wrap real,
 * already-authored copy — not to auto-extract or paraphrase content. */
export default function Pullquote({ children }) {
  if (!children) return null
  return (
    <blockquote className="border-l-4 border-brand-400 bg-brand-50/50 rounded-r-xl pl-5 pr-4 py-4 font-display text-[17px] leading-relaxed text-ink-800">
      {children}
    </blockquote>
  )
}
