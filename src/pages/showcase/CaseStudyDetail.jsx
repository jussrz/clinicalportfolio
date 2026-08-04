import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import { Button, LoadState, Notice } from '../../components/ui'
import { Icon } from '../../components/Icon'
import { ReflectionReadout } from '../../components/ReflectionReadout'
import { exportReflectionPdf } from '../../components/CaseReflectionCard'
import { useCaseStudies } from '../../lib/useCaseStudies'

/** Top-left back navigation, above the page's own title — the standard
 * placement for a detail page's "back" link, rather than buried after all
 * the content below it. */
function BackLink() {
  return (
    <Link
      to="/case-reflections"
      className="inline-flex items-center gap-1.5 mb-4 text-sm font-medium text-ink-500 hover:text-brand-700 transition-colors"
    >
      <Icon name="chevron" className="w-4 h-4 rotate-180" />
      Back to Selected Case Reflections
    </Link>
  )
}

export default function CaseStudyDetail() {
  const { id } = useParams()
  const { caseStudies, status } = useCaseStudies()
  const [exporting, setExporting] = useState(false)

  const match = caseStudies.find(({ reflection }) => String(reflection.id) === id)

  async function handleExport() {
    setExporting(true)
    try {
      await exportReflectionPdf(match.reflection, match.caseEntry)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <LoadState status={status} error="Couldn't load this case study.">
        {!match ? (
          <div>
            <BackLink />
            <Notice tone="amber" title="Case reflection not found">
              This case reflection may have been removed, or the link is incorrect.
            </Notice>
          </div>
        ) : (
          <>
            <BackLink />
            <PageHero
              eyebrow={match.caseEntry?.department || 'Case Reflection'}
              title={match.caseEntry?.working_diagnosis || match.caseEntry?.chief_complaint || `Case Reflection No. ${match.reflection.reflection_no}`}
              description={[match.caseEntry?.clinical_area, match.caseEntry?.age_sex].filter(Boolean).join(' · ')}
              actions={
                <Button variant="outline" onClick={handleExport} disabled={exporting}>
                  {exporting ? 'Preparing PDF…' : 'Export to PDF'}
                </Button>
              }
            />

            <div className="max-w-3xl">
              <ReflectionReadout reflection={match.reflection} />
            </div>
          </>
        )}
      </LoadState>
    </div>
  )
}
