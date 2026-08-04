import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { departments } from '../data/departments'
import { GROUP_NAME, SCHOOL_NAME, studentFullName } from '../data/group'
import { useCurrentMember } from '../lib/useCurrentMember'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { initials } from '../lib/avatar'
import { Icon } from './Icon'

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
      <NavLink to="/studio" end className={cls} title={collapsed ? 'Home' : undefined}>
        <Icon name="home" />
        {!collapsed && 'Home'}
      </NavLink>
      <NavLink to="/studio/rotation-overview" className={cls} title={collapsed ? 'Rotation Overview' : undefined}>
        <Icon name="compass" />
        {!collapsed && 'Rotation Overview'}
      </NavLink>
      <NavLink to="/studio/case-log-census" className={cls} title={collapsed ? 'Group Case Log Census' : undefined}>
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
              <NavLink key={d.slug} to={`/studio/departments/${d.slug}`} className={cls}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                {d.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <NavLink to="/studio/case-reflections" className={cls} title={collapsed ? 'Selected Case Reflections' : undefined}>
        <Icon name="bookmark" />
        {!collapsed && 'Selected Case Reflections'}
      </NavLink>
      <NavLink to="/studio/case-presentation" className={cls} title={collapsed ? 'Case Presentation' : undefined}>
        <Icon name="presentation" />
        {!collapsed && 'Case Presentation'}
      </NavLink>
      <NavLink to="/studio/clinical-skills" className={cls} title={collapsed ? 'Clinical Skills & Readiness' : undefined}>
        <Icon name="activity" />
        {!collapsed && 'Clinical Skills & Readiness'}
      </NavLink>
      <NavLink to="/studio/feedback-action-plan" className={cls} title={collapsed ? 'Feedback & Action Plan' : undefined}>
        <Icon name="message" />
        {!collapsed && 'Feedback & Action Plan'}
      </NavLink>
      <NavLink to="/studio/individual-contribution" className={cls} title={collapsed ? 'Individual Contribution' : undefined}>
        <Icon name="users" />
        {!collapsed && 'Individual Contribution'}
      </NavLink>
      <NavLink to="/studio/group-reflections" className={cls} title={collapsed ? 'Group Reflections' : undefined}>
        <Icon name="refresh" />
        {!collapsed && 'Group Reflections'}
      </NavLink>
    </nav>
  )
}

/** Blocks Studio access until a roster surname is typed in. This is an
 * identity gate, not real authentication — it exists to remember who's
 * editing and label their entries, not to lock anyone out. */
function MemberGate({ onSubmit }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const sidebarBg = 'bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950'

  function handleSubmit(e) {
    e.preventDefault()
    const matched = onSubmit(value)
    if (!matched) setError('Surname not recognized. Check the spelling and try again.')
  }

  return (
    <div className={`min-h-screen grid place-items-center px-4 ${sidebarBg}`}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
        <div>
          <p className="font-display text-lg font-semibold text-ink-800">Edit Mode</p>
          <p className="text-sm text-ink-500 mt-1">
            Type your surname to edit the portfolio with your own answers and findings.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
            placeholder="e.g. Suarez"
            className="field-input"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-700 text-white text-sm font-medium py-2 hover:bg-brand-800 transition-colors"
          >
            Continue
          </button>
        </form>
        <Link to="/" className="block text-center text-xs text-ink-400 hover:text-ink-600">
          ← Back to Public Portfolio
        </Link>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true'
  })
  const { member, login, logout } = useCurrentMember()
  const { rows: contributionRows } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  const sidebarBg = 'bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950'

  if (!member) {
    return <MemberGate onSubmit={login} />
  }

  const photoUrl = contributionRows.find((r) => r.student_name === member)?.photo_url

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
        <SidebarFooter collapsed={collapsed} member={member} photoUrl={photoUrl} onLogout={logout} />
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
            <SidebarFooter collapsed={false} member={member} photoUrl={photoUrl} onLogout={logout} />
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="max-w-7x1 mx-auto px-4 sm:px-8 py-8 sm:py-12">
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

function SidebarFooter({ collapsed, member, photoUrl, onLogout }) {
  if (collapsed) {
    return (
      <div className="px-3 py-4 border-t border-white/10 flex flex-col items-center gap-2">
        <div
          title={`Editing as ${studentFullName(member)}`}
          className="w-7 h-7 rounded-full overflow-hidden grid place-items-center bg-white/10 text-[11px] font-semibold text-white"
        >
          {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : initials(studentFullName(member))}
        </div>
        <Link
          to="/"
          aria-label="View public portfolio"
          title="View public portfolio"
          className="p-1.5 rounded-lg text-brand-100/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Icon name="arrowRight" className="w-4 h-4" />
        </Link>
      </div>
    )
  }
  return (
    <div className="px-4 py-4 border-t border-white/10 text-xs text-brand-200/60 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden grid place-items-center bg-white/10 text-xs font-semibold text-white">
            {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : initials(studentFullName(member))}
          </div>
          <p className="text-brand-100 truncate">
            Editing as <span className="font-semibold text-white">{studentFullName(member)}</span>
          </p>
        </div>
        <button type="button" onClick={onLogout} className="shrink-0 font-medium text-brand-200/80 hover:text-white transition-colors">
          Exit
        </button>
      </div>
      <Link to="/" className="flex items-center gap-1.5 font-medium text-brand-100 hover:text-white transition-colors">
        View Public Portfolio <Icon name="arrowRight" className="w-3.5 h-3.5" />
      </Link>
      <p>{SCHOOL_NAME}</p>
    </div>
  )
}
