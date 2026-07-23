import { useState } from 'react'
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

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-700 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
  }`

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(true)

  const nav = (
    <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-1">
      <NavLink to="/" end className={navLinkClass}>
        <Icon name="home" /> Home
      </NavLink>
      <NavLink to="/rotation-overview" className={navLinkClass}>
        <Icon name="compass" /> Rotation Overview
      </NavLink>
      <NavLink to="/case-log-census" className={navLinkClass}>
        <Icon name="table" /> Group Case Log Census
      </NavLink>

      <div>
        <button
          onClick={() => setDeptOpen((v) => !v)}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
        >
          <Icon name="layers" />
          <span className="flex-1 text-left">Departments</span>
          <Icon name="chevron" className={`w-4 h-4 transition-transform ${deptOpen ? 'rotate-90' : ''}`} />
        </button>
        {deptOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-ink-700 space-y-1">
            {departments.map((d) => (
              <NavLink key={d.slug} to={`/departments/${d.slug}`} className={navLinkClass}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                {d.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <NavLink to="/case-reflections" className={navLinkClass}>
        <Icon name="bookmark" /> Selected Case Reflections
      </NavLink>
      <NavLink to="/case-presentation" className={navLinkClass}>
        <Icon name="presentation" /> Case Presentation
      </NavLink>
      <NavLink to="/clinical-skills" className={navLinkClass}>
        <Icon name="activity" /> Clinical Skills &amp; Readiness
      </NavLink>
      <NavLink to="/feedback-action-plan" className={navLinkClass}>
        <Icon name="message" /> Feedback &amp; Action Plan
      </NavLink>
      <NavLink to="/individual-contribution" className={navLinkClass}>
        <Icon name="users" /> Individual Contribution
      </NavLink>
      <NavLink to="/group-reflections" className={navLinkClass}>
        <Icon name="refresh" /> Group Reflections
      </NavLink>
    </nav>
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 bg-ink-900 text-white lg:h-screen lg:sticky lg:top-0">
        <SidebarHeader />
        {nav}
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden no-print flex items-center justify-between bg-ink-900 text-white px-4 py-3 sticky top-0 z-30">
        <SidebarBrand compact />
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2 -mr-2">
          <Icon name="menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-ink-900 text-white flex flex-col h-full">
            <div className="flex items-center justify-between px-4 pt-4">
              <SidebarBrand compact />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div onClick={() => setMobileOpen(false)}>{nav}</div>
            <SidebarFooter />
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

function SidebarBrand({ compact }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`shrink-0 grid place-items-center rounded-lg bg-brand-500 ${compact ? 'w-8 h-8' : 'w-9 h-9'}`}>
        <svg viewBox="0 0 24 24" className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="font-semibold text-sm text-white">Clinical Portfolio</p>
        {!compact && <p className="text-xs text-ink-400 truncate max-w-[10rem]">{GROUP_NAME}</p>}
      </div>
    </div>
  )
}

function SidebarHeader() {
  return (
    <div className="px-4 pt-6 pb-4 border-b border-ink-800">
      <SidebarBrand />
    </div>
  )
}

function SidebarFooter() {
  return (
    <div className="px-4 py-4 border-t border-ink-800 text-xs text-ink-500">
      University of Southern Mindanao — College of Medicine
    </div>
  )
}
