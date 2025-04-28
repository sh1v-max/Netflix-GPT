export const LOGO =
  'https://cdn.cookielaw.org/logos/dd6b162f-1a32-456a-9cfe-897231c7763c/4345ea78-053c-46d2-b11e-09adaef973dc/Netflix_Logo_PMS.png'
export const USER_AVATAR =
  'https://occ-0-6247-2164.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdpkabKqQAxyWzo6QW_ZnPz1IZLqlmNfK-t4L1VIeV1DY00JhLo_LMVFp936keDxj-V5UELAVJrU--iUUY2MaDxQSSO-0qw.png?r=e6e'
export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w500'
export const IMG_BACKGROUND =
  'https://assets.nflxext.com/ffe/siteui/vlv3/fc164b4b-f085-44ee-bb7f-ec7df8539eff/d23a1608-7d90-4da1-93d6-bae2fe60a69b/IN-en-20230814-popsignuptwoweeks-perspective_alpha_website_large.jpg'
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
export const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY

export const GPT_MODEL = 'gpt-3.5-turbo'
export const GPT_QUERY = 'Act as a Movie Recommendation system and suggest some movies for the query, only give me names of 10 movies, the first one should be the one same as the query, comma separated like the example result give ahead. For example: Result1,Result2,Result3,Result4,Result5. Notice there is no space between Result1 and Result2, etc. They are only comma separated. You need to give result in same format'
