import { useEffect, useRef, useState } from 'react'

const PREFIX = 'clinicalportfolio:'

export function useLocalStorage(key, initialValue) {
  const fullKey = PREFIX + key
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(fullKey)
      return raw !== null ? JSON.parse(raw) : initialValue
      // eslint-disable-next-line no-unused-vars
    } catch {
      return initialValue
    }
  })

  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    try {
      window.localStorage.setItem(fullKey, JSON.stringify(value))
      // eslint-disable-next-line no-unused-vars
    } catch {
      // storage unavailable or full; fail silently
    }
  }, [fullKey, value])

  return [value, setValue]
}
