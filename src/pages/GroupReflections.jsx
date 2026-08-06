import { useState } from 'react'
import { Button, LoadState } from '../components/ui'
import PageHero from '../components/PageHero'
import { DepartmentReflectionCard, hasDeptReflection } from '../components/DepartmentReflectionCard'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { exportPromptsPdf } from '../lib/pdf'
import { supabase } from '../lib/supabase'
import { departments } from '../data/departments'
import { GROUP_REFLECTION_PROMPTS } from '../data/groupReflectionPrompts'
import { GROUP_NAME } from '../data/group'

// One combined PDF, department by department (only departments with at
// least one answer are included) — same "skip unanswered" behavior as the
// Individual Contribution student reflection export.
async function exportGroupReflectionsPdf(reflections) {
  const answeredDepartments = departments.filter((dept) =>
    hasDeptReflection(reflections.find((r) => r.department === dept.slug), GROUP_REFLECTION_PROMPTS)
  )

  const prompts = answeredDepartments.flatMap((dept) => {
    const reflection = reflections.find((r) => r.department === dept.slug)
    return GROUP_REFLECTION_PROMPTS.map(([key, label]) => ({
      label: `${dept.name} — ${label}`,
      value: reflection[key],
    }))
  })

  await exportPromptsPdf({
    title: `${GROUP_NAME} Group Reflections`,
    prompts: prompts.length > 0 ? prompts : [{ label: 'No department reflections recorded yet.', value: '' }],
    filename: 'group_reflections.pdf',
  })
}

export default function GroupReflections() {
  const { rows, status, error, refetch } = useSupabaseTable('group_reflections', { orderBy: 'department', ascending: true })
  const [openDept, setOpenDept] = useState(null)
  const [exporting, setExporting] = useState(false)

  async function handleSaveReflection(department, patch) {
    const { error } = await supabase
      .from('group_reflections')
      .upsert({ department, ...patch }, { onConflict: 'department' })
    if (!error) await refetch()
    return { error }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportGroupReflectionsPdf(rows)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the rotation, answered by the group per department."
        actions={
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Preparing PDF…' : 'Export to PDF'}
          </Button>
        }
      />

      <LoadState status={status} error={error}>
        <div className="space-y-2">
          {departments.map((dept) => (
            <DepartmentReflectionCard
              key={dept.slug}
              dept={dept}
              reflection={rows.find((r) => r.department === dept.slug)}
              prompts={GROUP_REFLECTION_PROMPTS}
              editable
              open={openDept === dept.slug}
              onToggle={() => setOpenDept(openDept === dept.slug ? null : dept.slug)}
              onSave={handleSaveReflection}
            />
          ))}
        </div>
      </LoadState>
    </div>
  )
}
