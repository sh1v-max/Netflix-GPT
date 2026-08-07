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
(Gemini, called through a Cloudflare Worker proxy). It's a from-scratch
rebrand of what started as a Netflix-clone tutorial project — no
borrowed logo, palette, or layout.

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
| AI search | Google Gemini, via a Cloudflare Worker proxy | model: `gemini-3.5-flash` — see `gpt-proxy-worker/` |
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
│   │   ├── browse/             AiSearchHome.jsx (/home) + VideoBackground
│   │   │                       (still used by DetailPage's hero, for both
│   │   │                       movie/tv). MainContainer/VideoTitle deleted —
│   │   │                       no consumer left once Movies then Shows both
│   │   │                       moved off the streaming-hero layout
│   │   ├── movies/              Shared "Sci-Fi HUD / Data Console" — MediaConsole.jsx
│   │   │                       (the actual page, mediaType-parametrized),
│   │   │                       ConsoleHeader, PresetChips, FilterPanelHud,
│   │   │                       MovieGridHud, MovieCardHud, HudFrame (see §8's
│   │   │                       HUD section), plus the thin Movies.jsx (/movies)
│   │   │                       wrapper itself
│   │   ├── shows/               Shows.jsx (/shows) — thin wrapper around
│   │   │                       ../movies/MediaConsole, mirrors Movies.jsx
│   │   ├── discover/           Discover.jsx (filterable catalog + search) + FilterPanel
│   │   ├── anime/               Anime.jsx (/anime) — thin wrapper around
│   │   │                       ../movies/MediaConsole (same HUD console as
│   │   │                       Movies/Shows), forced Animation genre +
│   │   │                       Japanese language, movie/tv toggle
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
├── gpt-proxy-worker/            standalone Cloudflare Worker — Gemini proxy
│   ├── src/index.js             the actual Gemini call + prompt + CORS allowlist
│   ├── wrangler.toml             Worker name/entry/compat date
│   └── package.json              own deps (wrangler); not part of the Vite build
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
| `/movies` | `Movies` | Yes — dense, filterable "Sci-Fi HUD" catalog (preset chips + genre/year/rating filters + infinite scroll), not a streaming-style hero+rows page — see §8 |
| `/shows` | `Shows` | Yes — same "Sci-Fi HUD" catalog as `/movies`, TV-specific presets/genres — see §8 |
| `/discover` | `Discover` | Yes |
| `/anime` | `Anime` | Yes — same "Sci-Fi HUD" catalog, forced Animation genre + Japanese language, movie/tv toggle — see §8 |
| `/title/:mediaType/:id` | `DetailPage` | Yes |
| `/watchlist` | `Watchlist` | Yes |
| `/profile` | `Profile` | Yes — identity (editable name + avatar picker), stats, taste graph, watchlist preview, sign out |

**`/home` vs `/movies`**: these were originally one route (`/browse`)
toggled between an AI-search view and the movie grid via a Redux flag
(`gpt.showGptSearch`). Split into two real routes — the shared URL was
confusing (nav's "Home" and "Movies" pointed at the identical address)
and meant the header's search/grid toggle button had to reach into
Redux instead of just navigating. `Header.jsx`'s `handleGptSearchClick`
now does exactly that: `navigate(isGptActive ? '/movies' : '/home')`,
where `isGptActive = location.pathname === '/home'`. `AiSearchHome.jsx`
still lives in `src/components/browse/` (file-path detail, not the
URL) — `Movies.jsx` moved to its own `src/components/movies/` when it
was rebuilt (see §8).

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
| `movies` | `popularMovies` (only used by `Home.jsx`'s marketing grid), `trailerVideo` | `usePopularMovies`, `useTrailer` |
| `tv` | `trailerVideo` only — the four list fields (`onTheAirShows`/etc.) were removed when `/shows` was rebuilt, same as `movies` in 2.8 | `useTrailer` (via `VideoBackground`, used by `DetailPage`) |
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

**Fixed TMDB lists**: `usePopularMovies` — Redux-cached, used only by `Home.jsx`'s marketing poster grid. All other dedicated list hooks for both movies and TV (`useNowPlayingMovies`/`useTopRatedMovies`/`useUpcomingMovies`/`useOnTheAirShows`/`usePopularShows`/`useTopRatedShows`/`useAiringTodayShows`) were removed — first for movies when `/movies` was rebuilt (2.8), then for TV when `/shows` got the same treatment (2.9) — those presets now go through `useMovieConsole` instead.
**Trailer**: `useTrailer(mediaType, id)` — generalized for both movie/tv, used by `VideoBackground` (now only consumed by `DetailPage`'s hero, since neither `/movies` nor `/shows` use it anymore)
**Per-title detail data**: `useMediaDetails`, `useCredits`, `useSimilarTitles`, `useWatchProviders`, `useGenres` — all Redux-cached
**Catalog browsing**: `useDiscover(mediaType, filters)` — infinite-scroll, NOT Redux-cached (filter-dependent results don't benefit from caching); `useMovieConsole(mediaType, filters)` — `/movies`/`/shows`'s shared data source, sibling to `useDiscover` with an added `preset` field that can hit a fixed TMDB list endpoint instead of `/discover` (a different endpoint set per `mediaType` — see §8), same return shape either way; `useMarqueeBackdrops(mediaType)` — the HUD console header's ambient carousel pool, also `mediaType`-parametrized; `useMultiSearch(query)` — debounced (350ms) internally, also not cached
**Preferences**: `usePreferencesSync()` — the live Firestore listener, called once from `Header.jsx`

---

## 7. Firebase integration

### Authentication
Email/password via `firebase/auth`. Config in `src/utils/firebaseConfig.jsx`
— the Firebase web config values are hardcoded there (not env-driven,
since they aren't secret). Exports `app` (the Firebase App instance,
shared by both Auth and Firestore) and `auth`.

### Storage
Config also exports `storage` (`getStorage(app)`) from the same file.
Used solely for custom avatar uploads — `src/utils/avatar.jsx`'s
`uploadCustomAvatar(uid, file)` writes to a fixed path `avatars/{uid}/photo`
(overwrites on re-upload, no per-upload file accumulation) and returns the
download URL. Rules in `storage.rules`: public read (avatar URLs are
embedded in plain `<img>` tags app-wide without auth headers), write
restricted to the owning uid with a 5MB size cap and image-content-type
check.

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
panel, `/home`'s AI search, `/movies`'s HUD console) are deliberately
cinematic-dark *regardless* of site theme — a common pattern for
branded hero sections. These two CSS classes re-pin every v1/v2 token
their content might read, plus `color` itself (which is inherited *by
computed value*, not live — a `text-text-dark` class living on a
distant ancestor outside the scope would otherwise freeze its color
before reaching in). `.aurora-gradient` is used where the gradient div
and the content are the same element or direct parent/child (Home,
Login); `.theme-dark-scope` is the token-only version, applied directly
to the page's root wrapper on `MediaConsole.jsx` (shared by both
`/movies` and `/shows` — a HUD console makes no sense in light mode).

**Custom range slider** (`.styled-range` in `index.css`): the browser's
default `<input type="range">` doesn't respect the design tokens, so
track/thumb are custom-styled via `::-webkit-slider-thumb`/`::-moz-range-thumb`,
with the filled portion driven by an inline `linear-gradient` computed
from the current value (used on Discover's min-rating filter, and
FilterPanel's `variant="hud"` mode on the HUD console pages).

`.hero-gradient` (the old streaming-page ambient background, used by
`Browse.jsx`/`Shows.jsx` before their HUD rebuilds) is gone entirely —
deleted from `index.css` once `/shows` moved off it in 2.9, since
nothing referenced it anymore.

### Cinegraph v3 — "Sci-Fi HUD / Data Console" (`/movies` only)

A third, additive token generation, powering both `/movies` and
`/shows` (originally Movies-only in Phase 2.8, generalized to TV in
2.9). Coexists with v1/v2 — nothing here replaces the brand `accent2`
used everywhere else. New tokens: `--color-hud-cyan(-strong/-glow)`,
`--color-hud-line` (dim hairline), `--font-mono` (Roboto Mono — added
to the single Google Fonts `<link>` in `index.html`, alongside
Space Grotesk/Inter), and a tighter `--spacing-hud-*` scale for dense
grids (sibling to `--spacing-cg-*`, which stays "generous" elsewhere).

New utility classes: `.hud-panel` (thin cyan-hairline bordered surface),
`.hud-corner`/`.hud-corner--{tl,tr,bl,br}` (bracket corner marks —
applied to 4 real `<span>`s via `HudFrame.jsx`, since a single element
only has 2 pseudo-elements, not 4 corners). (An earlier `.hud-grid-texture`
faint line-grid overlay was tried and later removed on user feedback —
deleted from both `index.css` and `ConsoleHeader.jsx`, not just hidden.)

**Components** (`src/components/movies/` — shared by all three pages,
TV/Anime don't get their own parallel directories): `MediaConsole.jsx`
is the actual page — takes `mediaType` (fixed) or `mediaTypes` (array,
enables a movie/tv toggle instead — Anime only), `title`/
`eyebrowLabel`/`presets` (`[]` hides the preset-chip row entirely — a
constrained catalog like Anime can't offer TMDB's fixed-list presets,
since those endpoints don't accept genre/language params, so a preset
would silently ignore the constraint), and
`baseGenres`/`originLanguage`/`excludeGenreIds` (Anime's forced
Animation+Japanese constraint; `[]`/`null` for Movies/Shows). Owns all
state and data wiring, wraps its root in `.theme-dark-scope` (a HUD
console is dark-only regardless of the app theme toggle) →
`ConsoleHeader.jsx` (giant `mix-blend-mode: difference` wordmark that
inverts against whatever's behind it, a continuous right-to-left
backdrop carousel — `BackdropCarousel`, CSS `@keyframes`-driven,
deliberately not gated behind `prefers-reduced-motion` like the rest
of this file, see the component's own comment for why — a 4-edge
vignette, and the search/stat panel) → an optional `MediaTypeTabs`
(inline in `MediaConsole.jsx`, only rendered when `mediaTypes` is
passed) → `PresetChips.jsx` (chip list itself is generic;
`MOVIE_PRESETS`/`TV_PRESETS` are exported constants the caller picks
between, or omitted for a constrained page) → `FilterPanelHud.jsx`
(wraps the existing `discover/FilterPanel.jsx` unmodified, passing its
`variant="hud"` prop, a `mediaType`, and `excludeGenreIds` — plain
`Discover.jsx` itself keeps passing no `variant` and is unaffected) →
`MovieGridHud.jsx` (dense responsive grid, infinite scroll via the
same `IntersectionObserver` sentinel pattern `Discover.jsx` uses,
threads `mediaType` down) → `MovieCardHud.jsx` (sibling to
`shared/MovieCard.jsx`, not a variant prop on it — persistent, not
hover-gated, rating/year/genre readout, since a database shouldn't
hide its data behind a hover; adds a text-only fallback card for
missing posters instead of `MovieCard`'s `return null`). `HudFrame.jsx`
is the shared 4-corner-bracket wrapper used by both `ConsoleHeader` and
`MovieCardHud`. `Movies.jsx`, `shows/Shows.jsx`, and `anime/Anime.jsx`
are now ~10–25-line wrappers around `MediaConsole` — see routing table
(§4) for the exact props each passes.

**Data sources**: `src/hooks/useMovieConsole.jsx` — sibling to
`useDiscover.jsx` (untouched apart from exporting its
`buildDiscoverParams` helper for reuse). Filters gain one field,
`preset` — set, it hits a fixed TMDB list endpoint from a
`{ movie: {...}, tv: {...} }` map (movie: `now_playing`/`popular`/
`top_rated`/`upcoming`/`trending`; tv: `on_the_air`/`popular`/
`top_rated`/`airing_today`/`trending` — TV has no "upcoming"
equivalent, movie has no "on_the_air"/"airing_today"); `null`, it falls
through to `/discover/{mediaType}` exactly like `useDiscover` (this is
the only path Anime's preset-less pages ever take).
`src/hooks/useMarqueeBackdrops.jsx` also takes an optional
`{ baseGenres, originLanguage }` — unconstrained, it hits
`/{mediaType}/popular`; constrained (Anime), it switches to
`/discover/{mediaType}` with those params so the ambient carousel
shows on-theme backdrops instead of a random sample of the whole
catalog. Both `useMovieConsole` paths return the identical
`{results, isLoading, error, hasMore, loadMore, retry, totalResults}`
shape, regardless of which one is active.

**Preset ↔ filter interaction**: touching any `FilterPanel` control
while a preset chip is active silently clears the preset and converts
the query to its `/discover` equivalent (`MediaConsole.jsx`'s
`handleFiltersChange` always sets `preset: null` on any filter change)
— a fixed TMDB list endpoint can't be filtered further, so this keeps
the two mechanisms from fighting each other. "Trending" has no discover
equivalent at all, so touching filters while it's active just drops it
and starts a fresh discover query. Switching `MediaTypeTabs` (Anime
only) resets `filters` back to `defaultFilters` entirely — genre ids
aren't comparable across movie/tv.

**Deliberately still out of scope**: DetailPage enrichment (TMDB
keywords, collections, full crew, certifications, budget/revenue —
flagged as a natural fast-follow once all three catalog pages were
settled), and `/discover` itself (still the original `Discover.jsx`/
`FilterPanel.jsx` UI — a fundamentally different page shape, full
movie+tv catalog with live search-as-you-type, already reused as-is
elsewhere, no request yet to give it the HUD treatment too).

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
(Animation) AND'd with `with_original_language=ja`, via
`MediaConsole.jsx`'s `baseGenres`/`originLanguage` props (originally
`Discover.jsx`'s, before Anime moved to the HUD console in 2.10).

### Gemini via `gpt-proxy-worker` (GPT search)
GPT search calls Gemini's OpenAI-compatible endpoint
(`generativelanguage.googleapis.com/v1beta/openai/`), but **not
directly from the browser** — Gemini doesn't send CORS headers for
browser-origin requests, and even if it did, shipping the API key to
every client is a real security risk. Instead:

- `gpt-proxy-worker/` is a standalone Cloudflare Worker (separate
  `package.json`/`wrangler.toml`, not part of the Vite build). It holds
  the actual Gemini call, the `GPT_QUERY` system prompt, and the model
  name (`gemini-3.5-flash`) — see `gpt-proxy-worker/src/index.js`. The
  Gemini key lives only as a Worker secret (`GEMINI_KEY`, set via
  `npx wrangler secret put GEMINI_KEY`), never in frontend code or `.env`.
- `src/components/gpt/GptSearch.jsx`'s `runSearch` does a plain
  `fetch(GPT_PROXY_URL, { method: 'POST', body: { query } })` — no
  `openai` SDK on the frontend anymore (removed from `package.json`).
- The Worker's CORS allowlist (`ALLOWED_ORIGINS` in `index.js`) covers
  `localhost:5173`/`5174` and the two Firebase Hosting domains; add any
  new origin there before it'll work from a new host.
- Deployed manually via `npx wrangler deploy` from `gpt-proxy-worker/`
  — not wired into `firebase deploy` or CI, since it only needs
  redeploying when `index.js` changes.

Previously used OpenRouter (`openrouter.ai`, explicitly supports
browser calls via `dangerouslyAllowBrowser`) — moved off it because its
free-model lineup rotates without notice and the previously-configured
model (`stepfun/step-3.5-flash:free`) got pulled, breaking search with
no code change on our end.

---

## 10. Environment variables

```
VITE_TMDB_KEY="..."       # TMDB read access token
VITE_GPT_PROXY_URL="..."  # deployed gpt-proxy-worker URL, e.g.
                           # https://cinegraph-gpt-proxy.<subdomain>.workers.dev
```

Firebase config is not env-driven (see §7). Both required variables
are read via `import.meta.env.*` in `constant.jsx`. The Gemini API key
is **not** a frontend env var — it's a Cloudflare Worker secret, set
separately via `npx wrangler secret put GEMINI_KEY` from
`gpt-proxy-worker/` (see §9's Gemini section).

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

Watchlist (2.4), profile computation (2.5), the Taste Profile page
(2.6), the server-side move of the GPT call (2.7, ad hoc — see §9),
the `/movies` "Sci-Fi HUD" rebuild (2.8, ad hoc — see §8), and its
rollout to `/shows` (2.9) and `/anime` (2.10) are done — all four
media-browsing pages (`/movies`, `/shows`, `/anime`, plus `/discover`
still on the original UI) now share `MediaConsole.jsx`. What's left:
giving `/discover` the same HUD treatment too if that's ever wanted
(deliberately not done yet — different page shape, see §8), DetailPage
enrichment (keywords, collections, full crew, certifications,
budget/revenue — flagged as a natural fast-follow once the catalog
pages were settled), and personalized AI recommendations (prompt
injection using the taste profile, "why this was picked" captions,
"For You" rows) — see `re-do.md` Phase 3 for the concrete, in-order
plan.
