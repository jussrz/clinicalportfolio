import { supabase } from './supabase'

export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

/** Uploads a profile photo to the public `avatars` storage bucket, one file
 * per student (upsert overwrites their previous photo instead of piling up
 * orphaned files at their old path). Returns a cache-busted public URL so a
 * re-upload at the same path shows immediately instead of the browser's
 * cached old image. */
export async function uploadAvatar(file, studentSurname) {
  if (!file.type.startsWith('image/')) {
    return { error: { message: 'Please choose an image file.' } }
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: { message: 'Image must be smaller than 5MB.' } }
  }
  const ext = file.name.split('.').pop()
  const path = `${studentSurname.toLowerCase()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) return { error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: `${data.publicUrl}?t=${Date.now()}` }
}
