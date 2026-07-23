import { useLayoutEffect, useRef } from 'react'

/** Page-level header used at the top of every page. */
export function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-500">
          {description}
        </p>
      )}
    </div>
  )
}

/** A titled card/section wrapper, the base visual unit of every page. */
export function Section({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7 ${className}`}>
      {title && (
        <div className="mb-5">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
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

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800',
    ghost: 'bg-transparent text-ink-600 hover:bg-ink-100',
    danger: 'bg-transparent text-red-600 hover:bg-red-50',
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

/** A callout / notice box, e.g. for confidentiality warnings. */
export function Notice({ tone = 'brand', title, children }) {
  const tones = {
    brand: 'bg-brand-50 border-brand-200 text-brand-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
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
