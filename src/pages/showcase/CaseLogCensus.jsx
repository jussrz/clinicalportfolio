import PageHero from '../../components/PageHero'
import CaseLogTable from '../../components/CaseLogTable'
import { LoadState } from '../../components/ui'
import { useSupabaseTable } from '../../lib/useSupabaseTable'

export default function CaseLogCensus() {
  const { rows: caseLog, status, error } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })

  return (
    <div>
      <PageHero
        eyebrow="Group Case Log Census"
        title="Group Case Log Census"
        description="Every case we saw, observed, discussed, or participated in during hospital and community rotations."
      />

      <LoadState status={status} error={error}>
        {caseLog.length === 0 ? (
          <p className="text-sm text-ink-400 italic">
            The case log will appear here once the group starts adding entries.
          </p>
        ) : (
          <CaseLogTable rows={caseLog} />
        )}
      </LoadState>
    </div>
  )
}
