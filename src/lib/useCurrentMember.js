import { useCallback, useState } from 'react'
import { GROUP_MEMBERS } from '../data/group'

const CURRENT_MEMBER_KEY = 'clinicalPortfolio.currentMember'

function readStoredMember() {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(CURRENT_MEMBER_KEY)
  return GROUP_MEMBERS.includes(stored) ? stored : null
}

/** Matches a typed surname against the roster, case/whitespace-insensitive. */
export function matchMember(input) {
  const normalized = input.trim().toLowerCase()
  return GROUP_MEMBERS.find((name) => name.toLowerCase() === normalized) ?? null
}

/** Tracks which group member is currently in Edit Mode on this device.
 * This is an identity label, not authentication — the roster is public and
 * anyone can type any surname on it. It exists so the site remembers who's
 * editing across visits, not to restrict what they can touch. */
export function useCurrentMember() {
  const [member, setMember] = useState(readStoredMember)

  const login = useCallback((surname) => {
    const matched = matchMember(surname)
    if (!matched) return null
    window.localStorage.setItem(CURRENT_MEMBER_KEY, matched)
    setMember(matched)
    return matched
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(CURRENT_MEMBER_KEY)
    setMember(null)
  }, [])

  return { member, login, logout }
}
