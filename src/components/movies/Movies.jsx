import React from 'react'
import MediaConsole from './MediaConsole'
import { MOVIE_PRESETS } from './PresetChips'

const Movies = () => (
  <MediaConsole
    mediaType="movie"
    title="Movies"
    eyebrowLabel="Cinegraph // Movie Index"
    presets={MOVIE_PRESETS}
  />
)

export default Movies
