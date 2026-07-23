import { Button, IconPlus, Notice, PageHeader } from '../components/ui'
import CaseReflectionCard, { emptyReflection } from '../components/CaseReflectionCard'
import { useLocalStorage } from '../lib/useLocalStorage'

export default function CaseReflections() {
  const [reflections, setReflections] = useLocalStorage('caseReflections', [])

  function addReflection() {
    setReflections([...reflections, emptyReflection()])
  }
  function updateReflection(i, val) {
    setReflections(reflections.map((r, idx) => (idx === i ? val : r)))
  }
  function deleteReflection(i) {
    setReflections(reflections.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <PageHeader
        eyebrow="Selected Case Reflections"
        title="Selected Case Reflections"
        description="From the case log census, the group selects important cases for deeper discussion. Aim for at least one selected case reflection per major department, or 3–5 per rotation cycle."
      />

      <div className="space-y-6">
        <Notice>
          Use patient codes only in every reflection below — never patient names, hospital
          numbers, or other identifying information.
        </Notice>

        {reflections.map((r, i) => (
          <CaseReflectionCard
            key={r.id}
            reflection={r}
            index={i}
            onChange={(val) => updateReflection(i, val)}
            onDelete={() => deleteReflection(i)}
          />
        ))}

        {reflections.length === 0 && (
          <div className="text-center py-10 border border-dashed border-ink-300 rounded-2xl">
            <p className="text-sm text-ink-500">No case reflections yet.</p>
          </div>
        )}

        <Button onClick={addReflection}>
          <IconPlus /> Add Case Reflection
        </Button>
      </div>
    </div>
  )
}
