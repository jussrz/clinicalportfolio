import { Area, Field, FieldRow, PageHeader, Section } from '../components/ui'
import ConfidentialityNotice from '../components/ConfidentialityNotice'
import { useLocalStorage } from '../lib/useLocalStorage'
import { GROUP_NAME } from '../data/group'

export default function Home() {
  const [site, setSite] = useLocalStorage('home.site', '')
  const [term, setTerm] = useLocalStorage('home.term', '')
  const [intro, setIntro] = useLocalStorage('home.intro', '')
  const [purpose, setPurpose] = useLocalStorage('home.purpose', '')

  return (
    <div>
      <PageHeader
        eyebrow="Group Online Clinical Portfolio"
        title="Home"
        description="This portfolio documents the rotation activity, case findings, and reflections of the group below, submitted as their clinical rotation deliverable."
      />

      <div className="space-y-6">
        <Section>
          <FieldRow cols={3}>
            <div>
              <span className="field-label">Group</span>
              <div className="field-input bg-ink-50 text-ink-800 font-medium">{GROUP_NAME}</div>
            </div>
            <Field
              label="Academic Year / Term"
              placeholder="e.g., A.Y. 2026–2027, Term 2"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <Field
              label="Rotation Site / Institution"
              placeholder="e.g., Name of affiliated hospital or community site"
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
          </FieldRow>
        </Section>

        <Section title="About Our Group" subtitle="Introduce the group — who you are and where you rotated.">
          <Area
            placeholder="Introduce the group: rotation cycle, sites and departments covered, and any relevant background context for readers of this portfolio."
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            minRows={4}
          />
        </Section>

        <Section title="Purpose of This Portfolio" subtitle="Explain what this portfolio is meant to demonstrate.">
          <Area
            placeholder="Describe the purpose of this portfolio — e.g., to document clinical findings from the rotation activity, consolidate case learning, demonstrate growth in clinical reasoning, and prepare the group for clerkship."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            minRows={4}
          />
        </Section>

        <ConfidentialityNotice />
      </div>
    </div>
  )
}
