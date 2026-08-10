import React from 'react'

// Reusable bracket-corner frame — used by ConsoleHeader and MovieCardHud so
// neither has to duplicate the 4-span corner markup. `.hud-corner` classes
// live in index.css since a single element only gets 2 pseudo-elements,
// not 4 corners.
const HudFrame = ({ children, className = '' }) => (
  <div className={`hud-panel relative ${className}`}>
    <span className="hud-corner hud-corner--tl" aria-hidden="true" />
    <span className="hud-corner hud-corner--tr" aria-hidden="true" />
    <span className="hud-corner hud-corner--bl" aria-hidden="true" />
    <span className="hud-corner hud-corner--br" aria-hidden="true" />
    {children}
  </div>
)

export default HudFrame
