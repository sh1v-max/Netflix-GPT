import React from 'react'

// Reusable bracket-corner frame — used by ConsoleHeader and MovieCardHud so
// neither has to duplicate the 4-span corner markup. `.hud-corner` classes
// live in index.css since a single element only gets 2 pseudo-elements,
// not 4 corners.
//
// `glass`: swaps the default opaque `.hud-panel` background (solid
// bg-elevated — right for console readouts sitting on a vignetted
// backdrop) for a translucent, blurred one — for panels sitting directly
// over imagery where the point is to still see the photo through it
// (DetailPage's hero record panel). Corner brackets stay identical either
// way.
const HudFrame = ({ children, className = '', glass = false }) => (
  <div
    className={`relative ${
      glass ? 'bg-ink/35 backdrop-blur-lg border border-hud-line' : 'hud-panel'
    } ${className}`}
  >
    <span className="hud-corner hud-corner--tl" aria-hidden="true" />
    <span className="hud-corner hud-corner--tr" aria-hidden="true" />
    <span className="hud-corner hud-corner--bl" aria-hidden="true" />
    <span className="hud-corner hud-corner--br" aria-hidden="true" />
    {children}
  </div>
)

export default HudFrame
