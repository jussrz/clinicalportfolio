// Hero photos are free-to-use Unsplash License images (no attribution
// required), fetched at a fixed crop/width so every department banner
// loads a similarly sized asset.
const unsplash = (photoId) => `https://images.unsplash.com/${photoId}?fm=jpg&q=70&w=1600&auto=format&fit=crop`

export const departments = [
  {
    slug: 'pediatrics',
    name: 'Pediatrics',
    short: 'Peds',
    blurb: 'Well-child care, common pediatric illnesses, growth & development.',
    image: unsplash('photo-1676313030076-4ac0b37050fd'),
  },
  {
    slug: 'family-community-medicine',
    name: 'Family and Community Medicine',
    short: 'FCM',
    blurb: 'Primary care, community health, continuity of care across the lifespan.',
    image: unsplash('photo-1758691462666-6470b740f544'),
  },
  {
    slug: 'internal-medicine',
    name: 'Internal Medicine',
    short: 'IM',
    blurb: 'Adult medicine, chronic disease management, ward-based care.',
    image: unsplash('photo-1532938911079-1b06ac7ceec7'),
  },
  {
    slug: 'surgery',
    name: 'Surgery',
    short: 'Surgery',
    blurb: 'Pre-, intra-, and post-operative care; surgical decision-making.',
    image: unsplash('photo-1640876777012-bdb00a6323e2'),
  },
  {
    slug: 'obstetrics-gynecology',
    name: 'Obstetrics and Gynecology',
    short: 'OB-Gyne',
    blurb: 'Antenatal care, labor and delivery, gynecologic conditions.',
    image: unsplash('photo-1457342813143-a1ae27448a82'),
  },
]

export const departmentBySlug = (slug) => departments.find((d) => d.slug === slug)
