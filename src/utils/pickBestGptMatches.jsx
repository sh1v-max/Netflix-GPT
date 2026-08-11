// Each GPT-suggested title maps to an array of TMDB search matches — often
// several near-duplicates (reissues, regional titles, franchise entries
// sharing a name), sometimes just one, occasionally none. Showing the
// whole array per suggestion made rows visually inconsistent (some had
// one poster, some had several near-identical ones). Only the single best
// match per suggestion is kept, so N suggestions reliably render as N
// posters (minus any with zero TMDB matches, which are dropped silently).
export const pickBestGptMatches = (movieNames, movieResults, reasons) =>
  movieNames
    .map((name, i) => ({ movie: movieResults[i]?.[0], reason: reasons?.[i] }))
    .filter((item) => item.movie)
