/** A dark, magazine-cover-style banner used at the top of every page —
 * the "chapter cover" that gives the portfolio a consistent, designed
 * identity instead of a plain white page title. Pass `image` (department
 * pages, Home) for a photographic banner with a brand-tinted wash for text
 * legibility; omit it for the plain gradient used on data/reflection pages.
 * `actions` render inside a light pill so PageActions' icon stays legible
 * against the dark background regardless of variant. */
export default function PageHero({ eyebrow, title, description, image, actions, children, compact = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl mb-6 shadow-lg shadow-brand-900/15 ${
        compact ? 'px-5 py-6 sm:px-8 sm:py-7' : 'px-6 py-9 sm:px-10 sm:py-12'
      }`}
    >
      {image ? (
        <>
          <img src={image} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e2a19]/93 via-brand-900/85 to-[#0e2a19]/88" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f5b34] via-brand-800 to-[#0e2a19]" />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'radial-gradient(480px 240px at 88% -10%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(360px 220px at 4% 120%, rgba(255,255,255,0.08), transparent 60%)',
        }}
      />
      <div className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-300" />
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">{eyebrow}</p>
            </div>
          )}
          <h1 className={`font-display font-semibold text-white tracking-tight max-w-2xl ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'}`}>
            {title}
          </h1>
          {description && (
            <p className={`mt-2 leading-relaxed text-brand-100/90 ${compact ? 'max-w-xl text-sm' : 'max-w-2xl text-[15px]'}`}>
              {description}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex gap-2 shrink-0 bg-white/95 backdrop-blur rounded-xl p-1 shadow-sm">{actions}</div>
        )}
      </div>
    </div>
  )
}
