import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Section, Table, Modal } from './ui'
import { roleLabel } from '../lib/caseLog'

const detailFields = [
  { key: 'date_seen', label: 'Date Seen' },
  { key: 'department', label: 'Department' },
  { key: 'clinical_area', label: 'Clinical Area' },
  { key: 'patient_code', label: 'Patient Code' },
  { key: 'age_sex', label: 'Age / Sex' },
  { key: 'chief_complaint', label: 'Chief Complaint' },
  { key: 'working_diagnosis', label: 'Working Diagnosis' },
]

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
        <Table minWidth="880px">
          <thead>
            <tr>
              <th>No.</th>
              <th>Date Seen</th>
              <th>Department</th>
              <th>Clinical Area</th>
              <th>Chief Complaint</th>
              <th>Working Diagnosis</th>
              <th>Student Role</th>
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
                  <td>{row.chief_complaint || '—'}</td>
                  <td>{row.working_diagnosis || '—'}</td>
                  <td>{roleLabel(row) || '—'}</td>
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
          <dl className="space-y-3">
            {detailFields.map(({ key, label }) => (
              <div key={key}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-0.5">{label}</dt>
                <dd className="text-sm text-ink-700 leading-relaxed break-words">{detailRow[key] || '—'}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-0.5">Student Role</dt>
              <dd className="text-sm text-ink-700 leading-relaxed">{roleLabel(detailRow) || '—'}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </>
  )
}
