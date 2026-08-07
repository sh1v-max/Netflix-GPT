import React from 'react'

const PRESETS = [
  { value: null, label: 'All Titles' },
  { value: 'trending', label: 'Trending' },
  { value: 'now_playing', label: 'Now Playing' },
  { value: 'popular', label: 'Popular' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'upcoming', label: 'Upcoming' },
]

// Bracket-corner chips — deliberately not FilterPanel's pill style, these
// are query-mode switches, not multi-select filters.
const PresetChips = ({ activePreset, onSelect }) => (
  <div className="flex flex-wrap gap-2 px-4 md:px-8 pt-5 pb-4">
    {PRESETS.map((preset) => {
      const isActive = activePreset === preset.value
      return (
        <button
          key={preset.label}
          onClick={() => onSelect(preset.value)}
          className={`relative font-mono text-[11px] uppercase tracking-wide px-3.5 py-1.5 cursor-pointer transition-colors duration-200 ${
            isActive
              ? 'hud-panel text-hud-cyan border-hud-cyan'
              : 'bg-transparent text-text-dark-muted border border-border-hairline hover:border-hud-line hover:text-text-dark'
          }`}
        >
          {isActive && (
            <>
              <span className="hud-corner hud-corner--tl" aria-hidden="true" />
              <span className="hud-corner hud-corner--tr" aria-hidden="true" />
              <span className="hud-corner hud-corner--bl" aria-hidden="true" />
              <span className="hud-corner hud-corner--br" aria-hidden="true" />
            </>
          )}
          {preset.label}
        </button>
      )
    })}
  </div>
)

export default PresetChips
