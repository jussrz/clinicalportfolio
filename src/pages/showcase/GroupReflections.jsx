import { useState } from 'react'
import PageHero from '../../components/PageHero'
import { LoadState } from '../../components/ui'
import { DepartmentReflectionCard, hasAnyReflection } from '../../components/DepartmentReflectionCard'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { departments } from '../../data/departments'
import { GROUP_REFLECTION_PROMPTS } from '../../data/groupReflectionPrompts'

export default function GroupReflections() {
  const { rows, status, error } = useSupabaseTable('group_reflections', { orderBy: 'department', ascending: true })
  const hasContent = status === 'ready' && hasAnyReflection(rows, GROUP_REFLECTION_PROMPTS)
  const [openDept, setOpenDept] = useState(null)

  return (
    <div>
      <PageHero
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the rotation, by department."
      />

      <LoadState status={status} error={error}>
        {!hasContent ? (
          <p className="text-sm text-ink-400 italic">
            Group reflections will appear here once the group starts adding them.
          </p>
        ) : (
          <div className="space-y-2">
            {departments.map((dept) => (
              <DepartmentReflectionCard
                key={dept.slug}
                dept={dept}
                reflection={rows.find((r) => r.department === dept.slug)}
                prompts={GROUP_REFLECTION_PROMPTS}
                editable={false}
                open={openDept === dept.slug}
                onToggle={() => setOpenDept(openDept === dept.slug ? null : dept.slug)}
              />
            ))}
          </div>
        )}
      </LoadState>
    </div>
  )
}
