import { PageHeader, Section, Notice } from '../components/ui'
import { DataTable } from '../components/DataTable'
import { departments } from '../data/departments'
import { useLocalStorage } from '../lib/useLocalStorage'

const columns = [
  { key: 'patientCode', label: 'Patient Code', width: '11%', placeholder: 'e.g., PT-014' },
  { key: 'ageSex', label: 'Age / Sex', width: '9%', placeholder: 'e.g., 34/F' },
  {
    key: 'department',
    label: 'Department',
    width: '16%',
    type: 'select',
    options: departments.map((d) => d.name),
    placeholder: 'Select department',
  },
  { key: 'setting', label: 'Clinical Setting', width: '13%', placeholder: 'e.g., Ward, OPD, community' },
  { key: 'diagnosis', label: 'Chief Complaint / Diagnosis', width: '20%', placeholder: 'Non-identifying description' },
  { key: 'date', label: 'Date', width: '10%', placeholder: 'DD/MM/YYYY' },
  {
    key: 'role',
    label: 'Role',
    width: '11%',
    type: 'select',
    options: ['Observed', 'Assisted', 'Interviewed', 'Presented', 'Managed with supervision'],
    placeholder: 'Select role',
  },
]

export default function CaseLogCensus() {
  const [rows, setRows] = useLocalStorage('caselog.rows', [])

  return (
    <div>
      <PageHeader
        eyebrow="Group Case Log Census"
        title="Group Case Log Census"
        description="A summary of cases seen, observed, discussed, or participated in during hospital or community rotations."
      />

      <div className="space-y-6">
        <Notice tone="amber" title="Confidentiality reminder">
          Use patient codes only. Do not include patient names, hospital numbers, addresses,
          contact numbers, photos, or any other identifying information.
        </Notice>

        <Section title={`Case Log (${rows.length} ${rows.length === 1 ? 'entry' : 'entries'})`}>
          <DataTable
            columns={columns}
            rows={rows}
            onChange={setRows}
            addLabel="Add case entry"
            emptyRow={{ patientCode: '', ageSex: '', department: '', setting: '', diagnosis: '', date: '', role: '' }}
          />
        </Section>
      </div>
    </div>
  )
}
