import React from 'react'

const Logo = ({ className = '' }) => {
  return (
    <span
      className={`font-display font-semibold tracking-tight text-xl md:text-2xl select-none ${className}`}
    >
      Cine<span className="text-hud-cyan-strong">graph</span>
    </span>
  )
}

export default Logo
