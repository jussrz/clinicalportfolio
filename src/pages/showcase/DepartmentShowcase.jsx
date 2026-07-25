import { Navigate, useParams } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { departmentBySlug } from '../../data/departments'
import { useDepartmentNotes } from '../../lib/useDepartmentNotes'

const fields = [
  { key: 'objectives', title: 'Department-Specific Objectives' },
  { key: 'cases', title: 'Cases Seen or Discussed' },
  { key: 'conditions', title: 'Common Conditions Encountered' },
  { key: 'skills', title: 'Skills Observed or Practiced' },
  { key: 'learning_points', title: 'Key Learning Points' },
  { key: 'reflection', title: 'Department-Specific Reflection', feature: true },
]
const sectionKeys = fields.map((f) => f.key)

export default function DepartmentShowcase() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)
  if (!dept) return <Navigate to="/" replace />
  // Key forces a full remount on slug change so hook state never leaks
  // stale content from the previously-viewed department.
  return <DepartmentShowcaseContent key={slug} slug={slug} dept={dept} />
}

function DepartmentShowcaseContent({ slug, dept }) {
  const { values, status } = useDepartmentNotes(slug, sectionKeys)
  const hasContent = status === 'ready' && fields.some((f) => values[f.key])

  return (
    <div>
      <PageHero eyebrow="Department" title={dept.name} description={dept.blurb} image={dept.image} />

      {hasContent ? (
        <div className="space-y-6">
          {fields.map((f, i) => {
            if (!values[f.key]) return null
            return (
              <Reveal key={f.key} delay={i * 40}>
                <Section variant="showcase" title={f.title}>
                  <ShowcaseAnswer value={values[f.key]} feature={f.feature} />
                </Section>
              </Reveal>
            )
          })}
        </div>
      ) : (
        status === 'ready' && (
          <p className="text-sm text-ink-400 italic">
            Notes for this department will appear here once the group adds them.
          </p>
        )
      )}
    </div>
  )
}
