import React from 'react'
import MediaConsole from '../movies/MediaConsole'

// TMDB has no first-class "anime" media type — it's approximated as
// Animation genre (id 16, same for movies and TV) restricted to Japanese
// original-language titles. baseGenres forces Animation on every request
// (AND'd with any further genre picks); excludeGenreIds hides the Animation
// chip itself from the filter panel since it's already implied, not
// optional. No `presets` — TMDB's fixed list endpoints (Trending/Popular/
// etc.) don't accept genre/language params, so they can't respect this
// constraint; offering them would silently show non-anime results.
const ANIMATION_GENRE_ID = 16

const MEDIA_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
]

const Anime = () => (
  <MediaConsole
    mediaType="movie"
    mediaTypes={MEDIA_TYPES}
    title="Anime"
    eyebrowLabel="Cinegraph // Anime Index"
    baseGenres={[ANIMATION_GENRE_ID]}
    originLanguage="ja"
    excludeGenreIds={[ANIMATION_GENRE_ID]}
  />
)

export default Anime
