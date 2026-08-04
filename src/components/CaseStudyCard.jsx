import { Link } from 'react-router-dom'

/** Gallery thumbnail for one case study, styled like a project card rather
 * than a data row — department eyebrow, a title drawn from the working
 * diagnosis or chief complaint, and a short excerpt of the case summary. */
export default function CaseStudyCard({ reflection, caseEntry }) {
  const title = caseEntry?.working_diagnosis || caseEntry?.chief_complaint || `Case Reflection No. ${reflection.reflection_no}`
  const meta = [caseEntry?.clinical_area, caseEntry?.age_sex].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/case-reflections/${reflection.id}`}
      className="group block h-full rounded-2xl border border-ink-200/70 bg-white card-shadow card-shadow-hover p-5 sm:p-6"
    >
      {caseEntry?.department && (
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">{caseEntry.department}</p>
      )}
      <p className="font-display text-lg font-semibold text-ink-900 group-hover:text-brand-700 transition-colors">
        {title}
      </p>
      {meta && <p className="text-xs text-ink-400 mt-1">{meta}</p>}
      {reflection.brief_summary && (
        <p className="text-sm text-ink-600 mt-3 leading-relaxed line-clamp-3">{reflection.brief_summary}</p>
      )}
      <p className="mt-4 text-sm font-medium text-brand-700 group-hover:text-brand-800">Read case study</p>
    </Link>
  )
}
