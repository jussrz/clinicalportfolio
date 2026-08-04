import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Section, Table, Modal } from './ui'
import { roleLabel } from '../lib/caseLog'
import { studentFullName } from '../data/group'

const shortFields = [
  { key: 'date_seen', label: 'Date Seen' },
  { key: 'department', label: 'Department' },
  { key: 'clinical_area', label: 'Clinical Area' },
  { key: 'patient_code', label: 'Patient Code' },
  { key: 'age_sex', label: 'Age / Sex' },
  { key: 'student_assigned', label: 'Student Assigned', format: (v) => (v ? studentFullName(v) : v) },
]

const longFields = [
  { key: 'chief_complaint', label: 'Chief Complaint' },
  { key: 'working_diagnosis', label: 'Working Diagnosis' },
]

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="text-sm text-ink-800 mt-1 break-words">{value || <span className="text-ink-300 italic">—</span>}</p>
    </div>
  )
}

/** The Group Case Log Census table, reusable wherever the full log needs to
 * appear — its own page, and inside Selected Case Reflections so viewers
 * can see every logged case alongside which ones have a reflection written
 * about them. Every row is clickable: rows with a `selectionMap` match jump
 * straight to that case's Selected Case Reflection; every other row opens a
 * modal with its full details, since the table itself only has room for a
 * few columns. `selectionMap` (case_log_entry id -> reflection id) is what
 * makes the "jump to reflection" behavior possible — omit it (the standalone
 * Group Case Log Census page does) and every row just opens its own detail
 * modal instead. */
export default function CaseLogTable({ rows, title, selectionMap }) {
  const navigate = useNavigate()
  const [detailRow, setDetailRow] = useState(null)

  function handleRowClick(row) {
    const reflectionId = selectionMap?.[row.id]
    if (reflectionId) {
      navigate(`/case-reflections/${reflectionId}`)
    } else {
      setDetailRow(row)
    }
  }

  return (
    <>
      <Section variant="showcase" title={title ?? `Full Case Log (${rows.length} ${rows.length === 1 ? 'entry' : 'entries'})`}>
        <Table minWidth="1180px">
          <thead>
            <tr>
              <th>No.</th>
              <th>Date Seen</th>
              <th>Department</th>
              <th>Clinical Area</th>
              <th>Patient Code</th>
              <th>Age/Sex</th>
              <th>Chief Complaint</th>
              <th>Working Diagnosis</th>
              <th>Student Role</th>
              <th>Student Assigned</th>
              {selectionMap && <th>Reflection</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const reflectionId = selectionMap?.[row.id]
              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer"
                >
                  <td className="text-ink-400">{i + 1}</td>
                  <td className="whitespace-nowrap">{row.date_seen || '—'}</td>
                  <td>{row.department || '—'}</td>
                  <td>{row.clinical_area || '—'}</td>
                  <td>{row.patient_code || '—'}</td>
                  <td>{row.age_sex || '—'}</td>
                  <td>{row.chief_complaint || '—'}</td>
                  <td>{row.working_diagnosis || '—'}</td>
                  <td>{roleLabel(row) || '—'}</td>
                  <td>{row.student_assigned ? studentFullName(row.student_assigned) : '—'}</td>
                  {selectionMap && (
                    <td className="whitespace-nowrap">
                      {reflectionId ? (
                        <span className="text-xs font-semibold text-brand-700">Selected</span>
                      ) : (
                        <span className="text-xs text-ink-300">View</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Section>

      <Modal
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        title={detailRow?.working_diagnosis || detailRow?.chief_complaint || 'Case Details'}
      >
        {detailRow && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
              {shortFields.map(({ key, label, format }) => (
                <DetailItem key={key} label={label} value={format ? format(detailRow[key]) : detailRow[key]} />
              ))}
            </div>
            <div className="space-y-4 pt-5 border-t border-ink-100">
              {longFields.map(({ key, label }) => (
                <DetailItem key={key} label={label} value={detailRow[key]} />
              ))}
            </div>
            {roleLabel(detailRow) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">Student Role</p>
                <span className="inline-block text-xs font-semibold bg-brand-50 text-brand-700 rounded-full px-3 py-1.5">
                  {roleLabel(detailRow)}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
