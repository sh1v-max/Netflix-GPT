import React from 'react'

// Small bracket-cornered pill — a standalone HUD-styled tag (as opposed to
// SectionEyebrow, which is a header for content directly below it). Used
// on hero moments across the app (Home, AI search) to introduce the page
// without a full section divider.
const HudBadge = ({ icon: Icon, children }) => (
  <div className="hud-panel relative inline-flex items-center gap-2 px-3 py-1.5 mb-6">
    <span className="hud-corner hud-corner--tl" aria-hidden="true" />
    <span className="hud-corner hud-corner--tr" aria-hidden="true" />
    <span className="hud-corner hud-corner--bl" aria-hidden="true" />
    <span className="hud-corner hud-corner--br" aria-hidden="true" />
    <Icon size={13} className="text-hud-cyan" />
    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-hud-cyan-strong">
      {children}
    </span>
  </div>
)

export default HudBadge
