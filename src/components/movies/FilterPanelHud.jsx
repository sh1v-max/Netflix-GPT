import React from 'react'
import FilterPanel from '../discover/FilterPanel'
import HudFrame from './HudFrame'

// Thin wrapper — FilterPanel itself is untouched logic-wise, this just adds
// HUD chrome around it and passes variant="hud" for cyan-accented controls.
const FilterPanelHud = ({ filters, onFiltersChange }) => (
  <HudFrame className="p-5">
    <FilterPanel
      mediaType="movie"
      filters={filters}
      onFiltersChange={onFiltersChange}
      variant="hud"
    />
  </HudFrame>
)

export default FilterPanelHud
