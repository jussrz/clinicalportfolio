import { useEffect, useMemo, useState } from 'react'
import { Section, Notice, Field, FieldRow, SelectField, Button, IconPlus, LoadState, Modal, SaveStatus, Table, Th } from '../components/ui'
import PageHero from '../components/PageHero'
import BarBreakdown from '../components/BarBreakdown'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { useCaseStats } from '../lib/useCaseStats'
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

function CaseLogRow({ row, index, onSelect }) {
  return (
    <tr onClick={() => onSelect(row)} className="cursor-pointer">
      <td className="text-ink-400">{index + 1}</td>
      <td className="whitespace-nowrap">{row.date_seen || '—'}</td>
      <td>{row.department || '—'}</td>
      <td>{row.clinical_area || '—'}</td>
      <td>{row.patient_code || '—'}</td>
      <td>{row.age_sex || '—'}</td>
      <td>{row.chief_complaint || '—'}</td>
      <td>{row.working_diagnosis || '—'}</td>
      <td className="whitespace-nowrap">{roleLabel(row) || '—'}</td>
      <td>{row.student_assigned || '—'}</td>
    </tr>
  )
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="text-sm text-ink-800 mt-1">{value || <span className="text-ink-300 italic">—</span>}</p>
    </div>
  )
}

/** View/edit modal for a single case entry, opened by clicking its table
 * row. Edit swaps the same modal's body into the CaseLogFields form in
 * place (Save/Cancel) rather than opening a second modal. "Export to PDF"
 * is the page's existing whole-census export, unchanged. */
function CaseLogDetailModal({ entry, onSave, onDelete, onClose, onExport, exporting }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry ?? emptyEntry)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    setDraft(entry ?? emptyEntry)
    setEditing(false)
    setSaveError(null)
  }, [entry])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await onSave(normalizeEntry(draft))
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this case log entry? This cannot be undone.')) {
      onDelete()
    }
  }

  return (
    <Modal open={Boolean(entry)} onClose={onClose} title={editing ? 'Edit Case Entry' : 'Case Entry'}>
      {editing ? (
        <div className="space-y-6">
          <CaseLogFields values={draft} onChange={setDraft} />
          {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button variant="outline" onClick={() => { setDraft(entry ?? emptyEntry); setEditing(false) }}>Cancel</Button>
          </div>
        </div>
      ) : (
        entry && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Date Seen" value={entry.date_seen} />
              <DetailField label="Department" value={entry.department} />
              <DetailField label="Clinical Area" value={entry.clinical_area} />
              <DetailField label="Patient Code" value={entry.patient_code} />
              <DetailField label="Age/Sex" value={entry.age_sex} />
              <DetailField label="Student Assigned" value={entry.student_assigned} />
              <DetailField label="Student Role" value={roleLabel(entry)} />
            </div>
            <DetailField label="Chief Complaint / Reason for Consult" value={entry.chief_complaint} />
            <DetailField label="Working Diagnosis" value={entry.working_diagnosis} />
            <div className="flex flex-wrap gap-2 pt-2 border-t border-ink-100">
              <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        )
      )}
    </Modal>
  )
}

export default function CaseLogCensus() {
  const { record, status: metaStatus, saveState, setField } = useSupabaseRecord('group_metadata', 1)
  const { rows, status, error, insert, update, remove } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })
  const stats = useCaseStats()
  const [addOpen, setAddOpen] = useState(false)
  const [newEntry, setNewEntry] = useState(emptyEntry)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [exporting, setExporting] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null

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

  async function handleUpdateSelected(patch) {
    return update(selectedRow.id, patch)
  }

  async function handleDeleteSelected() {
    await remove(selectedRow.id)
    setSelectedRowId(null)
  }

  const sortState = { key: sortKey, dir: sortDir }

  return (
    <div>
      <PageHero
        compact
        eyebrow="Group Case Log Census"
        title="Clinical Rotation Case Log Census"
        description="USM College of Medicine · Clinical Rotation – SY 2026–2027"
      />

      <div className="space-y-6">
        <Notice tone="amber" title="Confidentiality reminder">
          Use patient codes only. Do not include patient names, hospital numbers, addresses,
          contact numbers, photos, or any identifying information.
        </Notice>

        {stats.departmentBreakdown.length > 0 && (
          <Section title="Case Mix at a Glance">
            <BarBreakdown items={stats.departmentBreakdown} />
          </Section>
        )}

        <Section
          title={`Case Log (${rows.length} ${rows.length === 1 ? 'entry' : 'entries'})`}
          actions={
            <Button variant="outline" onClick={handleExportPdf} disabled={rows.length === 0 || exporting}>
              {exporting ? 'Preparing PDF…' : 'Export to PDF'}
            </Button>
          }
        >
          <LoadState status={status} error={error}>
            {rows.length === 0 ? (
              <p className="text-sm text-ink-400 italic py-4">No entries yet — add a case below.</p>
            ) : (
              <Table minWidth="880px">
                <thead>
                  <tr>
                    <th>No.</th>
                    <Th sortKey="date_seen" sortState={sortState} onSort={toggleSort}>Date Seen</Th>
                    <Th sortKey="department" sortState={sortState} onSort={toggleSort}>Department</Th>
                    <th>Clinical Area</th>
                    <th>Patient Code</th>
                    <th>Age/Sex</th>
                    <th>Chief Complaint</th>
                    <th>Working Diagnosis</th>
                    <th>Student Role</th>
                    <th>Student Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, i) => (
                    <CaseLogRow key={row.id} row={row} index={i} onSelect={(r) => setSelectedRowId(r.id)} />
                  ))}
                </tbody>
              </Table>
            )}
          </LoadState>
        </Section>

        {addOpen ? (
          <Section
            title="Add Case Entry"
            actions={<Button variant="outline" onClick={() => setAddOpen(false)}>-</Button>}
          >
            <LoadState status={metaStatus === 'error' ? 'error' : 'ready'} error="Couldn't load group information.">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-ink-900 mb-3">Header Information</p>
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
                </div>

                <div className="border-t border-ink-100 pt-6">
                  <p className="text-sm font-semibold text-ink-900 mb-3">Case Entry</p>
                  <CaseLogFields values={newEntry} onChange={setNewEntry} />
                  {addError && <p className="text-sm text-red-600 mt-3">Failed to save: {addError}</p>}
                  <Button className="mt-4" onClick={handleAdd} disabled={adding}>
                    <IconPlus /> {adding ? 'Adding…' : 'Add Entry'}
                  </Button>
                </div>
              </div>
            </LoadState>
          </Section>
        ) : (
          <Button onClick={() => setAddOpen(true)}>
            <IconPlus /> Add Case Entry
          </Button>
        )}
      </div>

      <CaseLogDetailModal
        entry={selectedRow}
        onSave={handleUpdateSelected}
        onDelete={handleDeleteSelected}
        onClose={() => setSelectedRowId(null)}
        onExport={handleExportPdf}
        exporting={exporting}
      />
    </div>
  )
}
