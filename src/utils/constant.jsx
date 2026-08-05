export const USER_AVATAR =
  'https://occ-0-6247-2164.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdpkabKqQAxyWzo6QW_ZnPz1IZLqlmNfK-t4L1VIeV1DY00JhLo_LMVFp936keDxj-V5UELAVJrU--iUUY2MaDxQSSO-0qw.png?r=e6e'
export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w500'
export const BACKDROP_CDN_URL = 'https://image.tmdb.org/t/p/w1280'
export const PROFILE_CDN_URL = 'https://image.tmdb.org/t/p/w185'
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
export const SUPPORTED_LANG = [
  { identifier: 'en', name: 'English' },
  { identifier: 'hi', name: 'Hindi' },
  { identifier: 'es', name: 'Spanish' },
  { identifier: 'fr', name: 'French' },
  { identifier: 'de', name: 'German' },
  { identifier: 'ja', name: 'Japanese' },
  { identifier: 'fl', name: 'Filipino' },
]
export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
  },
};
// Gemini calls go through gpt-proxy-worker (Cloudflare Worker) — the key
// lives server-side as a Worker secret, never in frontend code. See
// gpt-proxy-worker/src/index.js for the prompt + model.
export const GPT_PROXY_URL = import.meta.env.VITE_GPT_PROXY_URL

// TMDB list items use `release_date` (movies) or `first_air_date` (tv) —
// this reads whichever is present and returns just the year, or null.
export const getReleaseYear = (item) => {
  const date = item?.release_date || item?.first_air_date
  return date ? Number(date.slice(0, 4)) : null
}
