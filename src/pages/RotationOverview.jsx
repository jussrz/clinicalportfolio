import { Area, EditBar, LoadState, ListField, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Pullquote from '../components/Pullquote'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'
import { departments } from '../data/departments'

// Postgres column names can't contain hyphens, so department slugs map to
// obj_<slug with underscores> columns on the rotation_overview row.
const deptColumn = (slug) => `obj_${slug.replace(/-/g, '_')}`

export default function RotationOverview() {
  const { record, status, saveState, setField, flush } = useSupabaseRecord('rotation_overview', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const shown = editing ? draft : record

  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Rotation Overview"
        title="Rotation Overview"
        description="Context for the group portfolio — objectives, schedule, and assigned topics as set by the clinical rotation program."
        actions={<PageActions editing={editing} onEdit={start} />}
      />

      <Reveal>
        <Section variant="showcase">
          <LoadState status={status} error="Couldn't load this page's data.">
            <div className="space-y-8">
              <FieldGroup label="General Objectives of the Clinical Rotation">
                {editing ? (
                  <Area value={draft.general_objectives ?? ''} onChange={(e) => set('general_objectives', e.target.value)} minRows={4} />
                ) : (
                  <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">{shown.general_objectives}</p>
                )}
              </FieldGroup>

              <FieldGroup label="Rotation-Specific Objectives per Department">
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
              </FieldGroup>

              <FieldGroup label="Clinical Rotation Schedule / Timeline">
                {editing ? (
                  <Area value={draft.schedule ?? ''} onChange={(e) => set('schedule', e.target.value)} minRows={4} />
                ) : (
                  <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">{shown.schedule}</p>
                )}
              </FieldGroup>

              <FieldGroup label="Assigned Case Topics per Rotation Cycle">
                {editing ? (
                  <ListField
                    items={(draft.case_topics ?? '').split('\n')}
                    onChange={(items) => set('case_topics', items.join('\n'))}
                    placeholder="e.g., Acute abdominal pain workup"
                    addLabel="Add case topic"
                  />
                ) : shown.case_topics ? (
                  <ul className="space-y-2">
                    {shown.case_topics.split('\n').filter(Boolean).map((topic, i) => (
                      <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-500 italic">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400 mt-2.5" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </FieldGroup>

              <FieldGroup label="Group Learning Goals">
                {editing ? (
                  <Area value={draft.learning_goals ?? ''} onChange={(e) => set('learning_goals', e.target.value)} minRows={3} />
                ) : (
                  <Pullquote>{shown.learning_goals}</Pullquote>
                )}
              </FieldGroup>

              <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
            </div>
          </LoadState>
        </Section>
      </Reveal>
    </div>
  )
}

/** One labeled block inside the single Rotation Overview card — same green
 * accent-bar heading style as PromptGroup, so a multi-field page still reads
 * as one simple form rather than a stack of separate boxed cards. */
function FieldGroup({ label, children }) {
  return (
    <div>
      <p className="flex items-baseline gap-2 font-display text-[15px] font-semibold text-ink-900 mb-2.5">
        <span className="w-4 h-[3px] shrink-0 rounded-full bg-brand-500 translate-y-[-3px]" />
        {label}
      </p>
      {children}
    </div>
  )
}
