import { API_OPTIONS, TMDB_BASE_URL } from './constant'

// Routes to /search/movie or /search/tv based on the mediaType GPT
// classified the suggestion as (see gpt-proxy-worker's GPT_QUERY) — used
// by both a real search (GptSearch.jsx) and the no-query "For You"
// recommendations (useForYouRecommendations.jsx), kept in one place so
// the two don't drift on how a title gets looked up.
export const searchTitleTMDB = async (name, mediaType) => {
  const endpoint = mediaType === 'tv' ? 'tv' : 'movie'
  const data = await fetch(
    `${TMDB_BASE_URL}/search/${endpoint}?query=${encodeURIComponent(name)}&include_adult=false&language=en-US&page=1`,
    API_OPTIONS
  )
  const json = await data.json()
  return json.results
}
