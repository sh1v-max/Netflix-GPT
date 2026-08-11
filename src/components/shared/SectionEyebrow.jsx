import React from 'react'

// Minimal section divider — icon + mono uppercase label + a thin hairline,
// instead of a filled/bordered panel. Shared across DetailPage/Watchlist/
// Profile so every "start of a body section" reads the same way across the
// app, in the same restrained space-theme language (cyan accent, mono
// type) established in DetailPage's 2.21 redesign.
const SectionEyebrow = ({ icon: Icon, children, action }) => (
  <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-hud-line/25">
    <div className="flex items-center gap-2 text-hud-cyan">
      <Icon size={13} />
      <span className="font-mono text-[11px] uppercase tracking-[0.15em]">{children}</span>
    </div>
    {action}
  </div>
)

export default SectionEyebrow
