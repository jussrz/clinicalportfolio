import { useInView } from '../lib/useInView'

/** Fades and rises its children into place the first time they scroll into
 * view (see .reveal/.reveal-visible in index.css). `delay` (ms) staggers a
 * list of Reveals — e.g. tiles in a grid — without needing a parent-level
 * stagger helper. */
export default function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'reveal-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
