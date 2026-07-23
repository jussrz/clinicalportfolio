import { useState } from 'react'
import { Area, Button, Field, FieldRow, IconTrash, ListField, SelectField } from './ui'
import { departments } from '../data/departments'

const emptyReflection = () => ({
  id: crypto.randomUUID(),
  department: '',
  clinicalArea: '',
  patientCode: '',
  ageSex: '',
  students: '',
  studentRoles: '',
  summary: '',
  pertinentPositives: '',
  pertinentNegatives: '',
  peFindings: '',
  problemList: ['', '', ''],
  differentials: ['', '', ''],
  workup: '',
  management: '',
  disposition: '',
  learningPoints: ['', '', ''],
  wellReflection: '',
  difficultReflection: '',
  improveReflection: '',
})

export { emptyReflection }

export default function CaseReflectionCard({ reflection, index, onChange, onDelete }) {
  const [open, setOpen] = useState(index === 0)

  function set(key, val) {
    onChange({ ...reflection, [key]: val })
  }

  const summaryLine = [reflection.department, reflection.patientCode].filter(Boolean).join(' · ')

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-7 py-4 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Selected Case Reflection No. {index + 1}
          </p>
          <p className="text-sm text-ink-500 mt-0.5">{summaryLine || 'Not yet filled in'}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            role="button"
            aria-label="Delete this reflection"
            className="w-8 h-8 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <IconTrash />
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`w-5 h-5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 sm:px-7 pb-7 pt-1 space-y-6 border-t border-ink-100">
          <FieldRow cols={3}>
            <SelectField label="Department" value={reflection.department} onChange={(e) => set('department', e.target.value)}>
              <option value="" disabled>
                Select department
              </option>
              {departments.map((d) => (
                <option key={d.slug} value={d.name}>
                  {d.name}
                </option>
              ))}
            </SelectField>
            <Field label="Clinical Area" placeholder="e.g., Ward, ER, OPD" value={reflection.clinicalArea} onChange={(e) => set('clinicalArea', e.target.value)} />
            <Field label="Patient Code" placeholder="e.g., PT-014" value={reflection.patientCode} onChange={(e) => set('patientCode', e.target.value)} />
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Age / Sex" placeholder="e.g., 34/F" value={reflection.ageSex} onChange={(e) => set('ageSex', e.target.value)} />
            <Field label="Student/s Involved" placeholder="Names or initials" value={reflection.students} onChange={(e) => set('students', e.target.value)} />
            <Field label="Student Role/s" placeholder="e.g., History-taker, presenter" value={reflection.studentRoles} onChange={(e) => set('studentRoles', e.target.value)} />
          </FieldRow>

          <div>
            <p className="text-sm font-semibold text-ink-800 mb-3">Brief Case Summary</p>
            <Area
              placeholder="A short, non-identifying summary of the case."
              value={reflection.summary}
              onChange={(e) => set('summary', e.target.value)}
              minRows={3}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-800 mb-3">Key History and Physical Examination Findings</p>
            <div className="space-y-4">
              <Area label="Pertinent positives" placeholder="Findings that support the diagnosis." value={reflection.pertinentPositives} onChange={(e) => set('pertinentPositives', e.target.value)} minRows={2} />
              <Area label="Pertinent negatives" placeholder="Relevant absent findings that narrow the differential." value={reflection.pertinentNegatives} onChange={(e) => set('pertinentNegatives', e.target.value)} minRows={2} />
              <Area label="Relevant physical examination findings" placeholder="Key exam findings." value={reflection.peFindings} onChange={(e) => set('peFindings', e.target.value)} minRows={2} />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-800 mb-3">Clinical Reasoning</p>
            <div className="space-y-5">
              <ListField label="Problem list" items={reflection.problemList} onChange={(v) => set('problemList', v)} placeholder="e.g., Acute abdominal pain" addLabel="Add problem" />
              <ListField label="Differential diagnoses" items={reflection.differentials} onChange={(v) => set('differentials', v)} placeholder="e.g., Acute appendicitis" addLabel="Add differential" />
              <Area label="Suggested diagnostics / work-up" placeholder="Labs, imaging, or other studies considered." value={reflection.workup} onChange={(e) => set('workup', e.target.value)} minRows={2} />
              <Area label="Initial management priorities" placeholder="Immediate management steps." value={reflection.management} onChange={(e) => set('management', e.target.value)} minRows={2} />
              <Area label="Referral or disposition considerations" placeholder="Referral, admission, or follow-up plan." value={reflection.disposition} onChange={(e) => set('disposition', e.target.value)} minRows={2} />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-800 mb-3">Group Learning Points</p>
            <ListField items={reflection.learningPoints} onChange={(v) => set('learningPoints', v)} placeholder="A key takeaway from this case" addLabel="Add learning point" />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-800 mb-3">Group Reflection</p>
            <div className="space-y-4">
              <Area label="What did we do well as a group?" value={reflection.wellReflection} onChange={(e) => set('wellReflection', e.target.value)} minRows={2} />
              <Area label="What was difficult or challenging?" value={reflection.difficultReflection} onChange={(e) => set('difficultReflection', e.target.value)} minRows={2} />
              <Area label="What should we improve before clerkship?" value={reflection.improveReflection} onChange={(e) => set('improveReflection', e.target.value)} minRows={2} />
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Collapse
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
