import React from 'react'
import { Link } from 'react-router-dom'

// Fixed bottom tab bar for mobile — sm:hidden, replaces the desktop
// inline <nav> (hidden below that breakpoint) rather than a hamburger
// drawer, per explicit user preference: icon + label per tab, active tab
// highlighted, everything reachable in one tap instead of two.
const MobileBottomNav = ({ links }) => (
  <nav
    className="sm:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around bg-ink/95 backdrop-blur-xl border-t border-hud-line pb-[env(safe-area-inset-bottom)]"
    aria-label="Primary"
  >
    {links.map(({ to, label, icon: Icon, active }) => (
      <Link
        key={to}
        to={to}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors ${
          active ? 'text-hud-cyan-strong font-semibold' : 'text-text-dark-muted'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
        {label}
      </Link>
    ))}
  </nav>
)

export default MobileBottomNav
