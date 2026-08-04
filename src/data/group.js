export const GROUP_NAME = 'Group 5'

// Full form, used on Home pages and the site footer.
export const SCHOOL_NAME = 'University of Southern Mindanao – College of Medicine'

// Abbreviated form, used where space is tight (PDF letterheads).
export const SCHOOL_NAME_SHORT = 'USM College of Medicine'

export const ROTATION_LABEL = 'Clinical Rotation – SY 2026–2027'

// Surnames as assigned on the rotation roster. First names/initials and
// per-student roles are left blank for the group to fill in.
export const GROUP_MEMBERS = [
  'Ramojal',
  'Remonde',
  'Reyes',
  'Rubite',
  'Saad',
  'Sakilan',
  'Suarez',
  'Talaid',
  'Tan',
  'Tanandato',
]

// Full names as listed on the rotation roster, keyed by surname (matches
// GROUP_MEMBERS) — used to label roster dropdowns and pre-fill per-student
// forms instead of retyping a name that's already known.
export const GROUP_MEMBER_FULL_NAMES = {
  Ramojal: 'RAMOJAL, Via Erika Nicole S.',
  Remonde: 'REMONDE, Maverick Spencer A.',
  Reyes: 'REYES, Jhunnelyn B.',
  Rubite: 'RUBITE, Wella Erica Q.',
  Saad: 'SAAD, Johaydin C.',
  Sakilan: 'SAKILAN, Kimark L.',
  Suarez: 'SUAREZ, Shamley D',
  Talaid: 'TALAID, Arjane J.',
  Tan: 'TAN, Christine Abigail B.',
  Tanandato: 'TANANDATO, Dalidig Jr. N',
}

export function studentFullName(surname) {
  return GROUP_MEMBER_FULL_NAMES[surname] ?? surname
}
