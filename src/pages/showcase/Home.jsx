import { Link } from 'react-router-dom'
import { GROUP_NAME, SCHOOL_NAME } from '../../data/group'
import { departments, HOME_HERO_IMAGE } from '../../data/departments'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { Section } from '../../components/ui'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'

export default function Home() {
  const { record } = useSupabaseRecord('home_content', 1)
  const purposeItems = (record.purpose_items || '').split('\n').filter(Boolean)

  return (
    <div>
      <PageHero
        size="xl"
        eyebrow="Clinical Rotation Portfolio"
        image={HOME_HERO_IMAGE}
        title={<>The Clinical Journey of <em className="font-display italic text-brand-200">{GROUP_NAME}</em></>}
        description="A record of our patient encounters, clinical reasoning, and reflections across Internal Medicine, Surgery, Pediatrics, Obstetrics and Gynecology, and Family and Community Medicine."
      >
        <p className="mt-4 text-[15px] text-brand-100/90">{SCHOOL_NAME}</p>
      </PageHero>

      <Reveal className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Explore by Department</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </Reveal>

      <div className="space-y-6 mb-10">
        <Reveal>
          <Section variant="showcase" className="space-y-4">
            <p className="text-[16px] leading-relaxed text-ink-700 whitespace-pre-line">{record.intro_1}</p>
            <p className="text-[16px] leading-relaxed text-ink-700 whitespace-pre-line">{record.intro_2}</p>
          </Section>
        </Reveal>

        <Reveal>
          <Section variant="showcase" title="Purpose of the Portfolio">
            <p className="text-[15px] leading-relaxed text-ink-500 mb-6 whitespace-pre-line">{record.purpose_intro}</p>
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
            <p className="text-[15px] leading-relaxed text-ink-700 mt-6 whitespace-pre-line">{record.purpose_closing}</p>
          </Section>
        </Reveal>
      </div>
    </div>
  )
}
