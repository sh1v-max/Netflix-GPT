import React from 'react'
import MediaConsole from '../movies/MediaConsole'
import { TV_PRESETS } from '../movies/PresetChips'

const Shows = () => (
  <MediaConsole
    mediaType="tv"
    title="Shows"
    eyebrowLabel="Cinegraph // Series Index"
    presets={TV_PRESETS}
  />
)

export default Shows
