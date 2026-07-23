export const departments = [
  {
    slug: 'pediatrics',
    name: 'Pediatrics',
    short: 'Peds',
    blurb: 'Well-child care, common pediatric illnesses, growth & development.',
  },
  {
    slug: 'family-community-medicine',
    name: 'Family and Community Medicine',
    short: 'FCM',
    blurb: 'Primary care, community health, continuity of care across the lifespan.',
  },
  {
    slug: 'internal-medicine',
    name: 'Internal Medicine',
    short: 'IM',
    blurb: 'Adult medicine, chronic disease management, ward-based care.',
  },
  {
    slug: 'surgery',
    name: 'Surgery',
    short: 'Surgery',
    blurb: 'Pre-, intra-, and post-operative care; surgical decision-making.',
  },
  {
    slug: 'obstetrics-gynecology',
    name: 'Obstetrics and Gynecology',
    short: 'OB-Gyne',
    blurb: 'Antenatal care, labor and delivery, gynecologic conditions.',
  },
]

export const departmentBySlug = (slug) => departments.find((d) => d.slug === slug)
