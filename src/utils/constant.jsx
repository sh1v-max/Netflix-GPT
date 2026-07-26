export const USER_AVATAR =
  'https://occ-0-6247-2164.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdpkabKqQAxyWzo6QW_ZnPz1IZLqlmNfK-t4L1VIeV1DY00JhLo_LMVFp936keDxj-V5UELAVJrU--iUUY2MaDxQSSO-0qw.png?r=e6e'
export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w500'
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
export const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY

export const GPT_MODEL = 'stepfun/step-3.5-flash:free'
export const GPT_QUERY = 'Act as a Movie Recommendation system and suggest some movies for the query, only give me names of 10 movies, the first one should be the one same as the query, comma separated like the example result give ahead. For example: Result1,Result2,Result3,Result4,Result5. Notice there is no space between Result1 and Result2, etc. They are only comma separated. You need to give result in same format'
