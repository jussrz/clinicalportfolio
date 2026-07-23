import { Area, PageHeader, Section } from '../components/ui'
import { DataTable } from '../components/DataTable'
import { useLocalStorage } from '../lib/useLocalStorage'

const columns = [
  { key: 'date', label: 'Date', width: '12%', placeholder: 'DD/MM/YYYY' },
  { key: 'source', label: 'Source', width: '18%', placeholder: 'e.g., Consultant, resident' },
  { key: 'feedback', label: 'Feedback Received', width: '35%', placeholder: 'What was said' },
  { key: 'action', label: 'Action Taken', width: '35%', placeholder: 'How the group responded' },
]

export default function FeedbackActionPlan() {
  const [rows, setRows] = useLocalStorage('feedback.rows', [])
  const [reflection, setReflection] = useLocalStorage('feedback.reflection', '')

  return (
    <div>
      <PageHeader
        eyebrow="Feedback and Action Plan"
        title="Feedback &amp; Action Plan"
        description="This page documents feedback received by the group and the group's response."
      />

      <div className="space-y-6">
        <Section title="Feedback Log">
          <DataTable
            columns={columns}
            rows={rows}
            onChange={setRows}
            addLabel="Add feedback entry"
            emptyRow={{ date: '', source: '', feedback: '', action: '' }}
          />
        </Section>

        <Section title="Reflection">
          <Area
            label="What feedback was most helpful to our group, and what specific changes did we make after receiving it?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            minRows={4}
          />
        </Section>
      </div>
    </div>
  )
}
