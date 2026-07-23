import { Area, PageHeader, Section } from '../components/ui'
import { useLocalStorage } from '../lib/useLocalStorage'

const prompts = [
  { key: 'meaningful', label: 'What was our most meaningful clinical learning experience?' },
  { key: 'patients', label: 'What did we learn about working with patients and caregivers?' },
  { key: 'team', label: 'What did we learn about working with the healthcare team?' },
  { key: 'workflows', label: 'What did we learn about hospital or community health workflows?' },
  { key: 'reasoning', label: 'What clinical reasoning skills improved in our group?' },
  { key: 'challenges', label: 'What challenged us as a group?' },
  { key: 'tasks', label: 'How did we manage group tasks and responsibilities?' },
  { key: 'improve', label: 'What should we improve before clerkship?' },
]

export default function GroupReflections() {
  const [values, setValues] = useLocalStorage('groupReflections', Object.fromEntries(prompts.map((p) => [p.key, ''])))

  function update(key, val) {
    setValues({ ...values, [key]: val })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the rotation, answered by the group as a whole."
      />

      <Section>
        <div className="space-y-6">
          {prompts.map((p, i) => (
            <Area
              key={p.key}
              label={`${i + 1}. ${p.label}`}
              value={values[p.key] ?? ''}
              onChange={(e) => update(p.key, e.target.value)}
              minRows={3}
            />
          ))}
        </div>
      </Section>
    </div>
  )
}
