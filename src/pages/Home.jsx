import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import ConfidentialityNotice from '../components/ConfidentialityNotice'

const purposeItems = [
  'Document our clinical exposure and learning experiences.',
  'Record important cases encountered during rotations.',
  'Reflect on our strengths, challenges, and areas for improvement.',
  'Demonstrate the development of our clinical reasoning and professional skills.',
  'Promote collaborative learning through shared reflections and discussions.',
  'Monitor our progress toward achieving the objectives of each clinical rotation.',
]

export default function Home() {
  const { record, status } = useSupabaseRecord('group_metadata', 1)
  const groupLabel =
    status === 'loading' ? 'Group …' : record.group_name ? `Group ${record.group_name}` : 'Group [EDIT ME]'

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">
          Clinical Rotation Portfolio
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
          Welcome to the Clinical Rotation Portfolio of {groupLabel}
        </h1>
        <p className="mt-2 text-[15px] text-ink-500">
          University of Southern Mindanao – College of Medicine
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-8 space-y-4">
          <p className="text-[15px] leading-relaxed text-ink-700">
            This portfolio documents our learning journey throughout our clinical rotations as
            junior medical students. It showcases our clinical experiences, patient encounters,
            case discussions, reflections, and the knowledge and skills we developed across
            different departments, including Internal Medicine, Surgery, Pediatrics, Obstetrics
            and Gynecology, and Family and Community Medicine.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-700">
            As a team, we are committed to lifelong learning, professionalism, ethical patient
            care, teamwork, and evidence-based clinical practice. Through this portfolio, we aim
            to demonstrate our growth in clinical reasoning, communication, and patient-centered
            care while preparing for the responsibilities of clerkship and future medical
            practice.
          </p>
        </div>

        <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-8">
          <h2 className="text-base font-semibold text-ink-900 mb-3">Purpose of the Portfolio</h2>
          <p className="text-[15px] leading-relaxed text-ink-700 mb-4">
            This online portfolio serves as a comprehensive record of our clinical education and
            experiences during the rotation. It is designed to:
          </p>
          <ul className="space-y-2">
            {purposeItems.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-700">
                <span className="text-brand-600 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-relaxed text-ink-700 mt-5">
            We hope this portfolio reflects not only the knowledge we have gained but also our
            commitment to compassionate, ethical, and patient-centered medical practice.
          </p>
        </div>

        <ConfidentialityNotice />
      </div>
    </div>
  )
}
