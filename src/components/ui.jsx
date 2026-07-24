import { useLayoutEffect, useRef } from 'react'

/** Page-level header used at the top of every page. `actions` (typically a
 * <PageActions>) renders top-right, alongside the title, so entry-point
 * controls like Edit/Export are visible without scrolling past the page's
 * content first. */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-[3px] rounded-full bg-brand-500" />
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            {eyebrow}
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <h1 className="min-w-0 font-display text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
          {title}
        </h1>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
      {description && (
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-500">
          {description}
        </p>
      )}
    </div>
  )
}

/** A titled card/section wrapper, the base visual unit of every page.
 * `actions` (e.g. a section-scoped "Export to PDF") renders top-right,
 * inline with the title, instead of floating as a separate row.
 *
 * `variant="showcase"` is for narrative/reflection content meant to be
 * read rather than edited (case presentations, reflections, group notes):
 * a warmer shadow, a brand hairline, and roomier padding set it apart from
 * plain data-entry Sections (forms, tables), which keep the default look. */
export function Section({ title, subtitle, actions, children, className = '', variant = 'default' }) {
  const showcase = variant === 'showcase'
  return (
    <section
      className={`relative bg-white border rounded-2xl ${
        showcase
          ? 'border-ink-200/60 card-shadow-lg p-6 sm:p-9 overflow-hidden'
          : 'border-ink-200/70 card-shadow p-5 sm:p-7'
      } ${className}`}
    >
      {showcase && <span className="accent-bar-top" />}
      {title && (
        <div className="mb-5 pb-4 border-b border-ink-100 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h2 className={`font-display font-semibold text-ink-900 ${showcase ? 'text-lg' : 'text-base'}`}>
              {title}
            </h2>
            {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/** Single-line text input bound to a controlled value. */
export function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <input className="field-input" {...props} />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

/** Select dropdown. */
export function SelectField({ label, hint, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <select className="field-select" {...props}>
        {children}
      </select>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

/** Auto-growing textarea bound to a controlled value. */
export function Area({ label, hint, value, onChange, minRows = 3, ...props }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <textarea
        ref={ref}
        className="field-textarea"
        value={value}
        onChange={onChange}
        style={{ minHeight: `${minRows * 1.5 + 1.25}rem` }}
        {...props}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

/** A labeled group of two or more fields, laid out on a responsive grid. */
export function FieldRow({ children, cols = 2 }) {
  const colClass = cols === 3 ? 'sm:grid-cols-3' : cols === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-2'
  return <div className={`grid grid-cols-1 ${colClass} gap-4`}>{children}</div>
}

/** An add/remove-able numbered list of short text answers (problem lists, DDx, etc). */
export function ListField({ label, hint, items, onChange, placeholder, addLabel = 'Add item' }) {
  function updateItem(i, val) {
    const next = [...items]
    next[i] = val
    onChange(next)
  }
  function removeItem(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  function addItem() {
    onChange([...items, ''])
  }

  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-sm font-medium text-ink-400 text-right">{i + 1}.</span>
            <input
              className="field-input"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              aria-label="Remove item"
              className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <IconTrash />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        <IconPlus /> {addLabel}
      </button>
      {hint && <p className="field-hint mt-2">{hint}</p>}
    </div>
  )
}

/** Bordered, rounded wrapper around a data table (see .data-table in
 * index.css for header/row/hover/zebra styling). Wrap raw <thead>/<tbody>
 * children directly, same as a plain <table>. */
export function Table({ children, minWidth = '720px', className = '' }) {
  return (
    <div className="rounded-xl border border-ink-200/70 overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`data-table w-full ${className}`} style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  )
}

/** Table header cell. Pass sortKey + sortState + onSort to make it a
 * clickable sort toggle with a direction arrow. */
export function Th({ children, sortKey, sortState, onSort, className = '' }) {
  const sortable = Boolean(sortKey && onSort)
  const active = sortable && sortState?.key === sortKey
  return (
    <th
      className={`${sortable ? 'cursor-pointer select-none hover:text-brand-700' : ''} ${className}`}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      {children}
      {active && <span className="ml-1">{sortState.dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-sm shadow-brand-900/20 hover:from-brand-700 hover:to-brand-800',
    ghost: 'bg-transparent text-ink-600 hover:bg-ink-100',
    danger: 'bg-white text-red-600 border border-red-100 hover:bg-red-50',
    outline: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50',
  }
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function IconPlus(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
    </svg>
  )
}

export function IconPencil(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/** A centered overlay dialog. Closes on backdrop click or the X button.
 * `footer` is optional — most callers instead put action buttons at the
 * bottom of `children` so they can vary by view/edit mode in place. */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-display text-base font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 grid place-items-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
          >
            <IconClose />
          </button>
        </div>
        <div className="px-5 sm:px-7 py-5">{children}</div>
        {footer && <div className="flex gap-2 justify-end px-5 sm:px-7 py-4 border-t border-ink-100">{footer}</div>}
      </div>
    </div>
  )
}

/** A callout / notice box, e.g. for confidentiality warnings. */
export function Notice({ tone = 'brand', title, children }) {
  const tones = {
    brand: 'bg-brand-50 border-brand-200 text-brand-900',
    amber: 'bg-amber-50/70 border-amber-200 text-amber-900',
  }
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${tones[tone]}`}>
      {title && <p className="font-semibold text-sm mb-1">{title}</p>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

/** Inline loading/error state for a Supabase-backed read, used at the top of a page/section while data is loading or failed to load. */
export function LoadState({ status, error, children }) {
  if (status === 'loading') {
    return <p className="text-sm text-ink-400 animate-pulse">Loading…</p>
  }
  if (status === 'error') {
    return (
      <Notice tone="amber" title="Couldn't load this data">
        {error || 'Something went wrong talking to the database. Please refresh and try again.'}
      </Notice>
    )
  }
  return children
}

/** Entry-point actions for an editable page/card: an always-visible, low-
 * emphasis Edit icon plus an optional "Export to PDF". Pass as PageHeader's
 * `actions` prop, top-right next to the title — renders nothing once
 * editing starts (Cancel/Save then live in <EditBar> at the bottom, where
 * editing actually ends). Edit is intentionally a small icon rather than a
 * full button so it doesn't compete with the content for attention, while
 * staying one click away for the student authoring the page. */
export function PageActions({ editing, onEdit, onExport, exporting }) {
  if (editing) return null
  return (
    <>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit this page"
        title="Edit this page"
        className="w-9 h-9 grid place-items-center rounded-lg bg-white/95 backdrop-blur shadow-sm text-ink-400 hover:text-brand-700 hover:bg-white transition-colors"
      >
        <IconPencil />
      </button>
      {onExport && (
        <Button variant="outline" onClick={onExport} disabled={exporting}>
          {exporting ? 'Preparing PDF…' : 'Export to PDF'}
        </Button>
      )}
    </>
  )
}

/** Bottom Cancel/Save bar for a page/card edited as one unit via
 * useEditableFields — pairs with <PageActions> at the top. Stays mounted
 * briefly after Save (editing already false) just to show the "Saved"
 * confirmation via SaveStatus, then disappears once saveState settles. */
export function EditBar({ editing, onCancel, onSave, saving, saveState }) {
  if (!editing && (!saveState || saveState === 'idle')) return null
  return (
    <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100">
      <SaveStatus state={saveState} />
      {editing && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      )}
    </div>
  )
}

/** Inline save-state indicator: idle / saving / saved / error. */
export function SaveStatus({ state }) {
  if (state === 'idle' || !state) return null
  const config = {
    saving: { label: 'Saving…', className: 'text-ink-400' },
    saved: { label: 'Saved', className: 'text-emerald-600' },
    error: { label: 'Failed to save, please retry', className: 'text-red-600' },
  }[state]
  if (!config) return null
  return <span className={`text-xs font-medium ${config.className}`}>{config.label}</span>
}
