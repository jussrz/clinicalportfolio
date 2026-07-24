import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { departments } from '../data/departments'
import { GROUP_NAME } from '../data/group'

const icons = {
  home: 'M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-13.5-2 5-5 2 2-5 5-2Z',
  table: 'M3 5h18M3 12h18M3 19h18M8 5v14M16 5v14',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 17l9 5 9-5',
  bookmark: 'M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z',
  presentation: 'M3 4h18M4 4v11a1 1 0 0 0 1 1h4l-2 4M20 4v11a1 1 0 0 0-1 1h-4l2 4M12 15v-4',
  activity: 'M3 12h4l2 7 4-14 2 7h6',
  message: 'M4 4h16v12H8l-4 4V4Z',
  users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a5.5 5.5 0 0 1 11 0M16.5 11a3 3 0 1 0 0-6M15 14.5a5.5 5.5 0 0 1 6.5 5.5',
  refresh: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
}

function Icon({ name, className = 'w-[18px] h-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={icons[name]} />
    </svg>
  )
}

const navLinkClass = (collapsed) => ({ isActive }) =>
  `flex items-center ${collapsed ? 'justify-center' : ''} gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white text-brand-800 shadow-sm' : 'text-brand-100/80 hover:bg-white/10 hover:text-white'
  }`

const SIDEBAR_COLLAPSE_KEY = 'clinicalPortfolio.sidebarCollapsed'

/** Primary nav list, shared by the desktop rail and the mobile drawer.
 * `collapsed` hides labels down to an icon-only strip (desktop only — the
 * mobile drawer always passes collapsed=false since it's an overlay, not
 * permanent chrome). Clicking Departments while collapsed expands the
 * sidebar rather than opening a flyout, so the submenu never has to escape
 * the rail's scroll container. */
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

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  const sidebarBg = 'bg-gradient-to-b from-[#1f5b34] via-brand-900 to-[#0e2a19]'

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 ${sidebarBg} lg:h-screen lg:sticky lg:top-0 transition-[width] duration-200 ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-72'
        }`}
      >
        <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <SidebarNav collapsed={collapsed} deptOpen={deptOpen} setDeptOpen={setDeptOpen} onExpand={() => setCollapsed(false)} />
        <SidebarFooter collapsed={collapsed} />
      </aside>

      {/* Mobile top bar */}
      <div className={`lg:hidden no-print flex items-center justify-between ${sidebarBg} px-4 py-3 sticky top-0 z-30 shadow-sm`}>
        <SidebarBrand compact />
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2 -mr-2 text-white/90">
          <Icon name="menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className={`relative w-72 max-w-[85vw] ${sidebarBg} flex flex-col h-full shadow-2xl`}>
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
      </main>
    </div>
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

function SidebarFooter({ collapsed }) {
  if (collapsed) return null
  return (
    <div className="px-4 py-4 border-t border-white/10 text-xs text-brand-200/60">
      University of Southern Mindanao — College of Medicine
    </div>
  )
}
