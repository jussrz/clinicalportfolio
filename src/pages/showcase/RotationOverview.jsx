import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { LoadState, Modal } from '../../components/ui'
import { Icon } from '../../components/Icon'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'
import { departments } from '../../data/departments'

const deptColumn = (slug) => `obj_${slug.replace(/-/g, '_')}`

// Newline-based split, preserving order — Studio authors both the schedule
// and case topics one line/bullet per item.
function splitLines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

/** Teaser card for a modal-backed section — always rendered so the page's
 * shape stays intact, same convention as DepartmentShowcase's DepartmentCard.
 * Only clickable once there's content to expand. */
function TeaserCard({ icon, title, onOpen, hasContent, children }) {
  const header = (
    <div className="flex items-center gap-3 mb-3">
      <div className="shrink-0 w-10 h-10 grid place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <p className="font-display text-base font-semibold text-ink-900">{title}</p>
    </div>
  )
  if (!hasContent) {
    return (
      <div className="rounded-2xl border border-ink-200/70 bg-white card-shadow p-5 sm:p-6">
        {header}
        <p className="text-sm text-ink-400 italic">Not yet added.</p>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left rounded-2xl border border-ink-200/70 bg-white card-shadow card-shadow-hover p-5 sm:p-6"
    >
      {header}
      {children}
    </button>
  )
}

function ScheduleCard({ lines, onOpen }) {
  return (
    <TeaserCard icon="calendar" title="Schedule & Timeline" onOpen={onOpen} hasContent={lines.length > 0}>
      <p className="text-sm text-ink-500 leading-relaxed line-clamp-2">{lines[0]}</p>
    </TeaserCard>
  )
}

function TopicsCard({ tags, onOpen }) {
  return (
    <TeaserCard icon="list" title="Assigned Case Topics" onOpen={onOpen} hasContent={tags.length > 0}>
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 4).map((t, i) => (
          <span key={i} className="text-xs bg-brand-50 text-brand-700 rounded-full px-2.5 py-1">{t}</span>
        ))}
        {tags.length > 4 && <span className="text-xs text-ink-400 px-1 py-1">+{tags.length - 4} more</span>}
      </div>
    </TeaserCard>
  )
}

export default function RotationOverview() {
  const { record, status } = useSupabaseRecord('rotation_overview', 1)
  const [modal, setModal] = useState(null) // 'schedule' | 'topics' | null

  const scheduleLines = splitLines(record.schedule)
  const topicTags = splitLines(record.case_topics)

  return (
    <div>
      <PageHero
        eyebrow="Rotation Journey"
        title="Rotation Overview"
        description="What we set out to learn, and how our time was structured across the clinical rotation."
      />

      <LoadState status={status} error="Couldn't load the rotation overview.">
        <Reveal className="mb-10">
          <div className="max-w-3xl border-l-4 border-brand-400 pl-5 sm:pl-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Our Objectives</p>
            {record.general_objectives ? (
              <p className="font-display text-lg sm:text-xl leading-relaxed text-ink-800">
                {record.general_objectives}
              </p>
            ) : (
              <p className="text-sm text-ink-400 italic">Not yet added.</p>
            )}
          </div>
        </Reveal>

        <Reveal className="mb-10">
          <div className="grid sm:grid-cols-2 gap-4">
            <ScheduleCard lines={scheduleLines} onOpen={() => setModal('schedule')} />
            <TopicsCard tags={topicTags} onOpen={() => setModal('topics')} />
          </div>
        </Reveal>

        <Reveal className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Objectives by Department</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d, i) => {
              const value = record[deptColumn(d.slug)]
              return (
                <Reveal key={d.slug} delay={i * 60}>
                  <Link
                    to={`/departments/${d.slug}`}
                    className="group flex flex-col h-full rounded-2xl overflow-hidden border border-ink-200/70 bg-white card-shadow card-shadow-hover"
                  >
                    <div className="relative h-28 shrink-0 overflow-hidden">
                      <img
                        src={d.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-brand-950/10 to-transparent" />
                      <p className="absolute bottom-2 left-3 font-display text-sm font-semibold text-white">{d.name}</p>
                    </div>
                    <div className="p-4 flex-1">
                      {value ? (
                        <p className="text-sm text-ink-600 leading-relaxed line-clamp-4">{value}</p>
                      ) : (
                        <p className="text-sm text-ink-400 italic">Not yet added.</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </Reveal>

        <Reveal>
          <div className="relative overflow-hidden rounded-2xl px-6 py-10 sm:px-14 sm:py-16 text-center bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-200 mb-4">Group Learning Goals</p>
            {record.learning_goals ? (
              <p className="max-w-2xl mx-auto font-display italic text-xl sm:text-2xl leading-relaxed text-white">
                “{record.learning_goals}”
              </p>
            ) : (
              <p className="max-w-2xl mx-auto text-sm text-brand-200/80 italic">Not yet added.</p>
            )}
          </div>
        </Reveal>
      </LoadState>

      {/* Modal content below never mounts until clicked open, so it's absent
          from print output. Mirror the full lists here, screen-hidden but
          print-visible, so a printed/PDF'd page isn't truncated to the
          teaser card's first line. */}
      {(scheduleLines.length > 0 || topicTags.length > 0) && (
        <div className="hidden print:block mb-10">
          {scheduleLines.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Schedule &amp; Timeline</p>
              {scheduleLines.map((line, i) => (
                <p key={i} className="text-sm text-ink-700 leading-relaxed">{line}</p>
              ))}
            </div>
          )}
          {topicTags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Assigned Case Topics</p>
              {topicTags.map((t, i) => (
                <p key={i} className="text-sm text-ink-700 leading-relaxed">{t}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={modal === 'schedule'} onClose={() => setModal(null)} title="Schedule & Timeline">
        <div>
          {scheduleLines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                {i < scheduleLines.length - 1 && <span className="w-px flex-1 bg-ink-200 mt-1" />}
              </div>
              <p className="text-sm text-ink-700 leading-relaxed pb-5">{line}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={modal === 'topics'} onClose={() => setModal(null)} title="Assigned Case Topics">
        <div className="flex flex-wrap gap-2">
          {topicTags.map((t, i) => (
            <span key={i} className="text-sm bg-brand-50 text-brand-700 rounded-full px-3 py-1.5">{t}</span>
          ))}
        </div>
      </Modal>
    </div>
  )
}
