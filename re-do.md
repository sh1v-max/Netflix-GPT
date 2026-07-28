# Re-Do: AI Movie/Show Recommendation System

## The concept (confirmed)

Not a streaming platform. Not a Netflix clone. Three pillars, working together:

1. **A real movie/show database** — browse, filter, and drill into detail
   pages. This is the substrate everything else sits on.
2. **A preference graph** — the app learns what a specific user likes by
   tracking their ratings/reactions/watchlist, and turns that into a
   visible taste profile, not a hidden backend number.
3. **An AI recommendation layer** — GPT-powered suggestions that read the
   preference graph before answering, so recommendations get personal and
   explain *why* they were picked.

Everything below is the plan to get there, broken into concrete,
buildable steps, in the order we'll build it.

---

## Phase 0 — Identity & Rebrand

Do this first because it's cheap, and because building new features inside
Netflix's literal branding (their logo image, their background art, their
red/black palette) would mean redoing the visual layer again later anyway.

### 0.1 — Name: **Cinegraph**

> Cinema + preference *graph* — the name explains the differentiator
> without needing a tagline.

(Other directions considered and shelved: **Reelmind** — violet accent,
friendlier/consumer tone; **Curatr** — teal accent, drops "movie" from the
name entirely. Worth revisiting only if Cinegraph stops feeling right once
the UI is actually built.)

### 0.2 — Design system (the polished version)

A minimal, editorial feel needs more than "one accent color" — it needs a
small, deliberate token set that every component pulls from, so nothing
gets re-decided ad hoc in JSX. This is what goes into `src/index.css` as a
Tailwind v4 `@theme` block (no `tailwind.config.js` needed on v4):

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-ink: #0B0B0F;            /* dark mode background */
  --color-ink-elevated: #16161C;   /* dark mode cards/header */
  --color-paper: #F6F3ED;          /* light mode background */
  --color-paper-elevated: #EDE8DE; /* light mode cards/header */

  /* Accent — the one color allowed to draw attention */
  --color-accent: #D4A054;         /* primary actions, active states */
  --color-accent-strong: #B9853F;  /* hover/pressed */
  --color-accent-soft: #E9C98B;    /* subtle backgrounds, badges */

  /* Signal — reserved for rating/like-dislike, nothing else */
  --color-rust: #C1553B;           /* dislike / destructive, NOT Netflix red */

  /* Text */
  --color-text-dark: #F5F1EA;
  --color-text-dark-muted: #9A9691;
  --color-text-light: #17161A;
  --color-text-light-muted: #6B665D;

  /* Type */
  --font-display: "Space Grotesk", ui-sans-serif, sans-serif;
  --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Shape & motion — consistency is the whole point */
  --radius-card: 0.5rem;      /* 8px — modest, not Netflix's rounded-full */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;     /* hover/press micro-interactions */
  --duration-base: 250ms;     /* panel/menu transitions */
}
```

**Rules that keep it minimal** (write these down so future-us doesn't
drift back into the old style):
- `--color-accent` is the *only* color allowed on interactive elements
  (buttons, active nav, focus rings). No per-component color decisions.
- `--color-rust` is reserved for exactly one meaning: negative signal
  (dislike button, remove-from-watchlist, destructive confirm). Not used
  for general "error" UI chrome or decoration.
- One radius scale, one easing curve, two durations. If a component wants
  a third duration or a different curve, that's a signal something's
  drifting — stop and reconsider instead of adding a one-off value.
- No stacked glow/blur/shadow combos (the current `hover:shadow-[0_0_10px_...]`
  + `backdrop-blur` + gradient stacking is exactly the effect to retire).
  One subtle shadow OR one blur, never both, and only on things that are
  actually elevated (menus, modals) — not on every hover state.

### 0.3 — Rebrand tasks (in order)

1. [x] Upgrade `tailwindcss` / `@tailwindcss/cli` / `@tailwindcss/vite`
       from 4.1 → 4.3
2. [x] Add the `@theme` block above to `src/index.css` (plus a fixed
       `--color-on-accent` token for text placed on the accent color
       itself — buttons need a non-swapping dark text regardless of theme)
3. [x] Build a `<Logo />` component (`components/layout/Logo.jsx`) —
       replaces the `LOGO` image import entirely
4. [x] Remove `LOGO` and `IMG_BACKGROUND` from `src/utils/constant.jsx`
5. [x] Replace the hero background with `.hero-gradient` (CSS radial
       gradient using `--color-ink`/`--color-accent`) — used in `Login`,
       `Browse`, `Shows`
6. [x] Swept `Header`, `Login`, `MovieCard`, `MovieList`, `GptSearchBar`,
       `GptMovieSuggestions`, `VideoTitle`, `VideoBackground`,
       `MainContainer` for hardcoded `red-*`/`bg-black`/`bg-gray-*` classes
7. [x] Rewrote `Footer.jsx` — dropped the fake link grid, kept a GitHub
       link + honest copyright line
8. [x] Homepage is search-first: `gptSlice`'s `showGptSearch` now
       defaults to `true` (was `false`). Also fixed a latent state-sync
       bug this exposed — `Header` had its own local `isGptActive` state
       duplicating the Redux flag, which would've shown the wrong
       icon/nav on load; it now derives directly from the store, scoped
       to `/browse` only (the toggle jumps to `/browse` first if clicked
       from `/shows`, since Shows doesn't have this feature yet)
9. [x] Light theme: toggle button in `Header` (sun/moon icon, always
       visible regardless of login state), persisted via
       `localStorage`, applied via `data-theme` on `<html>`. Implemented
       by redefining `--color-ink`/`--color-ink-elevated`/
       `--color-text-dark`/`--color-text-dark-muted` under
       `[data-theme='light']` rather than renaming every class — same
       `bg-ink`/`text-text-dark` utility names work in both themes

**Verified**: lint clean (only pre-existing warnings), production build
succeeds. Not yet done: visual browser check — no browser automation
available in this environment, so give it a look yourself (`npm run
dev`) before moving on, especially the light theme toggle and the
search-first landing.

---

## Phase 1 — Movie/Show Database

Makes the app *do something* when you click a title, and gives Phase 2
something to attach ratings to.

### 1.1 — Data layer (hooks, build these first)
- [x] `useMediaDetails(mediaType, id)` → `/movie/{id}` or `/tv/{id}`
- [x] `useCredits(mediaType, id)` → `/movie|tv/{id}/credits`
- [x] `useSimilarTitles(mediaType, id)` → `/movie|tv/{id}/similar`
- [x] `useWatchProviders(mediaType, id)` → `/movie|tv/{id}/watch/providers`
- [x] `useGenres(mediaType)` → `/genre/{mediaType}/list`
- [x] `useDiscover(mediaType, filters)` → `/discover/{mediaType}` with
      `with_genres`, `primary_release_year`/`first_air_date_year`,
      `vote_average.gte`, `sort_by`, `page`
- [x] `useMultiSearch(query)` → `/search/multi`

**Architecture note**: `useMediaDetails`/`useCredits`/`useSimilarTitles`/
`useWatchProviders`/`useGenres` cache their results in a new
`detailsSlice.jsx` (keyed by `${mediaType}_${id}`), following the
existing "check store before fetching" pattern — but with a real
`[mediaType, id]` effect dependency array, since these fetch per-title
data that changes as you navigate between detail pages (unlike the
existing list hooks' `[]`, which only ever fetch once). `useDiscover`
and `useMultiSearch` deliberately do **not** use Redux — their results
are page/filter-dependent and don't need cross-component caching, so
they're self-contained hooks with local `results`/`isLoading`/`error`
state instead. Added `TMDB_BASE_URL` to `constant.jsx` since these seven
hooks would've otherwise each repeated the same base URL string.

**Verified**: lint clean (same pre-existing warnings only), production
build succeeds.

### 1.2 — Detail page
- [x] Route `/title/:mediaType/:id` in `Body.jsx` → `DetailPage.jsx`
- [x] `DetailPage.jsx` (`components/detail/`): hero reusing
      `VideoBackground` for the trailer (falls back to the backdrop image
      when no trailer exists, e.g. Breaking Bad), title, tagline, genre
      chips, runtime/seasons, release year, rating, overview
- [x] `CastGrid.jsx`: horizontal scroll row of headshot + name +
      character, with a `FaUser` fallback for cast members with no photo
- [x] Similar/recommended titles row — reused `MovieList`/`MovieCard`
      directly, no new component needed
- [x] Watch-providers badge row (provider logos, "Not currently
      available to stream" fallback when TMDB has no US entry)
- [x] `MovieCard`'s poster now wraps in a `Link` to
      `/title/${mediaType}/${id}` — clicking any poster anywhere in the
      app (Browse, Shows, GPT search results) now actually goes
      somewhere

**Follow-on changes this required**:
- `MovieList`/`MovieCard` gained `mediaType`/`id` props so the link
  target is correct — `ShowsSecondaryContainer` now passes
  `mediaType="tv"` explicitly; `MovieList` also checks
  `movie.media_type` first (for future multi-search results that carry
  their own type per item)
- Added `BACKDROP_CDN_URL`/`PROFILE_CDN_URL` to `constant.jsx`
  (backdrops/headshots need different TMDB image sizes than posters)
- `Header`'s logged-out redirect guard now also covers `/title/*`, so a
  logged-out visitor hitting a detail-page URL directly gets bounced to
  `/` the same way `/browse`/`/shows` already were

**Bug caught during visual verification**: the hero's title/tagline text
was nearly unreadable against the trailer video — `VideoBackground`'s
internal iframe/gradients use `-z-20`/`z-10`, and since neither its own
root nor the hero wrapper establishes a stacking context, those values
escape their local scope. My overlay gradient and text had no z-index at
all, so they lost. Fixed by giving both explicit `z-20`, matching the
pattern `VideoTitle` already uses on the Browse hero for the same
reason. Verified with real TMDB titles (Inception, Breaking Bad) via
Playwright before and after the fix.

**Verified**: lint clean (same pre-existing warnings only), production
build succeeds, both movie and TV detail pages render correctly
end-to-end with real data.

### 1.3 — Discover / browse page
- [x] Route `/discover` → `Discover.jsx`
- [x] `FilterBar.jsx` (`components/discover/`): media-type toggle
      (Movies/TV Shows), genre chip multi-select (OR logic — `with_genres`
      pipe-separated, so "Action or Comedy" not "must be both"), real
      year-*range* control (`.gte`/`.lte` date params, not TMDB's
      single-year param), min-rating slider, sort-by dropdown
      (mediaType-aware: movie sorts by `primary_release_date`, TV by
      `first_air_date`)
- [x] `Discover.jsx`: responsive grid (2 cols mobile → 6 cols desktop) —
      `MovieCard` gained a `fill` prop so it can size to a grid cell
      instead of its fixed carousel width
- [x] Infinite scroll (chosen over numbered pagination) via
      `IntersectionObserver` on a sentinel div, `rootMargin: '150px'`
- [x] Nav link + protected-route guard added in `Header.jsx`, matching
      `/browse`/`/shows`/`/title/*`

**Deferred by request**: trimming Browse's homepage down to 1-2 curated
rows (mentioned in Phase 0 step 8) — explicitly held off; Discover ships
as an additional way to browse, Browse itself untouched for now.

**`useDiscover` reworked from its 1.1 shape** — the version built in 1.1
fetched one page per call, which doesn't fit infinite scroll (need to
accumulate across pages, track `hasMore`, expose `loadMore`/`retry`).
Now: `page` resets to 1 on any filter/mediaType change, the fetch effect
replaces results on page 1 and appends otherwise, and a `retryToken`
lets the UI force a refetch after an error without depending on `page`
already being at a "changed" value.

**Verified interactively with Playwright** (not just a static
screenshot): genre-chip filtering actually reduces the result count,
switching to TV Shows produces `/title/tv/...` links with TV-specific
genres (confirming `useGenres` is correctly mediaType-aware), and real
mouse-wheel scrolling loads additional pages (confirmed 80 real results
loaded across 4 pages purely from scrolling). Caught one tuning issue
in the process: the initial `rootMargin: '400px'` was generous enough
that on a tall viewport with only 20 results, the sentinel was already
within range on mount, eagerly loading a second page before any scroll
happened — tightened to `150px`.

**Verified**: lint clean (same pre-existing warnings only), production
build succeeds.

### 1.4 — Unified search
- [ ] Add a quick-search input (exact title lookup via `/search/multi`)
      as a fast-path, distinct from the natural-language GPT search box —
      wire it into the header or a dedicated `/search` route
- [ ] Search results link straight into detail pages

---

## Phase 2 — Preference Graph

This is the differentiator. Needs Firestore — a small addition to the
Firebase project you already have (auth is already wired up). **Do the
`firebase` v11 → v12 dependency bump (from the dependency audit) right
before starting this phase**, not in isolation earlier — no point writing
Firestore code against v11 and migrating it right after.

### 2.1 — Firestore setup
- [ ] Enable Firestore in the Firebase console for this project
- [ ] Security rules: `match /users/{uid}/{document=**} { allow read,
      write: if request.auth.uid == uid; }` — every user can only ever
      touch their own subtree
- [ ] `firestoreConfig.jsx` alongside the existing `firebaseConfig.jsx`,
      exporting a `db` instance

### 2.2 — Data model
```
users/{uid}/ratings/{mediaType_id}
  { mediaType, mediaId, rating: 'like' | 'dislike', genreIds: [...], addedAt }

users/{uid}/watchlist/{mediaType_id}
  { mediaType, mediaId, addedAt }

users/{uid}/profile   (derived/cached — recomputed on write)
  { topGenres: [...], favoriteDecade, avoidGenres: [...], updatedAt }
```
Start with a binary like/dislike signal rather than 1-5 stars — simpler
UI (two icons vs. a star picker), simpler aggregation math, and it's
enough signal to build genre/decade preferences from. A star scale is a
straightforward upgrade later if binary feels too coarse.

### 2.3 — Ratings
- [ ] `addRating(mediaType, id, rating, genreIds)` utility function
      (writes to Firestore, triggers profile recompute)
- [ ] Like/dislike control on `MovieCard`'s hover overlay (next to the
      existing play button) and on the detail page
- [ ] `preferencesSlice.jsx` (new Redux slice) synced via Firestore
      `onSnapshot` listeners, so ratings/watchlist reflect instantly
      across the UI without manual refetching

### 2.4 — Watchlist
- [ ] `toggleWatchlist(mediaType, id)` utility
- [ ] Bookmark icon button on `MovieCard` and detail page
- [ ] Route `/watchlist` — fetches full details for each saved id and
      renders as a grid (reuse `Discover.jsx`'s grid layout)

### 2.5 — Profile computation
- [ ] `computeTasteProfile(ratings)` utility: tallies genre frequency
      weighted by like/dislike, buckets release years into decades,
      derives a simple `topGenres` / `avoidGenres` list
- [ ] Recompute and write to `users/{uid}/profile` after every rating
      write (client-side trigger is fine for v1; a Cloud Function
      trigger on document write is a later optimization, not a blocker)
- [ ] (Stretch, v2) fold in recurring liked actors/directors from
      `/credits` on liked titles — skip for v1, it's an extra API call
      per liked title and genre+decade alone is enough to make Phase 3
      feel personalized

### 2.6 — Taste Profile page
- [ ] Route `/profile` (or `/taste`)
- [ ] Genre bar chart + decade distribution chart (this is a real data
      visualization — load the `dataviz` skill when building this, don't
      freehand chart colors/layout)
- [ ] A plain-language summary line: "You tend to like — [genres]. You
      tend to avoid — [genres]." This sentence is what makes the graph
      feel like a feature, not a settings page

---

## Phase 3 — AI Recommendation Layer

Depends on Phase 2 existing (needs a profile to personalize against).

### 3.1 — Prompt personalization
- [ ] `buildPersonalizedPrompt(profile, query)` helper in `utils/`
- [ ] Update the GPT system message (currently `GPT_QUERY` in
      `constant.jsx`) to include the injected profile summary: *"This
      user favors [genres], the [decade] era, and dislikes [avoid list].
      Given that, and the query below, recommend..."*

### 3.2 — "Why this was picked" captions
- [ ] Change the requested GPT response format from a flat comma list to
      `{name, reason}` pairs (or a strict JSON array) so each result
      carries a one-line justification
- [ ] Update `GptSearchBar`'s parsing logic and `GptMovieSuggestions` /
      `MovieList` / `MovieCard` to render the reason as a caption under
      the poster on hover (reuse the title-caption overlay already added
      to `MovieCard`)

### 3.3 — "For You" home rows
- [ ] `useForYouRecommendations()` hook — calls GPT with the profile
      alone (no query), on homepage load
- [ ] Cache the result (Redux or session storage) so it's not
      re-requested on every navigation — refresh on a timer or on
      profile change, not on every render
- [ ] Replaces the generic TMDB rows as the homepage's personalized
      section (Phase 0 already demoted the full carousel wall off the
      homepage — this is what fills that space instead)

### 3.4 — Security fix (do this as part of this phase, not after)
- [ ] `GptSearchBar.jsx` currently calls `openai.chat.completions.create`
      directly from the browser with `dangerouslyAllowBrowser: true` —
      the API key ships to every client as-is
- [ ] Set up a Firebase Cloud Function (`functions/` directory), an
      `onCall` function (e.g. `getRecommendations`) that holds the
      OpenRouter key server-side via Firebase Functions config/secrets
- [ ] Client calls `httpsCallable(functions, 'getRecommendations')`
      instead of importing the OpenAI SDK directly; delete
      `dangerouslyAllowBrowser` and the client-side key exposure entirely

### 3.5 — Stretch: multi-turn refinement
- [ ] Conversation state (array of prior turns) instead of a single
      query/response round-trip
- [ ] Follow-up input: "more like the third one but shorter" — passes
      prior turns + profile to GPT for a refined result set
- [ ] Only take this on once one-shot personalized search (3.1-3.4) is
      solid — it's the most technically involved piece in the whole plan

---

## Phase 4 — Polish & Professional Credibility

Do this once the three pillars work end-to-end, before calling it done.

- [ ] Tests (Vitest + React Testing Library) — start with
      `validateConfig.jsx`, `computeTasteProfile`, the Redux/preferences
      slices, and a couple of component smoke tests (`MovieCard`,
      `DetailPage`)
- [ ] Error boundary around the router — one thrown error shouldn't blank
      the whole app
- [ ] Accessibility pass — icon-only buttons need `aria-label`s (partially
      done already), visible focus states using `--color-accent`, contrast
      check on the new palette (paper/ink pairing against text tokens)
- [ ] Code-split routes with `React.lazy` — production build is already
      flagged at 628kB in a single chunk, and Phase 1-3 add several new
      routes that don't all need to load on first paint
- [ ] CI — GitHub Actions running lint/build/tests on PRs (there's a
      `.github` folder already; check what's wired up before adding a
      new workflow)
- [ ] Rewrite `README.md` as a case study once the rebrand is live: lead
      with what the app does differently (AI + preference graph + real
      database), embed a short demo GIF/video, drop the
      "Netflix-inspired" framing entirely

---

## Order of execution

```
Phase 0 (identity)  →  Phase 1 (database)  →  Phase 2 (preference graph)  →  Phase 3 (AI layer)  →  Phase 4 (polish)
```

Each phase produces something demoable on its own:
- **Phase 0** — the app stops looking like a Netflix clone
- **Phase 1** — things you click lead somewhere; it feels like a real product
- **Phase 2** — a working ratings/watchlist app with a visible taste profile
- **Phase 3** — the thing you actually pitched: personalized AI recommendations
- **Phase 4** — what makes it defensible in an interview

Say the word whenever you're ready to start on Phase 0's first concrete
step (the `@theme` block + `<Logo />` component) and we'll begin there.
