import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { departments } from '../data/departments'
import { GROUP_NAME, SCHOOL_NAME } from '../data/group'
import { Icon } from './Icon'
import ConfidentialityNotice from './ConfidentialityNotice'

const navLinkClass = (collapsed) => ({ isActive }) =>
  `flex items-center ${collapsed ? 'justify-center' : ''} gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white text-brand-800 shadow-sm' : 'text-brand-100/80 hover:bg-white/10 hover:text-white'
  }`

const SIDEBAR_COLLAPSE_KEY = 'clinicalPortfolio.publicSidebarCollapsed'
const SIDEBAR_BG = 'bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950'

/** Public-portfolio mirror of Studio's SidebarNav (src/components/Layout.jsx)
 * — same 9 sections, same order, same icons, so the two shells read as one
 * app — but every link points at the public route instead of /studio/*, and
 * there's no edit affordance anywhere in this file. */
function SidebarNav({ collapsed, deptOpen, setDeptOpen, onExpand }) {
  const cls = navLinkClass(collapsed)

  function handleDeptClick() {
    if (collapsed) {
      onExpand()
      setDeptOpen(true)
    } else {
      setDeptOpen((v) => !v)
    }
  }

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll px-3 py-4 space-y-1">
      <NavLink to="/" end className={cls} title={collapsed ? 'Home' : undefined}>
        <Icon name="home" />
        {!collapsed && 'Home'}
      </NavLink>
      <NavLink to="/rotation-overview" className={cls} title={collapsed ? 'Rotation Overview' : undefined}>
        <Icon name="compass" />
        {!collapsed && 'Rotation Overview'}
      </NavLink>
      <NavLink to="/case-log-census" className={cls} title={collapsed ? 'Group Case Log Census' : undefined}>
        <Icon name="table" />
        {!collapsed && 'Group Case Log Census'}
      </NavLink>

      <div>
        <button
          type="button"
          onClick={handleDeptClick}
          title={collapsed ? 'Departments' : undefined}
          className={`w-full ${cls({ isActive: false })}`}
        >
          <Icon name="layers" />
          {!collapsed && <span className="flex-1 text-left">Departments</span>}
          {!collapsed && <Icon name="chevron" className={`w-4 h-4 transition-transform ${deptOpen ? 'rotate-90' : ''}`} />}
        </button>
        {!collapsed && deptOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-white/15 space-y-1">
            {departments.map((d) => (
              <NavLink key={d.slug} to={`/departments/${d.slug}`} className={cls}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                {d.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <NavLink to="/case-reflections" className={cls} title={collapsed ? 'Selected Case Reflections' : undefined}>
        <Icon name="bookmark" />
        {!collapsed && 'Selected Case Reflections'}
      </NavLink>
      <NavLink to="/case-presentation" className={cls} title={collapsed ? 'Case Presentation' : undefined}>
        <Icon name="presentation" />
        {!collapsed && 'Case Presentation'}
      </NavLink>
      <NavLink to="/clinical-skills" className={cls} title={collapsed ? 'Clinical Skills & Readiness' : undefined}>
        <Icon name="activity" />
        {!collapsed && 'Clinical Skills & Readiness'}
      </NavLink>
      <NavLink to="/feedback-action-plan" className={cls} title={collapsed ? 'Feedback & Action Plan' : undefined}>
        <Icon name="message" />
        {!collapsed && 'Feedback & Action Plan'}
      </NavLink>
      <NavLink to="/individual-contribution" className={cls} title={collapsed ? 'Individual Contribution' : undefined}>
        <Icon name="users" />
        {!collapsed && 'Individual Contribution'}
      </NavLink>
      <NavLink to="/group-reflections" className={cls} title={collapsed ? 'Group Reflections' : undefined}>
        <Icon name="refresh" />
        {!collapsed && 'Group Reflections'}
      </NavLink>
    </nav>
  )
}

function LogoMark({ small }) {
  return (
    <div className={`shrink-0 grid place-items-center rounded-lg bg-white shadow-sm ${small ? 'w-8 h-8' : 'w-9 h-9'}`}>
      <svg viewBox="0 0 24 24" className={small ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--color-brand-700)' }}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  )
}

function SidebarBrand({ compact }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark small={compact} />
      <div className="leading-tight">
        <p className="font-semibold text-sm text-white">Clinical Portfolio</p>
        {!compact && <p className="text-xs text-brand-200/80 truncate max-w-[10rem]">{GROUP_NAME}</p>}
      </div>
    </div>
  )
}

function SidebarHeader({ collapsed, onToggle }) {
  if (collapsed) {
    return (
      <div className="px-3 pt-6 pb-4 border-b border-white/10 flex flex-col items-center gap-3">
        <LogoMark small />
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="p-1.5 rounded-lg text-brand-100/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Icon name="chevron" className="w-4 h-4" />
        </button>
      </div>
    )
  }
  return (
    <div className="px-4 pt-6 pb-4 border-b border-white/10 flex items-center justify-between gap-2">
      <SidebarBrand />
      <button
        type="button"
        onClick={onToggle}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
        className="shrink-0 p-1.5 rounded-lg text-brand-100/70 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Icon name="chevron" className="w-4 h-4 rotate-180" />
      </button>
    </div>
  )
}

/** No "Editing as / Switch" here — this shell is read-only. The "Studio"
 * link is deliberately low-emphasis (small, muted), same philosophy as the
 * old top-nav's "Edit Portfolio" link: it's for members, not this page's
 * main audience. */
function SidebarFooter({ collapsed }) {
  if (collapsed) {
    return (
      <div className="px-3 py-4 border-t border-white/10 flex flex-col items-center gap-2">
        <Link
          to="/studio"
          aria-label="Studio (edit portfolio)"
          title="Studio (edit portfolio)"
          className="p-1.5 rounded-lg text-brand-100/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Icon name="edit" className="w-4 h-4" />
        </Link>
      </div>
    )
  }
  return (
    <div className="px-4 py-4 border-t border-white/10 text-xs text-brand-200/60 space-y-2">
      <Link to="/studio" className="flex items-center gap-1.5 font-medium text-brand-100/70 hover:text-white transition-colors">
        <Icon name="edit" className="w-3.5 h-3.5" /> Studio
      </Link>
      <p>{SCHOOL_NAME}</p>
    </div>
  )
}

/** Shell for the public showcase — the same dark sidebar chrome as Studio
 * (src/components/Layout.jsx), so the public site and the editing tool
 * share one visual identity, but with no MemberGate and no edit affordances:
 * every page rendered inside here is read-only. Kept as its own file rather
 * than sharing components with Layout.jsx so Studio is untouched by changes
 * here. */
export default function PortfolioLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 ${SIDEBAR_BG} lg:h-screen lg:sticky lg:top-0 transition-[width] duration-200 ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-72'
        }`}
      >
        <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <SidebarNav collapsed={collapsed} deptOpen={deptOpen} setDeptOpen={setDeptOpen} onExpand={() => setCollapsed(false)} />
        <SidebarFooter collapsed={collapsed} />
      </aside>

      {/* Mobile top bar */}
      <div className={`lg:hidden no-print flex items-center justify-between ${SIDEBAR_BG} px-4 py-3 sticky top-0 z-30 shadow-sm`}>
        <SidebarBrand compact />
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2 -mr-2 text-white/90">
          <Icon name="menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className={`relative w-72 max-w-[85vw] ${SIDEBAR_BG} flex flex-col h-full shadow-2xl`}>
            <div className="flex items-center justify-between px-4 pt-4">
              <SidebarBrand compact />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 text-white/90">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div onClick={() => setMobileOpen(false)}>
              <SidebarNav collapsed={false} deptOpen={deptOpen} setDeptOpen={setDeptOpen} onExpand={() => {}} />
            </div>
            <SidebarFooter collapsed={false} />
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <Outlet />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-8">
          <ConfidentialityNotice compact />
        </div>
      </main>
    </div>
  )
}
