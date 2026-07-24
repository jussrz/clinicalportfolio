/** Small-caps eyebrow + accent rule marking a short subsection title (e.g.
 * "Clinical Reasoning", "Group Reflection") — mirrors PageHeader's eyebrow
 * so read-only content reads with the same visual grammar as the rest of
 * the app's headline treatment. Meant for short titles, not full sentences
 * (all-caps hurts legibility past a few words). */
export default function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-[3px] rounded-full bg-brand-500" />
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{children}</p>
    </div>
  )
}
