import { Field, FieldRow, PageHeader, Section } from '../components/ui'
import ConfidentialityNotice from '../components/ConfidentialityNotice'
import { useLocalStorage } from '../lib/useLocalStorage'

export default function Confidentiality() {
  const [repName, setRepName] = useLocalStorage('confidentiality.repName', '')
  const [date, setDate] = useLocalStorage('confidentiality.date', '')

  return (
    <div>
      <PageHeader
        eyebrow="Confidentiality"
        title="Confidentiality Statement"
        description="This statement applies to every page of the portfolio and confirms the group's commitment to patient confidentiality."
      />

      <div className="space-y-6">
        <ConfidentialityNotice />

        <Section title="Group Acknowledgement">
          <FieldRow>
            <Field label="Group Representative" placeholder="Name" value={repName} onChange={(e) => setRepName(e.target.value)} />
            <Field label="Date Acknowledged" placeholder="DD/MM/YYYY" value={date} onChange={(e) => setDate(e.target.value)} />
          </FieldRow>
        </Section>
      </div>
    </div>
  )
}
