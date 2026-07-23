import { Navigate, useParams } from 'react-router-dom'
import { Area, LoadState, PageHeader, SaveStatus, Section } from '../components/ui'
import { departmentBySlug } from '../data/departments'
import { useDepartmentNotes } from '../lib/useDepartmentNotes'

const fields = [
  { key: 'objectives', title: 'Department-Specific Objectives' },
  { key: 'cases', title: 'Cases Seen or Discussed' },
  { key: 'conditions', title: 'Common Conditions Encountered' },
  { key: 'skills', title: 'Skills Observed or Practiced' },
  { key: 'learning_points', title: 'Key Learning Points' },
  { key: 'reflection', title: 'Department-Specific Reflection' },
]
const sectionKeys = fields.map((f) => f.key)

export default function DepartmentPage() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)
  if (!dept) return <Navigate to="/" replace />
  // Key forces a full remount on slug change so hook state never leaks
  // stale content from the previously-viewed department.
  return <DepartmentPageContent key={slug} slug={slug} dept={dept} />
}

function DepartmentPageContent({ slug, dept }) {
  const { values, status, saveState, setSection } = useDepartmentNotes(slug, sectionKeys)

  return (
    <div>
      <PageHeader eyebrow="Department" title={dept.name} description={dept.blurb} />

      <LoadState status={status} error="Couldn't load this department's notes.">
        <div className="space-y-6">
          {fields.map((f) => (
            <Section key={f.key} title={f.title}>
              <Area
                value={values[f.key] ?? ''}
                onChange={(e) => setSection(f.key, e.target.value)}
                minRows={f.key === 'objectives' || f.key === 'reflection' ? 4 : 3}
              />
            </Section>
          ))}
          <div className="h-4"><SaveStatus state={saveState} /></div>
        </div>
      </LoadState>
    </div>
  )
}
