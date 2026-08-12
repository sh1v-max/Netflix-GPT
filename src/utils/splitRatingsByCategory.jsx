// Buckets rated titles into three mutually exclusive categories so "For
// You" can personalize each one from its own slice of history, instead of
// one mixed profile whose recommendations skew toward whichever category
// dominates the ratings. Same Animation-genre approximation `Anime.jsx`
// uses elsewhere in the app (genre id 16) — that page also restricts to
// Japanese original_language, which isn't stored per rating in
// preferencesSlice, so this bucket is "animated" rather than strictly
// "Japanese animated." Good enough to separate these rows; not used
// anywhere stricter.
const ANIMATION_GENRE_ID = 16

const emptyBucket = () => ({ ratings: {}, ratedGenres: {}, ratedYears: {} })

export const splitRatingsByCategory = (ratings = {}, ratedGenres = {}, ratedYears = {}) => {
  const buckets = { movie: emptyBucket(), tv: emptyBucket(), anime: emptyBucket() }

  Object.keys(ratings).forEach((docId) => {
    const mediaType = docId.split('_')[0]
    const genres = ratedGenres[docId] || []
    const category = genres.includes(ANIMATION_GENRE_ID)
      ? 'anime'
      : mediaType === 'tv'
      ? 'tv'
      : 'movie'

    buckets[category].ratings[docId] = ratings[docId]
    buckets[category].ratedGenres[docId] = genres
    buckets[category].ratedYears[docId] = ratedYears[docId]
  })

  return buckets
}
