// filters: { withGenres: [id, ...], baseGenres: [id, ...], minYear, maxYear,
//            minRating, minVoteCount, sortBy, originLanguage }
//
// `minVoteCount` is not user-facing in FilterPanel — it's injected
// programmatically (see MediaConsole.jsx's PRESET_SORT_FALLBACK) when a
// preset like "Top Rated" converts into a plain `sort_by=vote_average.desc`
// discover query, since sorting by rating alone surfaces obscure titles
// with a single 10/10 vote ahead of anything genuinely well-regarded.
//
// `baseGenres` is for constraints a page always applies (e.g. the Anime page
// forcing Animation) that the user can't remove — when present, the whole
// genre list is comma-joined (AND — must match all), since a title needs to
// satisfy the mandatory genre *and* any further picks. Without `baseGenres`,
// `withGenres` alone stays pipe-joined (OR — match any), which is what plain
// Discover wants ("show me Action or Comedy").
export const buildDiscoverParams = (filters = {}, page = 1) => {
  const params = new URLSearchParams({
    language: 'en-US',
    page,
    sort_by: filters.sortBy || 'popularity.desc',
  })

  const genreIds = [...(filters.baseGenres || []), ...(filters.withGenres || [])]
  if (genreIds.length) {
    const separator = filters.baseGenres?.length ? ',' : '|'
    params.set('with_genres', genreIds.join(separator))
  }

  const dateField = filters.mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'
  if (filters.minYear) {
    params.set(`${dateField}.gte`, `${filters.minYear}-01-01`)
  }
  if (filters.maxYear) {
    params.set(`${dateField}.lte`, `${filters.maxYear}-12-31`)
  }
  if (filters.minRating) {
    params.set('vote_average.gte', filters.minRating)
  }
  if (filters.minVoteCount) {
    params.set('vote_count.gte', filters.minVoteCount)
  }
  if (filters.originLanguage) {
    params.set('with_original_language', filters.originLanguage)
  }
  return params.toString()
}
