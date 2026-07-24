import { Link } from 'react-router-dom'
import { useCaseStats } from '../lib/useCaseStats'
import { formatLongDate } from '../lib/date'
import { departments } from '../data/departments'
import ConfidentialityNotice from '../components/ConfidentialityNotice'
import StatTile from '../components/StatTile'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { Section } from '../components/ui'

// Free-to-use Unsplash License photo (no attribution required).
const HERO_IMAGE = 'https://images.unsplash.com/photo-1758691462268-fbe66c4f3e28?fm=jpg&q=70&w=2000&auto=format&fit=crop'

const purposeItems = [
  'Document our clinical exposure and learning experiences.',
  'Record important cases encountered during rotations.',
  'Reflect on our strengths, challenges, and areas for improvement.',
  'Demonstrate the development of our clinical reasoning and professional skills.',
  'Promote collaborative learning through shared reflections and discussions.',
  'Monitor our progress toward achieving the objectives of each clinical rotation.',
]

export default function Home() {
  const stats = useCaseStats()

  return (
    <div>
      <PageHero
        size="xl"
        eyebrow="Clinical Rotation Portfolio"
        image={HERO_IMAGE}
        title={
          <>
            Clinical Rotation Portfolio of <em className="font-display italic text-brand-200">5A and 5B</em>
          </>
        }
      >
        <p className="mt-4 text-[15px] text-brand-100/90">University of Southern Mindanao – College of Medicine</p>
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a19]/90 via-[#0e2a19]/25 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-4">
                <p className="font-display text-lg font-semibold text-white">{d.name}</p>
                <p className="text-xs text-brand-100/85 mt-0.5">{d.blurb}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="space-y-6">
        <Reveal>
          <Section variant="showcase" className="space-y-4">
            <p className="text-[16px] leading-relaxed text-ink-700">
              This portfolio documents our learning journey throughout our clinical rotations as
              junior medical students. It showcases our clinical experiences, patient encounters,
              case discussions, reflections, and the knowledge and skills we developed across
              different departments, including Internal Medicine, Surgery, Pediatrics, Obstetrics
              and Gynecology, and Family and Community Medicine.
            </p>
            <p className="text-[16px] leading-relaxed text-ink-700">
              As a team, we are committed to lifelong learning, professionalism, ethical patient
              care, teamwork, and evidence-based clinical practice. Through this portfolio, we aim
              to demonstrate our growth in clinical reasoning, communication, and patient-centered
              care while preparing for the responsibilities of clerkship and future medical
              practice.
            </p>
          </Section>
        </Reveal>

        <Reveal>
          <Section variant="showcase" title="Purpose of the Portfolio">
            <p className="text-[15px] leading-relaxed text-ink-500 mb-6">
              This online portfolio serves as a comprehensive record of our clinical education and
              experiences during the rotation. It is designed to:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {purposeItems.map((item, i) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-ink-100 bg-brand-50/40 p-3.5 text-sm leading-relaxed text-ink-700"
                >
                  <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[15px] leading-relaxed text-ink-700 mt-6">
              We hope this portfolio reflects not only the knowledge we have gained but also our
              commitment to compassionate, ethical, and patient-centered medical practice.
            </p>
          </Section>
        </Reveal>

        <ConfidentialityNotice />
      </div>
    </div>
  )
}
