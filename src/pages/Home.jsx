import { Link } from 'react-router-dom'
import { useCaseStats } from '../lib/useCaseStats'
import { formatLongDate } from '../lib/date'
import { departments, HOME_HERO_IMAGE } from '../data/departments'
import { GROUP_NAME, SCHOOL_NAME } from '../data/group'
import ConfidentialityNotice from '../components/ConfidentialityNotice'
import StatTile from '../components/StatTile'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { Area, EditBar, ListField, LoadState, PageActions, Section } from '../components/ui'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'

function splitLines(text) {
  return (text || '').split('\n')
}

export default function Home() {
  const stats = useCaseStats()
  const { record, status, saveState, setField, flush } = useSupabaseRecord('home_content', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const shown = editing ? draft : record
  const purposeItems = (shown.purpose_items ? splitLines(shown.purpose_items) : []).filter(Boolean)

  return (
    <div>
      <PageHero
        size="xl"
        eyebrow="Clinical Rotation Portfolio"
        image={HOME_HERO_IMAGE}
        title={
          <>
            Clinical Rotation Portfolio of <em className="font-display italic text-brand-200">{GROUP_NAME}</em>
          </>
        }
        actions={<PageActions editing={editing} onEdit={start} />}
      >
        <p className="mt-4 text-[15px] text-brand-100/90">{SCHOOL_NAME}</p>
      </PageHero>

      {stats.status === 'ready' && (stats.totalCases > 0 || stats.totalReflections > 0) && (
        <Reveal className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatTile label="Cases Logged" value={stats.totalCases} />
          <StatTile label="Reflections Written" value={stats.totalReflections} />
          <StatTile label="Departments Covered" value={`${stats.departmentsCovered}/${stats.totalDepartments}`} />
          <StatTile
            label="Most Recent Case"
            value={stats.lastDate ? formatLongDate(stats.lastDate) : '—'}
            sublabel={stats.firstDate && stats.firstDate !== stats.lastDate ? `Since ${formatLongDate(stats.firstDate)}` : undefined}
          />
        </Reveal>
      )}

      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Explore by Department</p>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {departments.map((d, i) => (
          <Reveal key={d.slug} delay={i * 60}>
            <Link
              to={`/departments/${d.slug}`}
              className="group relative block h-44 rounded-2xl overflow-hidden card-shadow-hover"
            >
              <img
                src={d.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-4">
                <p className="font-display text-lg font-semibold text-white">{d.name}</p>
                <p className="text-xs text-brand-100/85 mt-0.5">{d.blurb}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="space-y-6">
        <LoadState status={status} error="Couldn't load this page's content.">
          <div className="space-y-6">
            <Reveal>
              <Section variant="showcase" title="About This Portfolio" className="space-y-4">
                {editing ? (
                  <>
                    <Area label="Intro paragraph 1" value={draft.intro_1 ?? ''} onChange={(e) => set('intro_1', e.target.value)} minRows={3} />
                    <Area label="Intro paragraph 2" value={draft.intro_2 ?? ''} onChange={(e) => set('intro_2', e.target.value)} minRows={3} />
                  </>
                ) : (
                  <>
                    <p className="text-[16px] leading-relaxed text-ink-700 whitespace-pre-line">{shown.intro_1}</p>
                    <p className="text-[16px] leading-relaxed text-ink-700 whitespace-pre-line">{shown.intro_2}</p>
                  </>
                )}
              </Section>
            </Reveal>

            <Reveal>
              <Section variant="showcase" title="Purpose of the Portfolio">
                {editing ? (
                  <div className="space-y-4 mb-6">
                    <Area label="Intro line" value={draft.purpose_intro ?? ''} onChange={(e) => set('purpose_intro', e.target.value)} minRows={2} />
                    <ListField
                      label="Purpose items"
                      items={splitLines(draft.purpose_items ?? '')}
                      onChange={(items) => set('purpose_items', items.join('\n'))}
                      placeholder="e.g., Document our clinical exposure and learning experiences."
                      addLabel="Add purpose item"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-[15px] leading-relaxed text-ink-500 mb-6 whitespace-pre-line">{shown.purpose_intro}</p>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {purposeItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-xl border border-ink-100 bg-brand-50/40 p-3.5 text-sm leading-relaxed text-ink-700"
                        >
                          <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-semibold">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {editing ? (
                  <Area label="Closing line" value={draft.purpose_closing ?? ''} onChange={(e) => set('purpose_closing', e.target.value)} minRows={2} />
                ) : (
                  <p className="text-[15px] leading-relaxed text-ink-700 mt-6 whitespace-pre-line">{shown.purpose_closing}</p>
                )}
                <div className="mt-6">
                  <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
                </div>
              </Section>
            </Reveal>
          </div>
        </LoadState>

        <ConfidentialityNotice />
      </div>
    </div>
  )
}
