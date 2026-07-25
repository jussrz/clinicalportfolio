import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import { Button, LoadState, Notice } from '../../components/ui'
import { ReflectionReadout } from '../../components/ReflectionReadout'
import { exportReflectionPdf } from '../../components/CaseReflectionCard'
import { useCaseStudies } from '../../lib/useCaseStudies'

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
          <div className="space-y-4">
            <Notice tone="amber" title="Case study not found">
              This case study may have been removed, or the link is incorrect.
            </Notice>
            <Link to="/case-studies" className="text-sm font-medium text-brand-700 hover:text-brand-800">
              ← Back to Case Studies
            </Link>
          </div>
        ) : (
          <>
            <PageHero
              eyebrow={match.caseEntry?.department || 'Case Study'}
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

            <div className="mt-10">
              <Link to="/case-studies" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                ← Back to Case Studies
              </Link>
            </div>
          </>
        )}
      </LoadState>
    </div>
  )
}
