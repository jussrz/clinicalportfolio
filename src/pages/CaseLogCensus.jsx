import { useMemo, useState } from 'react'
import { Section, Notice, Field, FieldRow, SelectField, Button, IconPlus, IconTrash, LoadState, SaveStatus } from '../components/ui'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { DEPARTMENT_OPTIONS, CLINICAL_AREA_OPTIONS } from '../data/options'
import { formatDateRange } from '../lib/date'
import { underlinedField } from '../lib/pdf'
import { roleLabel } from '../lib/caseLog'

const STUDENT_ROLE_OPTIONS = ['Observed only', 'Assisted in ___', 'Performed Hx taking', 'Performed PE']

const emptyEntry = {
  date_seen: '',
  department: '',
  clinical_area: '',
  patient_code: '',
  age_sex: '',
  chief_complaint: '',
  working_diagnosis: '',
  student_role: '',
  student_role_detail: '',
  student_assigned: '',
}

// Postgres' `date` column rejects an empty string (only null or a real
// date); the <input type="date"> gives '' when left blank, so normalize
// before every insert/update.
function normalizeEntry(entry) {
  return { ...entry, date_seen: entry.date_seen || null }
}

function CaseLogFields({ values, onChange }) {
  function set(key, val) {
    onChange({ ...values, [key]: val })
  }
  return (
    <div className="space-y-4">
      <FieldRow cols={3}>
        <Field type="date" label="Date Seen" value={values.date_seen} onChange={(e) => set('date_seen', e.target.value)} />
        <SelectField label="Department" value={values.department} onChange={(e) => set('department', e.target.value)}>
          <option value="" disabled>Select department</option>
          {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </SelectField>
        <SelectField label="Clinical Area" value={values.clinical_area} onChange={(e) => set('clinical_area', e.target.value)}>
          <option value="" disabled>Select area</option>
          {CLINICAL_AREA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </SelectField>
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Patient Code" placeholder="e.g., Pt-001, no real identifiers" value={values.patient_code} onChange={(e) => set('patient_code', e.target.value)} />
        <Field label="Age/Sex" placeholder="e.g., 45/M" value={values.age_sex} onChange={(e) => set('age_sex', e.target.value)} />
        <Field label="Student Assigned" value={values.student_assigned} onChange={(e) => set('student_assigned', e.target.value)} />
      </FieldRow>
      <FieldRow>
        <Field label="Chief Complaint / Reason for Consult" value={values.chief_complaint} onChange={(e) => set('chief_complaint', e.target.value)} />
        <Field label="Working Diagnosis" value={values.working_diagnosis} onChange={(e) => set('working_diagnosis', e.target.value)} />
      </FieldRow>
      <FieldRow>
        <SelectField label="Student Role" value={values.student_role} onChange={(e) => set('student_role', e.target.value)}>
          <option value="" disabled>Select role</option>
          {STUDENT_ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </SelectField>
        {values.student_role === 'Assisted in ___' && (
          <Field
            label="Specify what was assisted"
            placeholder="e.g., wound dressing"
            value={values.student_role_detail}
            onChange={(e) => set('student_role_detail', e.target.value)}
          />
        )}
      </FieldRow>
    </div>
  )
}

async function exportPdf(rows, record) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 42

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('CLINICAL ROTATION CASE LOG CENSUS', pageWidth / 2, y, { align: 'center' })
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('USM College of Medicine', pageWidth / 2, y, { align: 'center' })
  y += 14
  doc.text('Clinical Rotation – SY 2026–2027', pageWidth / 2, y, { align: 'center' })
  y += 26

  doc.setFontSize(10)
  underlinedField(doc, 'Group:', record.group_name || '', 40, y, 260)
  y += 18
  underlinedField(doc, 'Rotation Block:', record.rotation_block || '', 40, y, 260)
  y += 18
  underlinedField(doc, 'Inclusive Dates:', formatDateRange(record.inclusive_date_start, record.inclusive_date_end), 40, y, 320)
  y += 22

  autoTable(doc, {
    startY: y,
    head: [[
      'No.', 'Date Seen', 'Department', 'Clinical area', 'Patient Code', 'Age/Sex',
      'Chief complaint/Reason for Consult', 'Working Diagnosis', 'Student Role', 'Student Assigned',
    ]],
    body: rows.map((row, i) => [
      i + 1,
      row.date_seen || '',
      row.department || '',
      row.clinical_area || '',
      row.patient_code || '',
      row.age_sex || '',
      row.chief_complaint || '',
      row.working_diagnosis || '',
      roleLabel(row),
      row.student_assigned || '',
    ]),
    styles: { fontSize: 8, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.5, textColor: [0, 0, 0] },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    theme: 'grid',
  })

  const finalY = doc.lastAutoTable.finalY + 40
  doc.setFontSize(10)
  underlinedField(doc, 'Faculty/Preceptor Signature:', '', 40, finalY, 320)
  underlinedField(doc, 'Date:', '', 40, finalY + 26, 220)

  doc.save('case_log_census.pdf')
}

function CaseLogRow({ row, index, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(row)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await onUpdate(row.id, normalizeEntry(draft))
    setSaving(false)
    if (!error) setEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this case log entry? This cannot be undone.')) {
      onDelete(row.id)
    }
  }

  if (editing) {
    return (
      <tr className="border-b border-ink-100 bg-ink-50">
        <td colSpan={11} className="p-4">
          <CaseLogFields values={draft} onChange={setDraft} />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button variant="outline" onClick={() => { setDraft(row); setEditing(false) }}>Cancel</Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-ink-100 last:border-0">
      <td className="py-2 pr-2 text-xs text-ink-500">{index + 1}</td>
      <td className="py-2 pr-2 text-xs text-ink-700 whitespace-nowrap">{row.date_seen || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.department || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.clinical_area || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.patient_code || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.age_sex || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.chief_complaint || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.working_diagnosis || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{roleLabel(row) || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{row.student_assigned || '—'}</td>
      <td className="py-2 pr-1">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-brand-700 hover:text-brand-800 px-2 py-1">
            Edit
          </button>
          <button type="button" onClick={handleDelete} aria-label="Delete row" className="w-7 h-7 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors">
            <IconTrash />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function CaseLogCensus() {
  const { record, status: metaStatus, saveState, setField } = useSupabaseRecord('group_metadata', 1)
  const { rows, status, error, insert, update, remove } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })
  const [newEntry, setNewEntry] = useState(emptyEntry)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [exporting, setExporting] = useState(false)

  async function handleExportPdf() {
    setExporting(true)
    try {
      await exportPdf(sortedRows, record)
    } finally {
      setExporting(false)
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return copy
  }, [rows, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  async function handleAdd() {
    setAdding(true)
    setAddError(null)
    const { error: insertError } = await insert(normalizeEntry(newEntry))
    setAdding(false)
    if (insertError) {
      setAddError(insertError.message)
      return
    }
    setNewEntry(emptyEntry)
  }

  const sortHeader = (label, key) => (
    <th
      className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2 whitespace-nowrap cursor-pointer select-none hover:text-brand-700"
      onClick={() => toggleSort(key)}
    >
      {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
          Group Case Log Census
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 uppercase tracking-wide">
          Clinical Rotation Case Log Census
        </h1>
        <p className="text-[15px] text-ink-600 mt-1">USM College of Medicine</p>
        <p className="text-[15px] text-ink-600">Clinical Rotation – SY 2026–2027</p>
      </div>

      <div className="space-y-6">
        <Section title="Header Information">
          <LoadState status={metaStatus === 'error' ? 'error' : 'ready'} error="Couldn't load group information.">
            <div className="space-y-4">
              <FieldRow cols={2}>
                <Field label="Group" value={record.group_name ?? ''} onChange={(e) => setField('group_name', e.target.value)} />
                <Field label="Rotation Block" value={record.rotation_block ?? ''} onChange={(e) => setField('rotation_block', e.target.value)} />
              </FieldRow>
              <div>
                <FieldRow cols={2}>
                  <Field
                    type="date"
                    label="Inclusive Dates — From"
                    value={record.inclusive_date_start ?? ''}
                    onChange={(e) => setField('inclusive_date_start', e.target.value || null)}
                  />
                  <Field
                    type="date"
                    label="Inclusive Dates — To"
                    value={record.inclusive_date_end ?? ''}
                    onChange={(e) => setField('inclusive_date_end', e.target.value || null)}
                  />
                </FieldRow>
                {(record.inclusive_date_start || record.inclusive_date_end) && (
                  <p className="text-sm text-ink-500 mt-2">
                    {formatDateRange(record.inclusive_date_start, record.inclusive_date_end)}
                  </p>
                )}
              </div>
              <p className="text-xs text-ink-400">
                Faculty/Preceptor Signature and Date are signed by hand on the exported PDF, not entered here.
              </p>
              <div className="h-4"><SaveStatus state={saveState} /></div>
            </div>
          </LoadState>
        </Section>

        <Notice tone="amber" title="Confidentiality reminder">
          Use patient codes only. Do not include patient names, hospital numbers, addresses,
          contact numbers, photos, or any identifying information.
        </Notice>

        <Section title="Add Case Entry">
          <CaseLogFields values={newEntry} onChange={setNewEntry} />
          {addError && <p className="text-sm text-red-600 mt-3">Failed to save: {addError}</p>}
          <Button className="mt-4" onClick={handleAdd} disabled={adding}>
            <IconPlus /> {adding ? 'Adding…' : 'Add Entry'}
          </Button>
        </Section>

        <Section title={`Case Log (${rows.length} ${rows.length === 1 ? 'entry' : 'entries'})`}>
          <div className="flex justify-end mb-3">
            <Button variant="outline" onClick={handleExportPdf} disabled={rows.length === 0 || exporting}>
              {exporting ? 'Preparing PDF…' : 'Export to PDF'}
            </Button>
          </div>
          <LoadState status={status} error={error}>
            {rows.length === 0 ? (
              <p className="text-sm text-ink-400 italic py-4">No entries yet — add the group's first case above.</p>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
                <table className="w-full border-collapse min-w-[880px]">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">No.</th>
                      {sortHeader('Date Seen', 'date_seen')}
                      {sortHeader('Department', 'department')}
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Clinical Area</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Patient Code</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Age/Sex</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Chief Complaint</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Working Diagnosis</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Student Role</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Student Assigned</th>
                      <th className="border-b border-ink-200 pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, i) => (
                      <CaseLogRow key={row.id} row={row} index={i} onUpdate={update} onDelete={remove} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </LoadState>
        </Section>
      </div>
    </div>
  )
}
