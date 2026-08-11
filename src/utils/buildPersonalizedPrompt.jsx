// Turns the numeric taste profile (computeTasteProfile) into a short
// natural-language summary to inject into the GPT system prompt. Genre
// names only exist client-side (via useGenres), so this summary is built
// here as plain text and sent to gpt-proxy-worker alongside the query —
// the worker appends it to its own system message rather than receiving
// the raw profile object.
const MIN_RATINGS_TO_PERSONALIZE = 3

export const buildPersonalizedPrompt = (profile, genreNameById) => {
  if (!profile || profile.totalRated < MIN_RATINGS_TO_PERSONALIZE) return null

  const parts = []

  const topGenreNames = profile.topGenres
    .map((g) => genreNameById[g.genreId])
    .filter(Boolean)
  if (topGenreNames.length) {
    parts.push(`favors ${topGenreNames.join(', ')}`)
  }

  if (profile.favoriteDecade) {
    parts.push(`leans toward the ${profile.favoriteDecade}s era`)
  }

  const avoidGenreNames = profile.avoidGenres
    .map((g) => genreNameById[g.genreId])
    .filter(Boolean)
  if (avoidGenreNames.length) {
    parts.push(`tends to dislike ${avoidGenreNames.join(', ')}`)
  }

  if (!parts.length) return null

  return `This user ${parts.join('; ')}. Weigh this alongside their query below, but the query always takes priority.`
}
