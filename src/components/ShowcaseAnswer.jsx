import Pullquote from './Pullquote'

/** Read-only rendering of one authored answer, for public showcase pages.
 * Unlike PromptGroup's read mode (which shows "Not answered yet." so a
 * member knows what still needs filling in), this omits the block entirely
 * when empty — a finished showcase page should never show a visible gap. */
export default function ShowcaseAnswer({ label, value, feature }) {
  if (!value) return null
  return (
    <div>
      {label && (
        <p className="flex items-baseline gap-2 font-display text-[15px] font-semibold text-ink-900 mb-2.5">
          <span className="w-4 h-[3px] shrink-0 rounded-full bg-brand-500 translate-y-[-3px]" />
          {label}
        </p>
      )}
      {feature ? (
        <Pullquote>{value}</Pullquote>
      ) : (
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink-700 whitespace-pre-line">{value}</p>
      )}
    </div>
  )
}
