import { useState } from 'react'

/** Turns a per-keystroke-autosaving field set (the {values/record, setField,
 * flush} shape returned by useSupabaseRecord/useDepartmentNotes) into an
 * explicit Edit -> edit a local draft -> Save/Cancel flow, so a whole
 * page/card edits and saves as one unit instead of committing every
 * keystroke or needing a Save button per field. */
export function useEditableFields(values, setField, flush) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)

  function start() {
    setDraft(values)
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
  }

  function set(key, value) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  async function save() {
    setSaving(true)
    for (const [key, value] of Object.entries(draft)) setField(key, value)
    await flush()
    setSaving(false)
    setEditing(false)
  }

  return { editing, draft, start, cancel, set, save, saving }
}
