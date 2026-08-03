# Cinegraph — Project Overview

A complete technical reference for everything currently in this
codebase — every technology, every file, every data flow. For *why*
things are built the way they are and what's still in progress, see
[`re-do.md`](re-do.md) (the phase-by-phase build log) and
[`IDEAS.md`](IDEAS.md) (the original brainstorm this plan came from).
This file is the "what exists right now," not the roadmap.

---

## 1. What this is

Cinegraph is an AI movie/show recommendation app built on three
pillars: a real movie/TV database (TMDB-backed), a preference graph
(Firestore-backed ratings, in progress), and an AI recommendation layer
(GPT via OpenRouter). It's a from-scratch rebrand of what started as a
Netflix-clone tutorial project — no borrowed logo, palette, or layout.

---

## 2. Tech stack

| Layer | Technology | Version |
| --- | --- | --- |
| UI library | React | 19 |
| Build tool | Vite | 6 |
| Styling | Tailwind CSS | 4 (token-based `@theme`, no `tailwind.config.js`) |
| State | Redux Toolkit | 2 |
| Routing | React Router | 7 |
| Backend | Firebase | 12 — Authentication, Firestore, Hosting, Analytics |
| Movie/TV data | TMDB API | v3 (read access token) |
| AI search | GPT via OpenRouter | model: `stepfun/step-3.5-flash:free` |
| Icons | react-icons | 5 (`fa`, `bs`, `ai`, `hi2`, `im` sets used) |
| Linting | ESLint 9 | flat config, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| Dev/verification | Playwright | 1 (devDependency — used for visual/runtime verification during development, not an automated test suite) |
| Deploy tooling | firebase-tools | 15 (devDependency) |

All dependencies are declared in `package.json`; nothing here is a
global-only install except your own Firebase CLI login.

---

## 3. Project structure

```
netflixgpt/
├── src/
│   ├── components/
│   │   ├── Body.jsx          route table (createBrowserRouter)
│   │   ├── home/              Home.jsx — marketing landing page (logged-out)
│   │   ├── auth/               Login.jsx — sign in / sign up, split-screen layout
│   │   ├── layout/             Header.jsx, Footer.jsx, Logo.jsx — shared chrome
│   │   ├── browse/             Browse.jsx (movies homepage) + MainContainer,
│   │   │                       SecondaryContainer, VideoBackground, VideoTitle
│   │   ├── shows/               Shows.jsx (TV homepage) + ShowsSecondaryContainer
│   │   ├── discover/           Discover.jsx (filterable catalog + search) + FilterPanel
│   │   ├── anime/               Anime.jsx — thin wrapper around Discover with
│   │   │                       fixed genre/language filters baked in
│   │   ├── detail/              DetailPage.jsx + CastGrid.jsx
│   │   ├── shared/              MovieCard, MovieList, RatingControl — reused
│   │   │                       everywhere a poster or a rating appears
│   │   └── gpt/                 GptSearch, GptSearchBar, GptMovieSuggestions
│   ├── hooks/                  one hook per data source (see §6)
│   ├── store/                   Redux slices + appStore.jsx (see §5)
│   ├── utils/                   config, constants, Firestore helpers (see §4, §7)
│   ├── index.css                design tokens (see §8)
│   ├── App.jsx                  wraps Body.jsx in the Redux <Provider>
│   └── main.jsx                 ReactDOM entry point
├── public/                     static assets (vite.svg)
├── firebase.json               hosting + firestore config
├── firestore.rules              security rules (deployed)
├── firestore.indexes.json       currently empty
├── .firebaserc                  points at project `netflixgpt-e671d`
├── re-do.md                     phase-by-phase build log (the actual source of truth
│                                for "what's done")
├── IDEAS.md                     original rebrand brainstorm
└── README.md                    public-facing project readme
```

---

## 4. Routing

Defined in `src/components/Body.jsx` via `createBrowserRouter`:

| Route | Component | Auth required? |
| --- | --- | --- |
| `/` | `Home` | No — marketing landing page |
| `/login` | `Login` | No |
| `/browse` | `Browse` | Yes |
| `/shows` | `Shows` | Yes |
| `/discover` | `Discover` | Yes |
| `/anime` | `Anime` | Yes |
| `/title/:mediaType/:id` | `DetailPage` | Yes |

Auth enforcement lives in `Header.jsx`'s `onAuthStateChanged` listener —
logged-out visitors hitting a protected path get redirected to `/`.
`Header` mounts on every page, so this check runs everywhere
consistently.

---

## 5. State management (Redux Toolkit)

Seven slices, registered in `src/store/appStore.jsx`:

| Slice | Holds | Populated by |
| --- | --- | --- |
| `user` | `null` or `{ uid, email, name, photo }` | Firebase Auth via `Header.jsx`'s listener |
| `movies` | `nowPlayingMovies`, `popularMovies`, `topRatedMovies`, `upcomingMovies`, `trailerVideo` | `useNowPlayingMovies`, `usePopularMovies`, etc. |
| `tv` | `onTheAirShows`, `popularShows`, `topRatedShows`, `airingTodayShows`, `trailerVideo` | matching TV hooks |
| `details` | `mediaDetails`, `credits`, `similar`, `watchProviders`, `genres` — all keyed by `${mediaType}_${id}` (genres keyed by mediaType alone) | `useMediaDetails`, `useCredits`, `useSimilarTitles`, `useWatchProviders`, `useGenres` |
| `preferences` | `ratings` (`{ [docId]: 'like' \| 'dislike' }`), `isLoaded` | `usePreferencesSync` (live Firestore `onSnapshot`) |
| `gpt` | `showGptSearch` (defaults `true` — search-first landing), `movieNames`, `movieResults` | `GptSearchBar`, `Header`'s Home/Movies nav |
| `config` | `lang` (defaults `'en'`) | `Header`'s language selector (only shown in AI-search mode) |

**Caching pattern**: every TMDB-backed hook checks the store before
fetching (`!existingValue && fetch()`), so navigating back to
already-loaded data never re-fetches. Per-title data in `details` uses
a real `[mediaType, id]` effect dependency (unlike the movie/tv list
hooks' `[]`), since it must refetch when you navigate between titles.

---

## 6. Data layer (hooks)

All in `src/hooks/`, one per concern:

**Fixed TMDB lists** (movies): `useNowPlayingMovies`, `usePopularMovies`, `useTopRatedMovies`, `useUpcomingMovies`
**Fixed TMDB lists** (TV): `useOnTheAirShows`, `usePopularShows`, `useTopRatedShows`, `useAiringTodayShows`
**Trailer**: `useTrailer(mediaType, id)` — generalized for both movie/tv, used by `VideoBackground`
**Per-title detail data**: `useMediaDetails`, `useCredits`, `useSimilarTitles`, `useWatchProviders`, `useGenres` — all Redux-cached
**Catalog browsing**: `useDiscover(mediaType, filters)` — infinite-scroll, NOT Redux-cached (filter-dependent results don't benefit from caching); `useMultiSearch(query)` — debounced (350ms) internally, also not cached
**Preferences**: `usePreferencesSync()` — the live Firestore listener, called once from `Header.jsx`

---

## 7. Firebase integration

### Authentication
Email/password via `firebase/auth`. Config in `src/utils/firebaseConfig.jsx`
— the Firebase web config values are hardcoded there (not env-driven,
since they aren't secret). Exports `app` (the Firebase App instance,
shared by both Auth and Firestore) and `auth`.

### Firestore
Config in `src/utils/firestoreConfig.jsx` (exports `db`, built on the
same `app` instance). Path/reference helpers centralized in
`src/utils/firestorePaths.jsx` — nothing else in the codebase builds a
Firestore path by hand.

**Data model** (currently, ratings only — watchlist and profile are
planned, see `re-do.md` Phase 2.4/2.5):

```
users/{uid}                          — profile fields will live here directly
                                        (not yet written — Phase 2.5)
users/{uid}/ratings/{mediaType_id}   — { mediaType, mediaId, rating: 'like' | 'dislike',
                                        genreIds: [...], addedAt }
```

Doc IDs use the convention `${mediaType}_${mediaId}` (e.g. `movie_27205`),
via `mediaDocId()` in `firestorePaths.jsx` — makes "does this user
already have an opinion on this title?" a direct lookup, no query needed.

**Security rules** (`firestore.rules`, deployed):
```
match /users/{uid}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```
Every user can only ever touch their own subtree. The recursive
wildcard also covers the `users/{uid}` document itself (zero-or-more
segments), so this rule already works for the not-yet-built profile
fields too — no rules change needed when Phase 2.5 lands.

**Write path**: `src/utils/ratings.jsx` exports `addRating`/`removeRating`
— both simple, unconditional Firestore calls. The *decision* of which
to call (like vs. dislike vs. un-rate) lives in `RatingControl.jsx`,
since it already has the current rating live via Redux and doesn't
need an extra read to decide.

**Read path**: `usePreferencesSync` opens an `onSnapshot` listener the
moment `store.user.uid` exists, tears it down on logout. Every
`RatingControl` instance anywhere in the app (poster hover overlay,
detail page) reflects a change instantly — no manual refetching, no
prop drilling.

### Hosting
`npm run build` → `dist/` → `npx firebase deploy --only hosting,firestore:rules`.
Live at `https://netflixgpt-e671d.web.app`.

---

## 8. Design system

Entirely in `src/index.css` as a Tailwind v4 `@theme` block — no
`tailwind.config.js`. Key tokens:

- **Surfaces**: `--color-ink` / `--color-ink-elevated` (dark), `--color-paper` / `--color-paper-elevated` (light)
- **Accent**: `--color-accent` (amber/gold) — the *only* color allowed on interactive elements
- **Signal**: `--color-rust` — reserved exclusively for dislike/negative actions
- **Fixed**: `--color-on-accent` — does NOT swap with theme; for text sitting on the accent color itself (buttons), which stays the same gold regardless of light/dark mode
- **Type**: `--font-display` (Space Grotesk), `--font-body` (Inter)
- **Shape/motion**: one radius scale (`--radius-card`), one easing curve

**Light/dark theme**: toggled in `Header.jsx`, persisted to
`localStorage`, applied via `data-theme` on `<html>`. Implemented by
*redefining what the same token names point to* under
`[data-theme='light']` (e.g. `--color-ink` becomes the paper color),
rather than maintaining a parallel set of light-mode classes — every
component already using `bg-ink`/`text-text-dark` works correctly in
both themes with zero changes.

**Custom range slider** (`.styled-range` in `index.css`): the browser's
default `<input type="range">` doesn't respect the design tokens, so
track/thumb are custom-styled via `::-webkit-slider-thumb`/`::-moz-range-thumb`,
with the filled portion driven by an inline `linear-gradient` computed
from the current value (used on Discover's min-rating filter).

**`.hero-gradient`**: a radial gradient (ink + accent) used as the
background treatment on Login, Browse, and Shows — replaces what used
to be Netflix's actual marketing photo.

---

## 9. External APIs

### TMDB
Base URL centralized as `TMDB_BASE_URL` in `src/utils/constant.jsx`.
Auth via `API_OPTIONS` (Bearer token, `VITE_TMDB_KEY`). Endpoints in
active use: `/movie|tv/{now_playing,popular,top_rated,upcoming,on_the_air,airing_today}`,
`/movie|tv/{id}`, `/movie|tv/{id}/credits`, `/movie|tv/{id}/similar`,
`/movie|tv/{id}/videos`, `/movie|tv/{id}/watch/providers`,
`/genre/{mediaType}/list`, `/discover/{mediaType}`, `/search/multi`.
Image CDN constants: `IMG_CDN_URL` (posters, w500), `BACKDROP_CDN_URL`
(w1280), `PROFILE_CDN_URL` (cast headshots, w185).

**Anime approximation**: TMDB has no first-class "anime" type — the
`/anime` page is `/discover/{movie,tv}` with `with_genres=16`
(Animation) AND'd with `with_original_language=ja`, via `Discover.jsx`'s
`baseGenres`/`originLanguage` props.

### OpenRouter (GPT search)
`src/utils/openaiConfig.jsx` — the `openai` npm SDK pointed at
`openrouter.ai` instead of OpenAI directly, using `VITE_OPENROUTER_KEY`.
**Known issue, not yet fixed** (tracked in `re-do.md` Phase 3.4): this
call happens client-side with `dangerouslyAllowBrowser: true`, meaning
the API key ships to every client. Planned fix is a Firebase Cloud
Function.

---

## 10. Environment variables

```
VITE_TMDB_KEY="..."         # TMDB read access token
VITE_OPENROUTER_KEY="..."   # OpenRouter API key, for GPT search
```

Firebase config is not env-driven (see §7). Both required variables
are read via `import.meta.env.*` in `constant.jsx`.

---

## 11. Scripts

```bash
npm run dev       # vite dev server, localhost:5173
npm run build     # production build → dist/
npm run lint      # eslint .
npm run preview   # preview the production build locally
npx firebase deploy --only hosting,firestore:rules   # deploy
```

---

## 12. What's not built yet

Watchlist, computed taste profile, the `/profile` page, personalized
AI recommendations, and the server-side move of the GPT call are all
planned but not implemented — see `re-do.md` Phase 2.4 onward for the
concrete, in-order plan.
