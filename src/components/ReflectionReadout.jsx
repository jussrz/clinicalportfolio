import Pullquote from './Pullquote'
import SectionLabel from './SectionLabel'

export function ReadField({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      <p className="text-sm text-ink-500 whitespace-pre-line mt-1">{value || <span className="text-ink-400 italic">Not provided</span>}</p>
    </div>
  )
}

export function ReadList({ label, items }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      {items.length ? (
        <ol className="mt-1 space-y-0.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-ink-500">{i + 1}. {item}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-ink-400 italic mt-1">Not provided</p>
      )}
    </div>
  )
}

/** Group Learning Points read out as a highlighted brand-tinted callout
 * rather than a plain numbered list — these are the takeaways a reviewer
 * is most likely to scan for, so they get more visual weight. */
export function ReadCallout({ label, items }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {items.length ? (
        <ul className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 sm:p-5 space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-800">
              <span className="shrink-0 grid place-items-center w-5 h-5 mt-0.5 rounded-full bg-brand-600 text-white text-[10px] font-semibold">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-400 italic">Not provided</p>
      )}
    </div>
  )
}

/** Full read-only rendering of a Selected Case Reflection's content —
 * shared between the Studio's CaseReflectionCard (its collapsed-card read
 * mode) and the public Case Study detail page, so both present identical
 * content without duplicated markup. */
export function ReflectionReadout({ reflection: r }) {
  return (
    <div className="space-y-7">
      <div>
        <SectionLabel>Brief Case Summary</SectionLabel>
        {r.brief_summary ? (
          <Pullquote>{r.brief_summary}</Pullquote>
        ) : (
          <p className="text-sm text-ink-400 italic">Not provided</p>
        )}
      </div>

      <div>
        <SectionLabel>Key History and Physical Examination Findings</SectionLabel>
        <div className="space-y-4">
          <ReadField label="Pertinent positives" value={r.pertinent_positives} />
          <ReadField label="Pertinent negatives" value={r.pertinent_negatives} />
          <ReadField label="Relevant physical examination findings" value={r.pe_findings} />
        </div>
      </div>

      <div>
        <SectionLabel>Clinical Reasoning</SectionLabel>
        <div className="space-y-4">
          <ReadList label="Problem list" items={r.problem_list ?? []} />
          <ReadList label="Differential diagnoses" items={r.differential_diagnoses ?? []} />
          <ReadField label="Suggested diagnostics/work-up" value={r.workup} />
          <ReadField label="Initial management priorities" value={r.management_priorities} />
          <ReadField label="Referral or disposition considerations" value={r.referral_considerations} />
        </div>
      </div>

      <ReadCallout label="Group Learning Points" items={r.group_learning_points ?? []} />

      <div>
        <SectionLabel>Group Reflection</SectionLabel>
        <div className="space-y-4">
          <ReadField label="What did we do well as a group?" value={r.group_did_well} />
          <ReadField label="What was difficult or challenging?" value={r.group_challenges} />
          <ReadField label="What should we improve before clerkship?" value={r.group_improvements} />
        </div>
      </div>
    </div>
  )
}
