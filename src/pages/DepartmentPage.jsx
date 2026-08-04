import { Navigate, useParams } from 'react-router-dom'
import { EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import PromptGroup from '../components/PromptGroup'
import { departmentBySlug } from '../data/departments'
import { useDepartmentNotes } from '../lib/useDepartmentNotes'
import { useEditableFields } from '../lib/useEditableFields'

const fields = [
  { key: 'objectives', label: 'Department-Specific Objectives', minRows: 4 },
  { key: 'cases', label: 'Cases Seen or Discussed', minRows: 3 },
  { key: 'conditions', label: 'Common Conditions Encountered', minRows: 3 },
  { key: 'skills', label: 'Skills Observed or Practiced', minRows: 3 },
  { key: 'learning_points', label: 'Key Learning Points', minRows: 3 },
  { key: 'reflection', label: 'Department-Specific Reflection', minRows: 4 },
]
const sectionKeys = fields.map((f) => f.key)

export default function DepartmentPage() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)
  if (!dept) return <Navigate to="/studio" replace />
  // Key forces a full remount on slug change so hook state never leaks
  // stale content from the previously-viewed department.
  return <DepartmentPageContent key={slug} slug={slug} dept={dept} />
}

function DepartmentPageContent({ slug, dept }) {
  const { values, status, saveState, setSection, flush } = useDepartmentNotes(slug, sectionKeys)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(values, setSection, flush)

  return (
    <div>
      <PageHero
        eyebrow="Department"
        title={dept.name}
        description={dept.blurb}
        image={dept.image}
        actions={<PageActions editing={editing} onEdit={start} />}
      />

      <Reveal>
        <Section variant="showcase">
          <LoadState status={status} error="Couldn't load this department's notes.">
            <div className="space-y-8">
              <PromptGroup prompts={fields} values={editing ? draft : values} editing={editing} onChange={set} />
              <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
            </div>
          </LoadState>
        </Section>
      </Reveal>
    </div>
  )
}
