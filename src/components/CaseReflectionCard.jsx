import { useState } from 'react'
import { Area, Button, IconTrash, ListField } from './ui'
import Pullquote from './Pullquote'
import SectionLabel from './SectionLabel'
import { underlinedField } from '../lib/pdf'
import { roleLabel } from '../lib/caseLog'

const emptyContent = {
  brief_summary: '',
  pertinent_positives: '',
  pertinent_negatives: '',
  pe_findings: '',
  problem_list: [],
  differential_diagnoses: [],
  workup: '',
  management_priorities: '',
  referral_considerations: '',
  group_learning_points: [],
  group_did_well: '',
  group_challenges: '',
  group_improvements: '',
}

/** The editable content of a Selected Case Reflection. Department, Clinical
 * Area, Patient Code, Age/Sex, and Student/s Involved come from the linked
 * Case Log Census entry and are never part of this form. */
export function CaseReflectionForm({ values, onChange }) {
  function set(key, val) {
    onChange({ ...values, [key]: val })
  }

  return (
    <div className="space-y-8">
      <Area
        label="Brief Case Summary"
        hint="Provide a short, non-identifying summary of the case."
        value={values.brief_summary}
        onChange={(e) => set('brief_summary', e.target.value)}
        minRows={3}
      />

      <div>
        <p className="text-sm font-semibold text-ink-900 mb-3">Key History and Physical Examination Findings</p>
        <div className="space-y-4">
          <Area label="Pertinent positives" value={values.pertinent_positives} onChange={(e) => set('pertinent_positives', e.target.value)} minRows={2} />
          <Area label="Pertinent negatives" value={values.pertinent_negatives} onChange={(e) => set('pertinent_negatives', e.target.value)} minRows={2} />
          <Area label="Relevant physical examination findings" value={values.pe_findings} onChange={(e) => set('pe_findings', e.target.value)} minRows={2} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-900 mb-3">Clinical Reasoning</p>
        <div className="space-y-4">
          <ListField label="Problem list" items={values.problem_list} onChange={(next) => set('problem_list', next)} placeholder="e.g., Acute abdominal pain" addLabel="Add problem" />
          <ListField label="Differential diagnoses" items={values.differential_diagnoses} onChange={(next) => set('differential_diagnoses', next)} placeholder="e.g., Appendicitis" addLabel="Add diagnosis" />
          <Area label="Suggested diagnostics/work-up" value={values.workup} onChange={(e) => set('workup', e.target.value)} minRows={2} />
          <Area label="Initial management priorities" value={values.management_priorities} onChange={(e) => set('management_priorities', e.target.value)} minRows={2} />
          <Area label="Referral or disposition considerations" value={values.referral_considerations} onChange={(e) => set('referral_considerations', e.target.value)} minRows={2} />
        </div>
      </div>

      <ListField label="Group Learning Points" items={values.group_learning_points} onChange={(next) => set('group_learning_points', next)} placeholder="e.g., Recognize red-flag signs early" addLabel="Add learning point" />

      <div>
        <p className="text-sm font-semibold text-ink-900 mb-3">Group Reflection</p>
        <div className="space-y-4">
          <Area label="What did we do well as a group?" value={values.group_did_well} onChange={(e) => set('group_did_well', e.target.value)} minRows={2} />
          <Area label="What was difficult or challenging?" value={values.group_challenges} onChange={(e) => set('group_challenges', e.target.value)} minRows={2} />
          <Area label="What should we improve before clerkship?" value={values.group_improvements} onChange={(e) => set('group_improvements', e.target.value)} minRows={2} />
        </div>
      </div>
    </div>
  )
}

function numberedLines(items) {
  return items.length ? items.map((item, i) => `${i + 1}. ${item}`) : ['—']
}

async function exportReflectionPdf(reflection, caseEntry) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 50
  const lineEndX = pageWidth - marginX
  const maxWidth = lineEndX - marginX
  let y = 60

  function ensureRoom(nextLineCount) {
    if (y + nextLineCount * 13 > pageHeight - 50) {
      doc.addPage()
      y = 50
    }
  }

  function writeParagraph(label, value) {
    ensureRoom(2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(label, marginX, y)
    y += 15
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(value || '—', maxWidth)
    ensureRoom(lines.length)
    doc.text(lines, marginX, y)
    y += lines.length * 13 + 14
  }

  function writeList(label, items) {
    ensureRoom(2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(label, marginX, y)
    y += 15
    doc.setFont('helvetica', 'normal')
    numberedLines(items).forEach((line) => {
      const lines = doc.splitTextToSize(line, maxWidth)
      ensureRoom(lines.length)
      doc.text(lines, marginX, y)
      y += lines.length * 13
    })
    y += 14
  }

  function writeSectionHeading(label) {
    ensureRoom(2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(label, marginX, y)
    y += 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('SELECTED CASE REFLECTION', pageWidth / 2, y, { align: 'center' })
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('USM College of Medicine', pageWidth / 2, y, { align: 'center' })
  y += 14
  doc.text('Clinical Rotation – SY 2026–2027', pageWidth / 2, y, { align: 'center' })
  y += 32

  doc.setFontSize(10)
  underlinedField(doc, 'Selected Case Reflection No.:', reflection.reflection_no, marginX, y, lineEndX)
  y += 20
  underlinedField(doc, 'Department:', caseEntry?.department, marginX, y, lineEndX)
  y += 20
  underlinedField(doc, 'Clinical Area:', caseEntry?.clinical_area, marginX, y, lineEndX)
  y += 20
  underlinedField(doc, 'Patient Code:', caseEntry?.patient_code, marginX, y, lineEndX)
  y += 20
  underlinedField(doc, 'Age/Sex:', caseEntry?.age_sex, marginX, y, lineEndX)
  y += 20
  underlinedField(doc, 'Student/s Involved:', caseEntry?.student_assigned, marginX, y, lineEndX)
  y += 20
  underlinedField(doc, 'Student Role/s:', caseEntry ? roleLabel(caseEntry) : '', marginX, y, lineEndX)
  y += 32

  writeParagraph('Brief Case Summary', reflection.brief_summary)

  writeSectionHeading('Key History and Physical Examination Findings')
  writeParagraph('Pertinent positives:', reflection.pertinent_positives)
  writeParagraph('Pertinent negatives:', reflection.pertinent_negatives)
  writeParagraph('Relevant physical examination findings:', reflection.pe_findings)

  writeSectionHeading('Clinical Reasoning')
  writeList('Problem list:', reflection.problem_list)
  writeList('Differential diagnoses:', reflection.differential_diagnoses)
  writeParagraph('Suggested diagnostics/work-up:', reflection.workup)
  writeParagraph('Initial management priorities:', reflection.management_priorities)
  writeParagraph('Referral or disposition considerations:', reflection.referral_considerations)

  writeList('Group Learning Points', reflection.group_learning_points)

  writeSectionHeading('Group Reflection')
  writeParagraph('What did we do well as a group?', reflection.group_did_well)
  writeParagraph('What was difficult or challenging?', reflection.group_challenges)
  writeParagraph('What should we improve before clerkship?', reflection.group_improvements)

  doc.save(`selected_case_reflection_${reflection.reflection_no}.pdf`)
}

/** Case metadata pulled from the linked Case Log Census entry, rendered as
 * a magazine-byline strip (label: value · label: value) rather than a form
 * grid, since it's locked, reference-only context for the reflection below. */
function LockedStrip({ caseEntry }) {
  const items = [
    ['Department', caseEntry?.department],
    ['Clinical Area', caseEntry?.clinical_area],
    ['Patient Code', caseEntry?.patient_code],
    ['Age/Sex', caseEntry?.age_sex],
    ['Student/s Involved', caseEntry?.student_assigned],
    ['Student Role/s', caseEntry ? roleLabel(caseEntry) : ''],
  ].filter(([, value]) => value)

  if (!items.length) {
    return <p className="text-sm text-ink-400 italic">No linked case log entry yet.</p>
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-ink-600">
      {items.map(([label, value], i) => (
        <span key={label} className="inline-flex items-center gap-2.5">
          {i > 0 && <span className="text-ink-200">·</span>}
          <span className="text-ink-400">{label}:</span> {value}
        </span>
      ))}
    </div>
  )
}

export default function CaseReflectionCard({ reflection, caseEntry, onSave, onDelete, defaultOpen = false, defaultEditing = false }) {
  const [open, setOpen] = useState(defaultOpen || defaultEditing)
  const [editing, setEditing] = useState(defaultEditing)
  const [draft, setDraft] = useState({ ...emptyContent, ...reflection })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [exporting, setExporting] = useState(false)

  const summaryLine = caseEntry
    ? [caseEntry.department, caseEntry.clinical_area, caseEntry.chief_complaint].filter(Boolean).join(' · ')
    : ''

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await onSave({
      brief_summary: draft.brief_summary,
      pertinent_positives: draft.pertinent_positives,
      pertinent_negatives: draft.pertinent_negatives,
      pe_findings: draft.pe_findings,
      problem_list: draft.problem_list,
      differential_diagnoses: draft.differential_diagnoses,
      workup: draft.workup,
      management_priorities: draft.management_priorities,
      referral_considerations: draft.referral_considerations,
      group_learning_points: draft.group_learning_points,
      group_did_well: draft.group_did_well,
      group_challenges: draft.group_challenges,
      group_improvements: draft.group_improvements,
    })
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this reflection? This cannot be undone.')) {
      onDelete()
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportReflectionPdf(reflection, caseEntry)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative bg-white border border-ink-200/60 rounded-2xl card-shadow-lg overflow-hidden">
      <span className="accent-bar-top" />
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
        <div className="px-5 sm:px-7 pb-7 pt-1 border-t border-ink-100 space-y-6">
          <div className="pt-6">
            <LockedStrip caseEntry={caseEntry} />
          </div>

          {editing ? (
            <div className="space-y-6">
              <CaseReflectionForm values={draft} onChange={setDraft} />
              {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="outline" onClick={() => { setDraft({ ...emptyContent, ...reflection }); setEditing(false) }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ReflectionReadout reflection={reflection} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setDraft({ ...emptyContent, ...reflection }); setEditing(true) }}>Edit Reflection</Button>
                <Button variant="outline" onClick={handleExport} disabled={exporting}>
                  {exporting ? 'Preparing PDF…' : 'Export to PDF'}
                </Button>
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
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      <p className="text-sm text-ink-500 whitespace-pre-line mt-1">{value || <span className="text-ink-400 italic">Not provided</span>}</p>
    </div>
  )
}

function ReadList({ label, items }) {
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
function ReadCallout({ label, items }) {
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

function ReflectionReadout({ reflection: r }) {
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
