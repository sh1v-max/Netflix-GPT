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
| Component primitives | shadcn/ui | Radix-based (button, card, dialog, sheet, tabs, dropdown-menu, tooltip, skeleton, input) — every primitive customized to Cinegraph's tokens, none left at shadcn defaults |
| Motion | Motion (`motion/react`) | `MotionConfig reducedMotion="user"` at the app root — every `motion.*` component auto-respects `prefers-reduced-motion`, no per-component checks needed |
| State | Redux Toolkit | 2 |
| Routing | React Router | 7 — route-level code splitting via `React.lazy`/`Suspense` in `Body.jsx` |
| Backend | Firebase | 12 — Authentication, Firestore, Hosting, Analytics |
| Movie/TV data | TMDB API | v3 (read access token) |
| AI search | GPT via OpenRouter | model: `stepfun/step-3.5-flash:free` |
| Icons | Lucide (`lucide-react`) | primary icon set app-wide. `react-icons` kept for exactly one case — `FaGithub` in `Footer.jsx` — since this Lucide version ships UI icons only, no brand/logo marks |
| Linting | ESLint 9 | flat config, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-react` (added for JSX-aware `no-unused-vars`, needed once `<motion.div>`-style namespaced JSX components entered the codebase) |
| Dev/verification | Playwright | 1 (devDependency — used for visual/runtime verification during development, not an automated test suite) |
| Deploy tooling | firebase-tools | 15 (devDependency) |

**Visual redesign**: the entire UI was rebuilt on a new "Cinegraph v2"
design system — see [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) (tokens,
philosophy) and [`better-ui-ux.md`](better-ui-ux.md) (the phase-by-phase
execution log, all 10 phases complete). Architecture, routing, Redux,
and Firebase/TMDB integration were explicitly out of scope for that
redesign — visual/interaction layer only.

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
│   │   ├── browse/             Browse.jsx (movie grid) + AiSearchHome.jsx
│   │   │                       (/home) + MainContainer, SecondaryContainer,
│   │   │                       VideoBackground, VideoTitle
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
├── re-do.md                     phase-by-phase build log (features/architecture)
├── DESIGN-SYSTEM.md             Cinegraph v2 visual design system (tokens, philosophy)
├── better-ui-ux.md               phase-by-phase redesign execution log (all 10 phases done)
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
| `/home` | `AiSearchHome` | Yes — the logged-in "home base," AI search first |
| `/movies` | `Browse` | Yes — movie grid (Now Playing/Popular/Top Rated/Upcoming) |
| `/shows` | `Shows` | Yes |
| `/discover` | `Discover` | Yes |
| `/anime` | `Anime` | Yes |
| `/title/:mediaType/:id` | `DetailPage` | Yes |
| `/watchlist` | `Watchlist` | Yes |
| `/profile` | `Profile` | Yes — identity, stats, taste graph, watchlist preview, sign out |

**`/home` vs `/movies`**: these were originally one route (`/browse`)
toggled between an AI-search view and the movie grid via a Redux flag
(`gpt.showGptSearch`). Split into two real routes — the shared URL was
confusing (nav's "Home" and "Movies" pointed at the identical address)
and meant the header's search/grid toggle button had to reach into
Redux instead of just navigating. `Header.jsx`'s `handleGptSearchClick`
now does exactly that: `navigate(isGptActive ? '/movies' : '/home')`,
where `isGptActive = location.pathname === '/home'`. (The component
directory is still named `src/components/browse/` — that's a file-path
detail, not the URL.)

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
| `preferences` | `ratings` (`{ [docId]: 'like' \| 'dislike' }`), `ratedGenres`/`ratedYears` (`{ [docId]: ... }` — mirror `ratings`, power the Detail page's taste-compatibility read and the Taste Profile page), `watchlist` (`{ [docId]: true }`), `isLoaded` | `usePreferencesSync` (two live Firestore `onSnapshot` listeners — ratings, watchlist) |
| `gpt` | `movieNames`, `movieResults` | `GptSearchBar` / `GptSearch.jsx`'s `runSearch` |
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

**Data model**:

```
users/{uid}                            — no fields written here yet. The taste
                                          profile is computed client-side on
                                          read (useTasteProfile) rather than
                                          persisted — see re-do.md Phase 2.5
users/{uid}/ratings/{mediaType_id}     — { mediaType, mediaId, rating: 'like' | 'dislike',
                                          genreIds: [...], releaseYear, addedAt }
users/{uid}/watchlist/{mediaType_id}   — { mediaType, mediaId, addedAt }
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

Entirely in `src/index.css` as Tailwind v4 `@theme` blocks — no
`tailwind.config.js`. Full rationale in `DESIGN-SYSTEM.md`; this is the
token inventory as it exists in code.

**Two token generations coexist on purpose.** The v1 tokens
(`--color-ink`, `--color-accent` gold, `--color-text-dark`, etc.) were
never removed — some components still use them, and removing them
before every last usage is migrated would regress those screens. The
v2 tokens (`--color-bg-*`, `--color-fg*`, `--color-accent2` indigo,
`--color-border-hairline`, `--color-surface-glass`, `--color-signal-*`)
are what every screen built from Phase 2 onward actually uses.

- **v1 surfaces**: `--color-ink`/`--color-ink-elevated` (dark), `--color-paper`/`--color-paper-elevated` (light) — still referenced by a handful of unmigrated spots
- **v2 surfaces**: `--color-bg-deep`/`--color-bg-base`/`--color-bg-elevated`/`--color-bg-muted` (a deliberately distinct step lighter than `bg-elevated`, so shadcn's `Skeleton`/`Secondary` don't blend into cards), `--color-surface-glass`, `--color-border-hairline`
- **v2 foreground**: `--color-fg`/`--color-fg-muted`
- **v2 brand accent**: `--color-accent2` (indigo `#5e6ad2`) — the one interactive color across every v2 screen. `--color-accent` (gold) is *not* deprecated — it's the reserved signal color for "like"/star-rating, alongside `--color-rust`/`--color-signal-dislike` for "dislike." Brand accent and signal color are deliberately different colors that never mean the same thing.
- **Type**: `--font-display` (Space Grotesk), `--font-body` (Inter), a defined `--text-cg-*` scale
- **Motion**: one easing curve, `--ease-cg-standard` (`cubic-bezier(0.16, 1, 0.3, 1)`), exported as a JS constant from `src/lib/motion.js` (`EASE`) so every component imports the same value instead of redeclaring it
- **Radius**: shadcn's own derived scale (`--radius: 1rem` base) for primitives, plus `--radius-chip`/`--radius-panel` for hand-built surfaces
- **Elevation**: `--shadow-cg-card`/`--shadow-cg-elevated`/`--shadow-cg-glow` — the only shadow values used anywhere in app code; no component reaches for Tailwind's default `shadow-md`/`shadow-lg` scale

**Light/dark theme**: toggled in `Header.jsx`, persisted to
`localStorage`, applied via `data-theme` on `<html>`. Both token
generations redefine what the same token names point to under
`[data-theme='light']` — v1 and v2 alike — so every component works in
both themes with zero per-component changes.

**`.aurora-gradient` / `.theme-dark-scope`**: a small number of
"hero moment" surfaces (Home's hero + CTA banner, Login's branding
panel, `/home`'s AI search) are deliberately cinematic-dark
*regardless* of site theme — a common pattern for branded hero
sections. These two CSS classes re-pin every v1/v2 token their content
might read, plus `color` itself (which is inherited *by computed
value*, not live — a `text-text-dark` class living on a distant
ancestor outside the scope would otherwise freeze its color before
reaching in). `.aurora-gradient` is used where the gradient div and the
content are the same element or direct parent/child (Home, Login);
`.theme-dark-scope` is the token-only version for cases where the
gradient div and the content are siblings (`Browse.jsx`'s fixed
background layer vs. its content wrapper).

**Custom range slider** (`.styled-range` in `index.css`): the browser's
default `<input type="range">` doesn't respect the design tokens, so
track/thumb are custom-styled via `::-webkit-slider-thumb`/`::-moz-range-thumb`,
with the filled portion driven by an inline `linear-gradient` computed
from the current value (used on Discover's min-rating filter).

**`.hero-gradient`**: a subtle radial (ink + `--color-accent2`) used as
the ambient background on the regular (non-AI-search) Browse and Shows
views — unlike `.aurora-gradient`, this one *does* theme-swap normally,
since its base color is the v1 `--color-ink` token.

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

Watchlist (2.4), profile computation (2.5), and the Taste Profile page
(2.6) are done. What's left: personalized AI recommendations (prompt
injection, "why this was picked" captions, "For You" rows) and the
server-side move of the GPT call — see `re-do.md` Phase 3 for the
concrete, in-order plan.
