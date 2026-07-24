const SIZES = {
  compact: { pad: 'px-5 py-6 sm:px-8 sm:py-7', title: 'text-xl sm:text-2xl', desc: 'max-w-xl text-sm' },
  default: { pad: 'px-6 py-9 sm:px-10 sm:py-12', title: 'text-2xl sm:text-4xl', desc: 'max-w-2xl text-[15px]' },
  xl: { pad: 'px-6 py-12 sm:px-12 sm:py-20', title: 'text-4xl sm:text-6xl', desc: 'max-w-2xl text-base sm:text-lg' },
}

/** A dark, magazine-cover-style banner used at the top of every page —
 * the "chapter cover" that gives the portfolio a consistent, designed
 * identity instead of a plain white page title. Pass `image` (department
 * pages, Home) for a photographic banner with a brand-tinted scrim for text
 * legibility; omit it for the plain gradient used on data/reflection pages.
 * `actions` render as their own separate elements (see PageActions), each
 * carrying its own light background so they stay legible against the dark
 * hero regardless of size. */
export default function PageHero({ eyebrow, title, description, image, actions, children, size = 'default' }) {
  const { pad, title: titleSize, desc: descSize } = SIZES[size]
  const tall = size === 'xl'

  return (
    <div className={`relative overflow-hidden rounded-2xl mb-6 shadow-lg shadow-brand-900/15 ${pad} ${tall ? 'min-h-[58vh] sm:min-h-[64vh] flex flex-col justify-end' : ''}`}>
      {image ? (
        <>
          <img src={image} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          {/* Scrim only behind the text column so the photo itself stays
              visible — a flat wash over the whole image (the old approach)
              reads as a solid color banner, not a photo. */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e2a19]/85 via-[#0e2a19]/40 to-transparent" />
          {(actions || tall) && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a19]/55 via-transparent to-transparent" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f5b34] via-brand-800 to-[#0e2a19]" />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
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
          <h1 className={`font-display font-semibold text-white tracking-tight max-w-2xl ${titleSize}`}>
            {title}
          </h1>
          {description && <p className={`mt-2 leading-relaxed text-brand-100/90 ${descSize}`}>{description}</p>}
          {children}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
