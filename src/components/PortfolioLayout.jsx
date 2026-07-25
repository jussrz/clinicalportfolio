import { Outlet } from 'react-router-dom'
import PortfolioNav from './PortfolioNav'
import ConfidentialityNotice from './ConfidentialityNotice'

/** Shell for the public showcase — a light, horizontal-nav "real website"
 * layout, deliberately unlike the Studio's dark admin sidebar. Every public
 * page renders inside here, so the confidentiality notice and university
 * byline appear once, site-wide, instead of being repeated per page. */
export default function PortfolioLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PortfolioNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <Outlet />
        </div>
      </main>
      <footer className="no-print border-t border-ink-200/70 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-4">
          <ConfidentialityNotice compact />
          <p className="text-xs text-ink-400">University of Southern Mindanao — College of Medicine · Clinical Rotation Portfolio</p>
        </div>
      </footer>
    </div>
  )
}
