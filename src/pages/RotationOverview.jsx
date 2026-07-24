import { useState } from 'react'
import { Area, EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Pullquote from '../components/Pullquote'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'
import { exportPromptsPdf } from '../lib/pdf'
import { departments } from '../data/departments'
import { GROUP_NAME } from '../data/group'

// Postgres column names can't contain hyphens, so department slugs map to
// obj_<slug with underscores> columns on the rotation_overview row.
const deptColumn = (slug) => `obj_${slug.replace(/-/g, '_')}`

export default function RotationOverview() {
  const { record, status, saveState, setField, flush } = useSupabaseRecord('rotation_overview', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const [exporting, setExporting] = useState(false)
  const shown = editing ? draft : record

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: `${GROUP_NAME} Rotation Overview`,
        prompts: [
          { label: 'General Objectives of the Clinical Rotation', value: record.general_objectives },
          ...departments.map((d) => ({
            label: `Rotation-Specific Objectives — ${d.name}`,
            value: record[deptColumn(d.slug)],
          })),
          { label: 'Clinical Rotation Schedule / Timeline', value: record.schedule },
          { label: 'Assigned Case Topics per Rotation Cycle', value: record.case_topics },
          { label: 'Group Learning Goals', value: record.learning_goals },
        ],
        filename: 'rotation_overview.pdf',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Rotation Overview"
        title="Rotation Overview"
        description="Context for the group portfolio — objectives, schedule, and assigned topics as set by the clinical rotation program."
        actions={<PageActions editing={editing} onEdit={start} onExport={handleExport} exporting={exporting} />}
      />

      <LoadState status={status} error="Couldn't load this page's data.">
        <div className="space-y-6">
          <Reveal>
            <Section variant="showcase" title="General Objectives of the Clinical Rotation">
              {editing ? (
                <Area value={draft.general_objectives ?? ''} onChange={(e) => set('general_objectives', e.target.value)} minRows={4} />
              ) : (
                <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">{shown.general_objectives}</p>
              )}
            </Section>
          </Reveal>

          <Reveal>
            <Section variant="showcase" title="Rotation-Specific Objectives per Department">
              <div className="space-y-5">
                {departments.map((d) => {
                  const key = deptColumn(d.slug)
                  return (
                    <div key={d.slug}>
                      <p className="text-sm font-semibold text-ink-800 mb-1.5">{d.name}</p>
                      {editing ? (
                        <Area value={draft[key] ?? ''} onChange={(e) => set(key, e.target.value)} minRows={3} />
                      ) : (
                        <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">{shown[key]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>
          </Reveal>

          <Reveal>
            <Section variant="showcase" title="Clinical Rotation Schedule / Timeline">
              {editing ? (
                <Area value={draft.schedule ?? ''} onChange={(e) => set('schedule', e.target.value)} minRows={4} />
              ) : (
                <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">{shown.schedule}</p>
              )}
            </Section>
          </Reveal>

          <Reveal>
            <Section variant="showcase" title="Assigned Case Topics per Rotation Cycle">
              {editing ? (
                <Area value={draft.case_topics ?? ''} onChange={(e) => set('case_topics', e.target.value)} minRows={3} />
              ) : (
                <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">{shown.case_topics}</p>
              )}
            </Section>
          </Reveal>

          <Reveal>
            <Section variant="showcase" title="Group Learning Goals">
              {editing ? (
                <Area value={draft.learning_goals ?? ''} onChange={(e) => set('learning_goals', e.target.value)} minRows={3} />
              ) : (
                <Pullquote>{shown.learning_goals}</Pullquote>
              )}
            </Section>
          </Reveal>

          <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
        </div>
      </LoadState>
    </div>
  )
}
