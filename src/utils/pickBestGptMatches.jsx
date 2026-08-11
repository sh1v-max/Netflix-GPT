// Each GPT-suggested title maps to an array of TMDB search matches — often
// several near-duplicates (reissues, regional titles, franchise entries
// sharing a name), sometimes just one, occasionally none. Showing the
// whole array per suggestion made rows visually inconsistent (some had
// one poster, some had several near-identical ones). Only the single best
// match per suggestion is kept, so N suggestions reliably render as N
// posters (minus any with zero TMDB matches, which are dropped silently).
//
// `mediaType` per item comes from GPT's own classification (searchTitleTMDB
// already searched the right endpoint using it) rather than the TMDB
// result object — /search/tv and /search/movie results don't carry a
// `media_type` field themselves (only TMDB's multi-search endpoint does).
export const pickBestGptMatches = (movieNames, movieResults, reasons, mediaTypes = []) =>
  movieNames
    .map((name, i) => ({
      movie: movieResults[i]?.[0],
      reason: reasons?.[i],
      mediaType: mediaTypes[i] === 'tv' ? 'tv' : 'movie',
    }))
    .filter((item) => item.movie)
