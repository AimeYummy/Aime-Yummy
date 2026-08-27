import React from 'react'

const paths = {
  dashboard: <><path d="M3 13h8V3H3z"/><path d="M13 21h8v-8h-8z"/><path d="M13 3h8v6h-8z"/><path d="M3 17h8v4H3z"/></>,
  menu: <><path d="M4 5h16"/><path d="M4 9h16"/><path d="M4 13h10"/><path d="M4 17h8"/></>,
  stock: <><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M12 21V12"/><path d="m3.5 7.7 8.5 4.4 8.5-4.4"/></>,
  table: <><rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 17v3M16 17v3M8 9h8M8 13h8"/></>,
  sales: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 14 3-3 3 2 5-6"/><path d="M16 7h2v2"/></>,
  performance: <><path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-7"/></>,
  export: <><path d="M12 3v11"/><path d="m8 10 4 4 4-4"/><path d="M5 19h14"/></>,
  external: <><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
  logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-5"/></>,
  menuIcon: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  close: <><path d="M6 6l12 12M18 6 6 18"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  alert: <><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.9-4L3 10"/><path d="M3 4v6h6"/><path d="M4 13a8 8 0 0 0 14.9 4L21 14"/><path d="M21 20v-6h-6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  edit: <><path d="m4 20 4.5-1 9.8-9.8a2.12 2.12 0 0 0-3-3L5.5 16z"/><path d="m13.5 7.5 3 3"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/></>,
  chevron: <><path d="m8 10 4 4 4-4"/></>,
}

export default function AdminIcon({name='dashboard', size=18, className=''}) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name] || paths.dashboard}</svg>
}
