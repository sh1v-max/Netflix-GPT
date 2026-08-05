// Pure, client-side computation from data already live in Redux
// (preferencesSlice, synced via usePreferencesSync) — no extra Firestore
// read or write. A persisted `users/{uid}/profile` doc is deferred until
// Phase 3 actually needs one (a server-side Cloud Function reading it for
// prompt personalization); until then, computing it on read is simpler
// and can't go stale.
export const computeTasteProfile = (ratings = {}, ratedGenres = {}, ratedYears = {}) => {
  const genreScore = {} // genreId -> net score (like: +1, dislike: -1)
  const decadeCount = {} // decade (e.g. 1990) -> count of liked titles
  let likeCount = 0
  let dislikeCount = 0

  Object.entries(ratings).forEach(([docId, rating]) => {
    const weight = rating === 'like' ? 1 : -1
    if (rating === 'like') likeCount++
    else dislikeCount++

    const genres = ratedGenres[docId] || []
    genres.forEach((genreId) => {
      genreScore[genreId] = (genreScore[genreId] || 0) + weight
    })

    if (rating === 'like') {
      const year = ratedYears[docId]
      if (year) {
        const decade = Math.floor(year / 10) * 10
        decadeCount[decade] = (decadeCount[decade] || 0) + 1
      }
    }
  })

  const sortedGenres = Object.entries(genreScore).sort((a, b) => b[1] - a[1])
  const topGenres = sortedGenres
    .filter(([, score]) => score > 0)
    .slice(0, 5)
    .map(([genreId, score]) => ({ genreId: Number(genreId), score }))
  const avoidGenres = sortedGenres
    .filter(([, score]) => score < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([genreId, score]) => ({ genreId: Number(genreId), score }))

  const decades = Object.entries(decadeCount)
    .map(([decade, count]) => ({ decade: Number(decade), count }))
    .sort((a, b) => a.decade - b.decade)
  const favoriteDecade = decades.length
    ? decades.reduce((max, d) => (d.count > max.count ? d : max)).decade
    : null

  return {
    topGenres,
    avoidGenres,
    decades,
    favoriteDecade,
    totalRated: likeCount + dislikeCount,
    likeCount,
    dislikeCount,
  }
}
