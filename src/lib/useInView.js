import { useEffect, useRef, useState } from 'react'

/** Tracks whether an element has scrolled into the viewport, for
 * scroll-triggered reveal animations (see Reveal.jsx). Unobserves after the
 * first trigger by default since reveals are one-shot, not repeating. */
export function useInView({ once = true, threshold = 0.15 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, threshold])

  return [ref, inView]
}
