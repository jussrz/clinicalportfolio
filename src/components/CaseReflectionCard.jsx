import { useState } from 'react'
import { Area, Button, Field, FieldRow, IconTrash, ListField, SelectField } from './ui'
import { DEPARTMENT_OPTIONS } from '../data/options'

export const emptyReflection = {
  department: '',
  clinical_area: '',
  patient_code: '',
  age_sex: '',
  students_involved: '',
  student_roles: '',
  case_summary: '',
  pertinent_positives: '',
  pertinent_negatives: '',
  physical_exam_findings: '',
  problem_list: ['', '', ''],
  differential_diagnoses: ['', '', ''],
  suggested_workup: '',
  management_priorities: '',
  disposition_considerations: '',
  group_learning_points: ['', '', ''],
  reflection_went_well: '',
  reflection_challenges: '',
  reflection_improvements: '',
}

/** The full field set, shared between the "add new" form and inline edit mode. */
export function CaseReflectionForm({ values, onChange }) {
  function set(key, val) {
    onChange({ ...values, [key]: val })
  }

  return (
    <div className="space-y-6">
      <FieldRow cols={3}>
        <SelectField label="Department" value={values.department} onChange={(e) => set('department', e.target.value)}>
          <option value="" disabled>Select department</option>
          {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </SelectField>
        <Field label="Clinical Area" placeholder="e.g., Ward, ER, OPD" value={values.clinical_area} onChange={(e) => set('clinical_area', e.target.value)} />
        <Field label="Patient Code" placeholder="e.g., Pt-001" value={values.patient_code} onChange={(e) => set('patient_code', e.target.value)} />
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Age / Sex" placeholder="e.g., 34/F" value={values.age_sex} onChange={(e) => set('age_sex', e.target.value)} />
        <Field label="Student/s Involved" placeholder="Names or initials" value={values.students_involved} onChange={(e) => set('students_involved', e.target.value)} />
        <Field label="Student Role/s" placeholder="e.g., History-taker, presenter" value={values.student_roles} onChange={(e) => set('student_roles', e.target.value)} />
      </FieldRow>

      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Brief Case Summary</p>
        <Area
          placeholder="A short, non-identifying summary of the case."
          value={values.case_summary}
          onChange={(e) => set('case_summary', e.target.value)}
          minRows={3}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Key History and Physical Examination Findings</p>
        <div className="space-y-4">
          <Area label="Pertinent positives" value={values.pertinent_positives} onChange={(e) => set('pertinent_positives', e.target.value)} minRows={2} />
          <Area label="Pertinent negatives" value={values.pertinent_negatives} onChange={(e) => set('pertinent_negatives', e.target.value)} minRows={2} />
          <Area label="Relevant physical examination findings" value={values.physical_exam_findings} onChange={(e) => set('physical_exam_findings', e.target.value)} minRows={2} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Clinical Reasoning</p>
        <div className="space-y-5">
          <ListField label="Problem list" items={values.problem_list} onChange={(v) => set('problem_list', v)} placeholder="e.g., Acute abdominal pain" addLabel="Add problem" />
          <ListField label="Differential diagnoses" items={values.differential_diagnoses} onChange={(v) => set('differential_diagnoses', v)} placeholder="e.g., Acute appendicitis" addLabel="Add differential" />
          <Area label="Suggested diagnostics / work-up" value={values.suggested_workup} onChange={(e) => set('suggested_workup', e.target.value)} minRows={2} />
          <Area label="Initial management priorities" value={values.management_priorities} onChange={(e) => set('management_priorities', e.target.value)} minRows={2} />
          <Area label="Referral or disposition considerations" value={values.disposition_considerations} onChange={(e) => set('disposition_considerations', e.target.value)} minRows={2} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Group Learning Points</p>
        <ListField items={values.group_learning_points} onChange={(v) => set('group_learning_points', v)} placeholder="A key takeaway from this case" addLabel="Add learning point" />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Group Reflection</p>
        <div className="space-y-4">
          <Area label="What did we do well as a group?" value={values.reflection_went_well} onChange={(e) => set('reflection_went_well', e.target.value)} minRows={2} />
          <Area label="What was difficult or challenging?" value={values.reflection_challenges} onChange={(e) => set('reflection_challenges', e.target.value)} minRows={2} />
          <Area label="What should we improve before clerkship?" value={values.reflection_improvements} onChange={(e) => set('reflection_improvements', e.target.value)} minRows={2} />
        </div>
      </div>
    </div>
  )
}

export default function CaseReflectionCard({ reflection, onSave, onDelete, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(reflection)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const summaryLine = [reflection.department, reflection.patient_code].filter(Boolean).join(' · ')

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await onSave(draft)
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this case reflection? This cannot be undone.')) {
      onDelete()
    }
  }

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-7 py-4 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Selected Case Reflection No. {reflection.reflection_no}
          </p>
          <p className="text-sm text-ink-500 mt-0.5">{summaryLine || 'Not yet filled in'}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            onClick={(e) => { e.stopPropagation(); handleDelete() }}
            role="button"
            aria-label="Delete this reflection"
            className="w-8 h-8 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <IconTrash />
          </span>
          <svg viewBox="0 0 24 24" className={`w-5 h-5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 sm:px-7 pb-7 pt-1 border-t border-ink-100">
          {editing ? (
            <div className="pt-6 space-y-6">
              <CaseReflectionForm values={draft} onChange={setDraft} />
              {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="outline" onClick={() => { setDraft(reflection); setEditing(false) }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="pt-6">
              <ReflectionReadout reflection={reflection} />
              <div className="pt-4">
                <Button variant="outline" onClick={() => { setDraft(reflection); setEditing(true) }}>Edit</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReadField({ label, value }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p className="text-[15px] text-ink-700 whitespace-pre-line">{value || <span className="text-ink-400 italic">Not provided</span>}</p>
    </div>
  )
}

function ReadList({ label, items }) {
  const filled = (items ?? []).filter(Boolean)
  return (
    <div>
      <p className="field-label">{label}</p>
      {filled.length === 0 ? (
        <p className="text-[15px] text-ink-400 italic">Not provided</p>
      ) : (
        <ol className="list-decimal list-inside space-y-1 text-[15px] text-ink-700">
          {filled.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      )}
    </div>
  )
}

function ReflectionReadout({ reflection: r }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ReadField label="Department" value={r.department} />
        <ReadField label="Clinical Area" value={r.clinical_area} />
        <ReadField label="Patient Code" value={r.patient_code} />
        <ReadField label="Age / Sex" value={r.age_sex} />
        <ReadField label="Student/s Involved" value={r.students_involved} />
        <ReadField label="Student Role/s" value={r.student_roles} />
      </div>
      <ReadField label="Brief Case Summary" value={r.case_summary} />
      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Key History and Physical Examination Findings</p>
        <div className="space-y-4">
          <ReadField label="Pertinent positives" value={r.pertinent_positives} />
          <ReadField label="Pertinent negatives" value={r.pertinent_negatives} />
          <ReadField label="Relevant physical examination findings" value={r.physical_exam_findings} />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Clinical Reasoning</p>
        <div className="space-y-4">
          <ReadList label="Problem list" items={r.problem_list} />
          <ReadList label="Differential diagnoses" items={r.differential_diagnoses} />
          <ReadField label="Suggested diagnostics / work-up" value={r.suggested_workup} />
          <ReadField label="Initial management priorities" value={r.management_priorities} />
          <ReadField label="Referral or disposition considerations" value={r.disposition_considerations} />
        </div>
      </div>
      <ReadList label="Group Learning Points" items={r.group_learning_points} />
      <div>
        <p className="text-sm font-semibold text-ink-800 mb-3">Group Reflection</p>
        <div className="space-y-4">
          <ReadField label="What did we do well as a group?" value={r.reflection_went_well} />
          <ReadField label="What was difficult or challenging?" value={r.reflection_challenges} />
          <ReadField label="What should we improve before clerkship?" value={r.reflection_improvements} />
        </div>
      </div>
    </div>
  )
}
