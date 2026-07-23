import { Navigate, useParams } from 'react-router-dom'
import { Area, PageHeader, Section } from '../components/ui'
import { departmentBySlug } from '../data/departments'
import { useLocalStorage } from '../lib/useLocalStorage'

const fields = [
  {
    key: 'objectives',
    title: 'Department-Specific Objectives',
    placeholder: (name) => `What the group aimed to learn during the ${name} rotation.`,
  },
  {
    key: 'cases',
    title: 'Cases Seen or Discussed',
    placeholder: () => 'Summarize, using patient codes only, the cases the group encountered in this department.',
  },
  {
    key: 'conditions',
    title: 'Common Conditions Encountered',
    placeholder: (name) => `List and briefly describe the conditions most frequently seen in ${name}.`,
  },
  {
    key: 'skills',
    title: 'Skills Observed or Practiced',
    placeholder: () => 'History-taking, physical exam maneuvers, procedures, or other skills exercised here.',
  },
  {
    key: 'learningPoints',
    title: 'Key Learning Points',
    placeholder: () => 'The most important clinical or professional takeaways from this department.',
  },
  {
    key: 'reflection',
    title: 'Department-Specific Reflection',
    placeholder: (name) => `As a group, reflect on the experience in ${name} — what stood out, and why.`,
  },
]

export default function DepartmentPage() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)

  const initial = Object.fromEntries(fields.map((f) => [f.key, '']))
  const [values, setValues] = useLocalStorage(`department.${slug}`, initial)

  if (!dept) return <Navigate to="/" replace />

  function update(key, val) {
    setValues({ ...values, [key]: val })
  }

  return (
    <div>
      <PageHeader eyebrow="Department" title={dept.name} description={dept.blurb} />

      <div className="space-y-6">
        {fields.map((f) => (
          <Section key={f.key} title={f.title}>
            <Area
              placeholder={f.placeholder(dept.name)}
              value={values[f.key] ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
              minRows={f.key === 'objectives' || f.key === 'reflection' ? 4 : 3}
            />
          </Section>
        ))}
      </div>
    </div>
  )
}
