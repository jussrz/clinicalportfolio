import { Area, PageHeader, Section } from '../components/ui'
import { DataTable } from '../components/DataTable'
import { useLocalStorage } from '../lib/useLocalStorage'

const confidenceOptions = [
  'Not yet exposed',
  'Observed only',
  'Assisted',
  'Performed with supervision',
  'Confident / independent',
]

const starterSkills = [
  'History-taking',
  'Physical examination',
  'Vital signs monitoring',
  'Wound care / dressing',
  'IV line insertion',
  'NGT insertion',
  'Urinary catheterization',
  'Suturing',
  'Assisting normal spontaneous delivery',
  'Basic life support',
]

const columns = [
  { key: 'skill', label: 'Clinical Skill', width: '35%', placeholder: 'e.g., History-taking' },
  { key: 'confidence', label: 'Group Confidence Level', width: '30%', type: 'select', options: confidenceOptions, placeholder: 'Select level' },
  { key: 'notes', label: 'Notes', width: '35%', placeholder: 'Context, department, or specifics' },
]

export default function ClinicalSkills() {
  const [rows, setRows] = useLocalStorage('skills.rows', starterSkills.map((skill) => ({ id: crypto.randomUUID(), skill, confidence: '', notes: '' })))
  const [confident, setConfident] = useLocalStorage('skills.confident', '')
  const [needsPractice, setNeedsPractice] = useLocalStorage('skills.needsPractice', '')
  const [plan, setPlan] = useLocalStorage('skills.plan', '')

  return (
    <div>
      <PageHeader
        eyebrow="Clinical Skills and Clerkship Readiness"
        title="Clinical Skills &amp; Clerkship Readiness"
        description="This page tracks the group's exposure to core clinical skills across the rotation."
      />

      <div className="space-y-6">
        <Section title="Skills Tracker" subtitle="Edit, add, or remove rows to match the skills relevant to this rotation.">
          <DataTable
            columns={columns}
            rows={rows}
            onChange={setRows}
            addLabel="Add skill"
            emptyRow={{ skill: '', confidence: '', notes: '' }}
          />
        </Section>

        <Section title="Group Synthesis">
          <div className="space-y-5">
            <Area label="Skills our group is becoming confident in" value={confident} onChange={(e) => setConfident(e.target.value)} minRows={3} />
            <Area label="Skills our group needs to practice more before clerkship" value={needsPractice} onChange={(e) => setNeedsPractice(e.target.value)} minRows={3} />
            <Area label="Plan to improve these skills" value={plan} onChange={(e) => setPlan(e.target.value)} minRows={3} />
          </div>
        </Section>
      </div>
    </div>
  )
}
