import { Area, ListField, PageHeader, Section } from '../components/ui'
import { DataTable } from '../components/DataTable'
import { departments } from '../data/departments'
import { useLocalStorage } from '../lib/useLocalStorage'

const scheduleColumns = [
  { key: 'dates', label: 'Dates', width: '20%', placeholder: 'e.g., Jul 1–14' },
  { key: 'department', label: 'Department / Site', width: '30%', placeholder: 'e.g., Pediatrics – Ward' },
  { key: 'notes', label: 'Notes', width: '50%', placeholder: 'Shift, preceptor, or focus area' },
]

const topicColumns = [
  { key: 'topic', label: 'Case Topic', width: '35%', placeholder: 'e.g., Dengue fever' },
  { key: 'department', label: 'Department', width: '30%', placeholder: 'e.g., Pediatrics' },
  { key: 'cycle', label: 'Rotation Cycle', width: '35%', placeholder: 'e.g., Cycle 2' },
]

export default function RotationOverview() {
  const [generalObjectives, setGeneralObjectives] = useLocalStorage('rotation.generalObjectives', '')
  const [deptObjectives, setDeptObjectives] = useLocalStorage(
    'rotation.deptObjectives',
    Object.fromEntries(departments.map((d) => [d.slug, '']))
  )
  const [schedule, setSchedule] = useLocalStorage('rotation.schedule', [])
  const [topics, setTopics] = useLocalStorage('rotation.topics', [])
  const [goals, setGoals] = useLocalStorage('rotation.goals', ['', '', ''])

  return (
    <div>
      <PageHeader
        eyebrow="Rotation Overview"
        title="Rotation Overview"
        description="This page gives context to the group portfolio: objectives, schedule, assigned case topics, and group learning goals."
      />

      <div className="space-y-6">
        <Section title="General Objectives of the Clinical Rotation">
          <Area
            placeholder="State the overall objectives of this clinical rotation as defined by the program or course syllabus."
            value={generalObjectives}
            onChange={(e) => setGeneralObjectives(e.target.value)}
            minRows={4}
          />
        </Section>

        <Section title="Rotation-Specific Objectives per Department" subtitle="Summarize the objectives for each department; full detail belongs on each department's page.">
          <div className="space-y-5">
            {departments.map((d) => (
              <div key={d.slug}>
                <label className="field-label">{d.name}</label>
                <Area
                  placeholder={`Objectives specific to the ${d.name} rotation.`}
                  value={deptObjectives[d.slug] ?? ''}
                  onChange={(e) => setDeptObjectives({ ...deptObjectives, [d.slug]: e.target.value })}
                  minRows={2}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Clinical Rotation Schedule / Timeline">
          <DataTable
            columns={scheduleColumns}
            rows={schedule}
            onChange={setSchedule}
            addLabel="Add schedule entry"
            emptyRow={{ dates: '', department: '', notes: '' }}
          />
        </Section>

        <Section title="Assigned Case Topics per Rotation Cycle">
          <DataTable
            columns={topicColumns}
            rows={topics}
            onChange={setTopics}
            addLabel="Add case topic"
            emptyRow={{ topic: '', department: '', cycle: '' }}
          />
        </Section>

        <Section title="Group Learning Goals" subtitle="What does the group want to achieve by the end of this rotation?">
          <ListField
            items={goals}
            onChange={setGoals}
            placeholder="e.g., Improve confidence in taking a pediatric history"
            addLabel="Add learning goal"
          />
        </Section>
      </div>
    </div>
  )
}
