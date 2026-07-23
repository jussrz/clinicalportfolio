import { Area, Button, Field, FieldRow, IconPlus, IconTrash, PageHeader, Section } from '../components/ui'
import { useLocalStorage } from '../lib/useLocalStorage'
import { GROUP_MEMBERS } from '../data/group'

const emptyMember = (name = '') => ({
  id: crypto.randomUUID(),
  name,
  role: '',
  departments: '',
  contributions: '',
})

const rosterMembers = () => GROUP_MEMBERS.map((surname) => emptyMember(surname))

export default function IndividualContribution() {
  const [members, setMembers] = useLocalStorage('contributions.members', rosterMembers())

  function addMember() {
    setMembers([...members, emptyMember()])
  }
  function updateMember(i, key, val) {
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)))
  }
  function removeMember(i) {
    setMembers(members.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <PageHeader
        eyebrow="Individual Contribution"
        title="Individual Contributions"
        description="Although the portfolio is submitted as a group, each student's contributions should be documented here."
      />

      <div className="space-y-6">
        {members.map((m, i) => (
          <Section key={m.id}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <p className="text-sm font-semibold text-ink-800">{m.name || `Member ${i + 1}`}</p>
              <button
                type="button"
                onClick={() => removeMember(i)}
                aria-label="Remove member"
                className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <IconTrash />
              </button>
            </div>
            <div className="space-y-4">
              <FieldRow>
                <Field label="Name" placeholder="Add first name / initial to complete" value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} />
                <Field label="Role in the Group" placeholder="e.g., Documentation lead, presenter" value={m.role} onChange={(e) => updateMember(i, 'role', e.target.value)} />
              </FieldRow>
              <Field label="Department(s) Involved" placeholder="e.g., Pediatrics, Surgery" value={m.departments} onChange={(e) => updateMember(i, 'departments', e.target.value)} />
              <Area
                label="Key Contributions"
                placeholder="Specific tasks, case write-ups, research, or coordination this student contributed to the portfolio."
                value={m.contributions}
                onChange={(e) => updateMember(i, 'contributions', e.target.value)}
                minRows={3}
              />
            </div>
          </Section>
        ))}

        {members.length === 0 && (
          <div className="text-center py-10 border border-dashed border-ink-300 rounded-2xl">
            <p className="text-sm text-ink-500">No members added yet.</p>
          </div>
        )}

        <Button onClick={addMember}>
          <IconPlus /> Add Member
        </Button>
      </div>
    </div>
  )
}
