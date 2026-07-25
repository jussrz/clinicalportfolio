import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { GROUP_NAME } from '../data/group'
import { Icon } from './Icon'

const NAV_LINKS = [
  { to: '/', end: true, icon: 'home', label: 'Home' },
  { to: '/rotation-overview', icon: 'compass', label: 'Rotation Overview' },
  { to: '/case-studies', icon: 'bookmark', label: 'Case Studies' },
  { to: '/growth-reflections', icon: 'activity', label: 'Growth & Reflections' },
  { to: '/team', icon: 'users', label: 'Team' },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-brand-800 bg-brand-50' : 'text-ink-600 hover:text-brand-700 hover:bg-brand-50/60'
  }`

/** Horizontal top nav for the public showcase — deliberately a different
 * shape than the Studio's dark sidebar, matching how real portfolio sites
 * use a light, minimal top bar rather than an admin rail. "Edit Portfolio"
 * is a low-emphasis link, not a primary action — it's there for members,
 * not the page's main audience. */
export default function PortfolioNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 no-print bg-white/85 backdrop-blur border-b border-ink-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 grid place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-sm text-ink-900">{GROUP_NAME}</p>
            <p className="text-[11px] text-ink-400 -mt-0.5">Clinical Rotation Portfolio</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block shrink-0">
          <Link
            to="/studio"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-brand-700 transition-colors"
          >
            Edit Portfolio <Icon name="arrowRight" className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden p-2 -mr-2 text-ink-600"
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} className="w-6 h-6" />
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-ink-200/70 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-800 bg-brand-50' : 'text-ink-600 hover:bg-ink-50'
                }`
              }
            >
              <Icon name={link.icon} className="w-[18px] h-[18px]" />
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/studio"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-400 hover:bg-ink-50 transition-colors"
          >
            <Icon name="edit" className="w-[18px] h-[18px]" />
            Edit Portfolio
          </Link>
        </nav>
      )}
    </header>
  )
}
