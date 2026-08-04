// Shared icon set for both the Studio admin sidebar and the public
// showcase nav, so the two shells draw from one visual vocabulary.
export const icons = {
  home: 'M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-13.5-2 5-5 2 2-5 5-2Z',
  table: 'M3 5h18M3 12h18M3 19h18M8 5v14M16 5v14',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 17l9 5 9-5',
  bookmark: 'M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z',
  presentation: 'M3 4h18M4 4v11a1 1 0 0 0 1 1h4l-2 4M20 4v11a1 1 0 0 0-1 1h-4l2 4M12 15v-4',
  activity: 'M3 12h4l2 7 4-14 2 7h6',
  message: 'M4 4h16v12H8l-4 4V4Z',
  users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a5.5 5.5 0 0 1 11 0M16.5 11a3 3 0 1 0 0-6M15 14.5a5.5 5.5 0 0 1 6.5 5.5',
  refresh: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
  calendar: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM4 9.5h16M8 3v3M16 3v3',
  list: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
}

export function Icon({ name, className = 'w-[18px] h-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={icons[name]} />
    </svg>
  )
}
