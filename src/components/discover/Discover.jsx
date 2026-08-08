import React from 'react'
import MediaConsole from '../movies/MediaConsole'

// Unlike Movies/Shows/Anime, Discover has no baseGenres/originLanguage
// constraint (the full, unfiltered catalog) and no presets — it was
// always a pure filter/search tool, not a curated browse page with
// quick shortcuts, so that scope stays as-is rather than growing here.
const MEDIA_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
]

const Discover = () => (
  <MediaConsole
    mediaType="movie"
    mediaTypes={MEDIA_TYPES}
    title="Discover"
    eyebrowLabel="Cinegraph // Catalog Index"
    presets={[]}
  />
)

export default Discover
