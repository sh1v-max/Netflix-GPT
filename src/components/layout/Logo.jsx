import React from 'react'

const Logo = ({ className = '' }) => {
  return (
    <span
      className={`font-display font-semibold tracking-tight text-xl md:text-2xl select-none ${className}`}
    >
      Cine<span className="text-accent2">graph</span>
    </span>
  )
}

export default Logo
