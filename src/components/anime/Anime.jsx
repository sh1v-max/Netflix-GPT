import React from 'react'
import Discover from '../discover/Discover'

// TMDB has no first-class "anime" media type — it's approximated as
// Animation genre (id 16, same for movies and TV) restricted to Japanese
// original-language titles. baseGenres forces Animation on every request
// (AND'd with any further genre picks); excludeGenreIds hides the Animation
// chip itself from the filter panel since it's already implied, not optional.
const ANIMATION_GENRE_ID = 16

const Anime = () => (
  <Discover
    title="Anime"
    subtitle="Japanese animation — movies and series, filtered to the good stuff."
    baseGenres={[ANIMATION_GENRE_ID]}
    originLanguage="ja"
    excludeGenreIds={[ANIMATION_GENRE_ID]}
  />
)

export default Anime
