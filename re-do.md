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

**Note**: the visual/interaction redesign (shadcn/ui + Motion + Lucide,
"Cinegraph v2" design system) is tracked separately in
[`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) and
[`better-ui-ux.md`](better-ui-ux.md) — all 10 phases there are complete.
This file remains the source of truth for architecture/features
(routing, state, data model, AI layer).

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
- [x] ~~`HeaderSearch.jsx` in the header~~ — built first, then removed
      per feedback (didn't want a search affordance living in the navbar).
      Superseded by a search box built directly into `Discover.jsx`
      instead, right above the filter bar
- [x] Typing a query switches Discover into "search mode": the
      genre/year/rating/sort filter bar and the discover grid hide, and
      a grid of `useMultiSearch` results (movies + TV mixed, each
      showing correct media type via `item.media_type`) takes over.
      Clearing the query switches back to filtered browsing
- [x] Each search result links straight into its detail page via the
      same `MovieCard` component, `fill` mode, same as Discover's own grid

**`useMultiSearch` gained debouncing internally** (350ms default, via
`setTimeout`/`clearTimeout` in the effect cleanup) rather than in the
component calling it — so any future consumer of this hook gets safe
search-as-you-type behavior automatically instead of needing to
remember to debounce it themselves. This paid off immediately when the
search UI moved from `HeaderSearch` to `Discover` — no debounce logic
had to move with it.

**One correctness detail**: the infinite-scroll `IntersectionObserver`
effect in `Discover.jsx` now includes `isSearching` in its dependency
array, even though the observer logic itself doesn't use that value —
it's needed so the effect re-attaches to the sentinel `<div>` when it
remounts after switching back from search mode to browse mode (the
sentinel unmounts entirely while searching, since that section of JSX
isn't rendered).

**Verified interactively with Playwright**: searched "batman" on
Discover, got a real mixed movie/TV grid (Batman Returns, The Batman,
Batman Beyond, etc.), confirmed the filter bar and its own grid were
hidden while searching, cleared the search and confirmed the filter bar
reappeared. Testing required temporarily loosening `/discover`'s and
`/title/`'s auth guards (no real Firebase session in a headless
browser) — reverted after.

**Verified**: lint clean (same pre-existing warnings only), production
build succeeds.

---

## Phase 2 — Preference Graph

This is the differentiator. Needs Firestore — a small addition to the
Firebase project you already have (auth is already wired up).

**`firebase` v11 → v12 migration**: done, first — matches the plan's
"do this right before starting Phase 2, not in isolation earlier."
Low-risk since the codebase was already on the modular API
(`firebase/app`, `firebase/auth`), which v12 continues to build on.
Verified via lint/build and a runtime smoke test (no console/page
errors on load). Incidentally fixed a pre-existing lint error too —
`firebaseConfig.jsx`'s `analytics` variable was assigned but never
used; `getAnalytics(app)` is now called without being stored.

### 2.1 — Firestore setup
- [x] Firestore database created in the Firebase console
      (`netflixgpt-e671d`), production mode (locked down by default,
      not the 30-day-open test mode)
- [x] Security rules written and **deployed**:
      `match /users/{uid}/{document=**} { allow read, write: if
      request.auth != null && request.auth.uid == uid; }` — every user
      can only ever touch their own subtree. Lives in `firestore.rules`
      at the repo root, referenced from `firebase.json` alongside a new
      (currently empty) `firestore.indexes.json`
- [x] `firestoreConfig.jsx` alongside `firebaseConfig.jsx`, exporting a
      `db` instance — built on the *same* Firebase `app` instance as
      auth (`firebaseConfig.jsx` now explicitly exports `app`, which it
      wasn't doing before, to avoid a second app instance)
- [x] `firebase-tools` installed as a devDependency (wasn't available
      at all before — global install wasn't found either), so
      `npx firebase <command>` works directly from the project folder
- [x] **Deployed and verified live**: `npx firebase deploy --only
      hosting,firestore:rules` — both the Firestore rules and the full
      current build (everything through Phase 1 + the Home/Movies nav
      fix) are live. Confirmed via `curl` that the live site serves the
      Cinegraph build, not the old cached Netflix-clone version. Live
      at `https://netflixgpt-e671d.web.app`

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

- [x] `firestorePaths.jsx` (`src/utils/`) — turns the schema above into
      real reusable reference helpers (`userDoc`, `ratingsCollection`,
      `ratingDoc`, `watchlistCollection`, `watchlistDoc`), all built on
      the `mediaDocId(mediaType, mediaId)` convention, so 2.3+ never
      hand-roll a Firestore path inline
- [x] `users/{uid}/profile` from the schema sketch is implemented as
      fields merged directly onto the `users/{uid}` document itself
      (via `userDoc`), not a separate subdocument — `users/{uid}/profile`
      as literally written has an odd path-segment count, which
      Firestore treats as a collection reference, not a document. The
      existing security rule (`users/{uid}/{document=**}`) already
      covers the parent doc too, since Firestore's recursive wildcard
      matches zero-or-more segments — no rules change needed

**Real bug caught while verifying**: importing `firebase/firestore` for
the first time threw `Service firestore is not available` at runtime,
even though the build succeeded and lint was clean. Root cause: Vite
pre-bundles and caches dependencies, and adding a brand-new Firebase
submodule import can create a stale cache mismatch with the
already-cached `firebase/app`/`firebase/auth` chunks from earlier dev
server runs. Fixed by clearing `node_modules/.vite` and restarting —
confirmed fixed via a temporary import + runtime check, then reverted.
**Worth remembering**: if a future session adds another new `firebase/*`
submodule (e.g. `firebase/functions` in Phase 3) and hits the same
"Service X is not available" error, clear the Vite cache before
assuming anything more exotic is wrong.

**Verified**: lint clean (16 warnings, 0 errors — down from 17 problems
since the firebase v12 fix removed the `analytics` error), production
build succeeds, and — critically — a runtime check (not just a
build/lint check) confirmed `getFirestore(app)` actually works.

### 2.3 — Ratings
- [x] `addRating`/`removeRating` (`src/utils/ratings.jsx`) — both
      unconditional (`addRating` always sets, `removeRating` always
      deletes); the *decision* of which to call lives in the UI
      component, not the utility, since the component already has the
      current rating live via Redux — no extra Firestore read needed to
      decide. Profile recompute (the "triggers profile recompute" part
      of the original plan) is deferred to 2.5, not wired in yet
- [x] `RatingControl.jsx` (`components/shared/`) — like/dislike buttons,
      reused on `MovieCard`'s hover overlay (top-left, mirroring the
      existing top-right "more options" button) and on the detail
      page's hero, under the genre chips. Reads the current rating live
      from `preferencesSlice`, renders nothing if logged out. Clicking
      the currently-active state un-rates (toggle off) instead of
      just switching
- [x] `preferencesSlice.jsx` + `usePreferencesSync.jsx` — the hook opens
      an `onSnapshot` listener on `ratings` the moment `store.user.uid`
      exists (called once, from `Header.jsx`, which mounts on every
      page), tears it down on logout via `clearPreferences`. Every
      `RatingControl` instance anywhere in the app reflects a change
      instantly, with no manual refetching

**Follow-on changes this required**: `MovieCard` gained a `genreIds`
prop (needed so a rating can be tagged with the genres it belongs to,
for Phase 2.5's profile computation) — threaded through from
`MovieList` (`movie.genre_ids`) and both of `Discover.jsx`'s direct
`MovieCard` usages (search results and the filtered grid, `item.genre_ids`).
`DetailPage` maps its own `details.genres` (`[{id, name}]` objects, not
raw ids) to a plain id array when passing to `RatingControl`.

**Verified**: lint clean (16 warnings, 0 errors), production build
succeeds — bundle size jumped from 660KB to 1.17MB, confirming
`firebase/firestore` is now genuinely wired into the live app (via
`usePreferencesSync` in `Header.jsx`) rather than sitting unused like
in 2.2. Runtime-checked with the `browser-automation` skill across
Home, Discover, and a detail page (Inception) — zero console errors,
real content loads correctly, and `RatingControl` correctly renders
nothing (not a crash) for a logged-out session.

**Manually verified end-to-end** (couldn't be done from a headless
browser — needs a real authenticated session): clicked like/dislike
while logged in, confirmed real documents landed in the Firestore
console under `users/{uid}/ratings/`, correctly keyed as
`movie_1108427`, `movie_634649` etc. — matching the `${mediaType}_${mediaId}`
convention exactly. The write path works.

### 2.4 — Watchlist
- [x] `addToWatchlist`/`removeFromWatchlist` (`src/utils/watchlist.jsx`) —
      unconditional add/remove, mirrors `ratings.jsx` exactly (the write
      path already had `watchlistCollection`/`watchlistDoc` helpers from
      2.2, unused until now)
- [x] `WatchlistButton.jsx` (`components/shared/`) — mirrors
      `RatingControl`'s live-read/direct-write pattern. Uses the brand
      accent (indigo) rather than a signal color, since "saved for later"
      isn't a taste signal the way like/dislike are
- [x] `preferencesSlice`/`usePreferencesSync` extended with a second
      `onSnapshot` listener on the watchlist collection (same lifecycle
      as ratings — synced on login, cleared on logout)
- [x] Bookmark button on `MovieCard` — replaced the top-right "more
      options" button, which had no `onClick` at all and never did
      anything, with a real, functional action
- [x] Bookmark button on `DetailPage`, next to `RatingControl`
- [x] `useWatchlistDetails.jsx` — fetches full TMDB details for each
      saved `{mediaType, mediaId}` pair in parallel (watchlist docs only
      store the pair, same minimal-write pattern as ratings), normalizes
      to the `genre_ids` shape `MovieCard`/`MovieList` already expect
- [x] Route `/watchlist` (`components/watchlist/Watchlist.jsx`) — grid +
      skeleton loading + illustrated empty state, reusing patterns from
      `Discover.jsx`. Linked from the profile dropdown menu (not the main
      nav, to avoid overcrowding it)
- [x] `firestore.rules` already covered this via the existing recursive
      wildcard (`users/{uid}/{document=**}`) — no rules change needed

**Verified**: build/lint clean. Runtime-checked via the
`browser-automation` skill (auth-guard temporarily disabled, then
reverted and confirmed clean via `git diff`) — `/watchlist`'s empty
state and `/movies`' grid (with the new bookmark button) both render
with 0 console errors. The actual save/remove write path needs a real
authenticated session to verify end-to-end (same limitation as 2.3's
ratings feature).

### 2.5 — Profile computation
- [x] `computeTasteProfile(ratings, ratedGenres, ratedYears)`
      (`src/utils/computeTasteProfile.jsx`) — pure function: tallies
      genre frequency weighted by like (+1)/dislike (−1), buckets liked
      titles' release years into decades, derives `topGenres`/`avoidGenres`
      (score > 0 / < 0, sorted) and `favoriteDecade`
- [x] **Scope change from the original plan**: computed client-side on
      read (`useTasteProfile` hook, memoized off Redux state already live
      via `usePreferencesSync`) instead of recomputed-and-written to
      `users/{uid}/profile` on every rating. Nothing reads a persisted
      copy yet — that Firestore write was premature until Phase 3's
      server-side Cloud Function actually needs to read a profile without
      the client re-deriving it. Revisit then; trivial to add, the pure
      function doesn't change
- [x] Required extending the rating write path (same precedent as 2.3
      adding `genreIds`): `addRating`/`RatingControl`/`MovieCard` gained a
      `releaseYear` param, threaded through from `MovieList`,
      `Discover.jsx`'s two grids, and `DetailPage` (which already computed
      `year`). New `getReleaseYear()` helper in `constant.jsx` reads
      whichever of `release_date`/`first_air_date` TMDB returns.
      `preferencesSlice`/`usePreferencesSync` gained a matching `ratedYears`
      map, mirroring `ratedGenres`
- [ ] (Stretch, v2) fold in recurring liked actors/directors from
      `/credits` on liked titles — skip for v1, it's an extra API call
      per liked title and genre+decade alone is enough to make Phase 3
      feel personalized

### 2.6 — Taste Profile page
- [x] Route `/profile` (`src/components/profile/Profile.jsx`) — linked
      from the profile dropdown (relabeled "Profile", was a dead
      "Profile" placeholder that did nothing)
- [x] Genre bar chart + decade distribution chart
      (`SequentialBarChart.jsx`) — used the `dataviz` skill as instructed:
      both are a magnitude/"compare counts" job, so per the skill's own
      form-selection rule that's **one sequential hue** (the brand
      indigo), not a categorical rainbow — bar length *and* intensity
      both encode the value, no legend needed for a single series, value
      direct-labeled at each bar's end rather than gated behind hover
- [x] A plain-language summary line: "You tend to like — [genres]. Your
      favorite era so far is the [decade]s." (originally also included a
      "You tend to avoid — [genres]" clause; dropped per user request —
      `avoidGenres` is still computed by `computeTasteProfile` and available
      for Phase 3's prompt personalization, just no longer surfaced in the
      UI copy)
- [x] Illustrated empty state when `totalRated === 0` (same pattern as
      Watchlist/Discover's empty states)
- [x] **Expanded beyond the original spec** once it became clear a page
      titled "Profile" needs actual identity/account content, not just
      analytics: identity header (avatar, inline-editable display name
      via Firebase `updateProfile`, email, "member since" from
      `user.metadata.creationTime` — a small addition to what
      `Header.jsx` captures on auth state change), a stat-tile row
      (titles rated / liked / disliked / watchlist count), a watchlist
      preview row (reuses `useWatchlistDetails`) with a link to the full
      `/watchlist` page, and a Sign Out action. File renamed
      `TasteProfile.jsx` → `Profile.jsx` to match — the taste graph is
      now one section of the page, not the whole page
- [x] **Custom avatar picker** (`src/components/profile/AvatarPicker.jsx`),
      also ad hoc: clicking the identity-header avatar opens a shadcn
      `Dialog` with 18 preset avatars (DiceBear `avataaars` API, fixed
      seeds — no image assets hosted in-repo, same external-CDN pattern
      already used for TMDB posters) plus an "Add your own" file upload.
      Custom uploads go through Firebase Storage (`src/utils/avatar.jsx`'s
      `uploadCustomAvatar`, one fixed path `avatars/{uid}/photo` per user
      so re-uploading overwrites rather than accumulating files) — required
      newly adding `storage.rules` (owner-only write, 5MB cap, image
      content-type check, public read since avatar URLs sit in plain
      `<img>` tags everywhere), wiring `storage` into `firebase.json` and
      `firebaseConfig.jsx`. Both selection paths (preset click, successful
      upload) call `updateProfile` + `dispatch(addUser(...))`, mirroring
      the existing inline display-name-edit pattern in the same file

**Verified**: build/lint clean. Sanity-tested `computeTasteProfile`'s
logic directly (genre scoring, decade bucketing restricted to likes only,
favorite-decade selection) against hand-checked sample data before
trusting it in the UI. Runtime-checked via `browser-automation` — the
empty state renders correctly with 0 ratings; the charts themselves were
verified by temporarily hardcoding sample profile data into the page
(reverted after, confirmed via `git diff`-equivalent grep for the debug
marker) since this sandbox has no real authenticated ratings to render
against.

---

### 2.7 — GPT search: OpenRouter → Gemini via Cloudflare Worker proxy

Ad hoc, triggered by OpenRouter's free-tier model
(`stepfun/step-3.5-flash:free`) getting pulled from their lineup
without notice, silently breaking search. Ended up doing 3.4's
security fix at the same time since a proper fix required it anyway.

- [x] Diagnosed: OpenRouter's `:free` model roster rotates; the
      previously-hardcoded model no longer existed. Confirmed via
      `openrouter.ai/api/v1/models`.
- [x] Evaluated alternatives (Gemini, Groq, Cerebras, Mistral, HF
      Inference) — picked **Google Gemini** for its stable, documented
      free tier (vs. OpenRouter's rotating lineup)
- [x] Discovered Gemini's OpenAI-compatible endpoint doesn't send CORS
      headers for browser origins — direct browser calls are blocked,
      unlike OpenRouter which explicitly supports
      `dangerouslyAllowBrowser`. This forced the server-side move that
      3.4 had already flagged as needed, just earlier than planned.
- [x] Firebase Cloud Functions ruled out: deploying *any* function —
      even one only calling Google's own Gemini API — requires the
      Blaze (billing) plan just to deploy, regardless of whether usage
      stays inside the free quota
- [x] Built `gpt-proxy-worker/` — a standalone Cloudflare Worker
      (own `package.json`/`wrangler.toml`, not part of the Vite
      build/deploy). `src/index.js` holds the Gemini call, the
      `GPT_QUERY` system prompt (moved server-side from
      `constant.jsx`), model name (`gemini-3.5-flash`), and a CORS
      allowlist (`localhost:5173`/`5174` + both Firebase Hosting
      domains)
- [x] Deployed via `npx wrangler login` + `npx wrangler secret put
      GEMINI_KEY` + `npx wrangler deploy` — free, no card required.
      Live at `https://cinegraph-gpt-proxy.singhshiv0427.workers.dev`
- [x] Frontend: `GptSearch.jsx`'s `runSearch` now does a plain
      `fetch(GPT_PROXY_URL, ...)` instead of importing the `openai`
      SDK. Deleted `src/utils/openaiConfig.jsx` and the `openai` npm
      dependency entirely — the frontend bundle no longer contains any
      LLM API key
- [x] `.env`: `VITE_OPENROUTER_KEY` → `VITE_GPT_PROXY_URL` (just a
      URL, not a secret). The Gemini key lives only as the Worker's
      `GEMINI_KEY` secret, set via `wrangler secret put` — never
      committed, never shipped to a client

**Verified**: direct `curl` to the deployed Worker, a CORS preflight
check (`OPTIONS` request confirms `Access-Control-Allow-Origin` for
`localhost:5173`), and a `fetch()` run from inside the actual page's
JS context via `browser-automation` — all returned a correct
comma-separated movie list end-to-end (browser → Worker → Gemini →
TMDB lookups). Build/lint clean (0 errors).

---

### 2.8 — `/movies` rebuild: "Sci-Fi HUD / Data Console"

Ad hoc, user-driven: the existing `/movies` page (`Browse.jsx`) still
looked like a Netflix-style streaming homepage — full-bleed
autoplay-trailer hero + four fixed horizontal shelves (Now Playing/
Popular/Top Rated/Upcoming) — for an app that's meant to be a movie
*database*, not a streaming clone. User asked for a from-scratch
redesign, "futuristic, advanced, award-winning." Movies-only this
round — `/shows` keeps its original page untouched; if this direction
is approved, it rolls out there and elsewhere next.

- [x] Style direction narrowed via the `ui-ux-pro-max` skill (design-system
      search + a style-domain search for futuristic options) and user
      confirmation: **Sci-Fi HUD / Data Console** — dark void, thin
      cyan hairlines, bracket-corner card framing, monospace numerals
      for data. Explicitly *not* full neon-glitch cyberpunk (rejected —
      lower readability, reads as a gaming launcher rather than a
      reference tool) and not retro-synthwave (nostalgia works against
      "advanced").
- [x] Typography: kept `Space Grotesk` for headings (site-wide
      consistency with nav/chrome) — added `Roboto Mono` (`--font-mono`)
      scoped to data figures only (rating/year/vote counts), not a
      full-app font swap.
- [x] New v3 token block in `index.css` (additive, coexists with v1/v2 —
      doesn't touch `--color-accent2`, the brand accent used everywhere
      else): `--color-hud-cyan(-strong/-glow)`, `--color-hud-line`,
      `--font-mono`, tighter `--spacing-hud-*` scale for dense grids.
      New utility classes `.hud-panel`, `.hud-corner--{tl,tr,bl,br}`
      (bracket marks — 4 real `<span>`s via `HudFrame.jsx`, since one
      element only has 2 pseudo-elements), `.hud-grid-texture`.
- [x] Data source: new `src/hooks/useMovieConsole.jsx`, sibling to
      `useDiscover.jsx` (which only gained one `export` keyword on its
      already-existing `buildDiscoverParams` helper — zero behavior
      change, `Discover.jsx`/`Anime.jsx` unaffected). Adds a `preset`
      filter field — set, hits a fixed TMDB list endpoint
      (`now_playing`/`popular`/`top_rated`/`upcoming`/`trending`);
      `null`, falls through to `/discover/movie` exactly like
      `useDiscover`. Same `{results, isLoading, error, hasMore,
      loadMore, retry, totalResults}` shape either way, so one grid
      doesn't care which is active.
- [x] Preset ↔ filter interaction: unified, not mutually exclusive —
      touching any `FilterPanel` control while a preset is active
      silently clears it and converts to the equivalent `/discover`
      query (a fixed list endpoint can't be filtered further). Verified
      live: selecting "Top Rated" then clicking the "Action" genre chip
      correctly dropped the preset back to "All Titles" and switched to
      a discover query with the genre filter applied.
- [x] New `src/components/movies/` directory (kept separate from
      `browse/`, which still holds Shows-shared infrastructure):
      `Movies.jsx` (page), `ConsoleHeader.jsx` (static backdrop + stat
      readout, replaces the autoplay-trailer hero entirely — no video
      on this page anymore), `PresetChips.jsx`, `HudFrame.jsx` (shared
      bracket wrapper), `MovieCardHud.jsx` (sibling to
      `shared/MovieCard.jsx`, not a variant prop — persistent
      rating/year/genre readout instead of hover-gated, since a
      database shouldn't hide its data behind a hover; adds a
      text-only fallback card for missing posters instead of
      `MovieCard`'s `return null`), `MovieGridHud.jsx` (infinite
      scroll via the same `IntersectionObserver` sentinel pattern
      `Discover.jsx` uses), `FilterPanelHud.jsx` (wraps `FilterPanel`
      unmodified, passing its new `variant="hud"` prop).
- [x] `FilterPanel.jsx` gained a `variant="hud"` prop (default
      `"default"`, current look/behavior unchanged) that swaps
      `accent2` Tailwind classes for `hud-cyan` ones — small, additive,
      `Discover.jsx`/`Anime.jsx` pass no `variant` and are unaffected.
- [x] Cleanup: `Browse.jsx`, `browse/SecondaryContainer.jsx`, and the
      three now-fully-dead hooks (`useNowPlayingMovies`,
      `useTopRatedMovies`, `useUpcomingMovies`) deleted, along with
      their `moviesSlice` reducers — grep-verified zero remaining
      references first. `usePopularMovies`/`popularMovies` kept —
      `Home.jsx`'s marketing landing page depends on them independently.
      `Body.jsx`'s `/movies` route now points at `movies/Movies.jsx`.
- [x] **Follow-up, same round** — user feedback that the console header
      looked too empty: `ConsoleHeader.jsx` gained a poster-collage
      background (same technique as `Discover.jsx`'s header band —
      low-opacity grid of current results' posters, not a single
      backdrop), a movie-scoped search box (reuses `useMultiSearch`
      as-is, filtered to `media_type === 'movie'` in `Movies.jsx` since
      the index is movie-only and that hook returns movie+tv), and a
      richer stat row (results, mode, genres tracked, average rating of
      the loaded set). Searching switches the whole page into a
      search-results branch (mirrors `Discover.jsx`'s
      `isSearching` pattern) — preset chips and the filter sidebar hide
      while a query is active, same as Discover hides its own filters.
- [x] **Second follow-up, same round** — first pass at the poster
      collage was nearly invisible (0.12 opacity under a heavy dark
      gradient); bumped to 0.6 opacity with a lighter gradient and
      dropped the grayscale filter to let real color through. Then, per
      a design reference the user shared (a giant-wordmark hero style),
      replaced the page-background collage entirely with a different
      technique: the word "MOVIES" now renders at `min(30vh, 19vw)`
      font size — deliberately huge, ~1/4 of viewport height — with the
      poster mosaic filling the letters themselves via
      `background-clip: text` (a stack of CSS `background-image` layers
      positioned in a 5×3 grid, `GRID_POSITIONS` in `ConsoleHeader.jsx`,
      not a canvas/JS composite). The smaller HUD panel (search box +
      stat row) now sits below the giant headline instead of behind it.
- [x] **Third follow-up, same round** — user feedback that the 5×3
      multi-poster mosaic looked broken/glitchy through the letters (a
      jigsaw of mismatched photos reads as a rendering bug, not a
      design choice) and that the headline needed to fill more space
      with better contrast. Replaced the mosaic with a single coherent
      backdrop image (`results.find(r => r.backdrop_path)`, not a
      poster grid — `GRID_POSITIONS`/`buildCollageStyle` removed from
      `ConsoleHeader.jsx` entirely), added a `-webkit-text-stroke: 2px`
      cyan outline so every letter stays legible regardless of the
      image's local brightness, and increased the size to
      `clamp(5rem, 22vw, 15rem)` (vw-dominant so it now spans nearly
      the full container width, not just tall).
- [x] **Fourth follow-up, same round** — added a full-bleed ambient
      backdrop behind the entire header (behind `.hud-grid-texture` and
      the giant headline, not just behind the panel), cycling through
      up to 8 of the current results' backdrops with a slow crossfade +
      subtle zoom (`BackdropSlideshow` in `ConsoleHeader.jsx`, new
      `backdropPaths` array prop alongside the existing singular
      `backdropPath` used for the headline's text-fill — two different
      images can be showing at once, letter-fill vs. ambient backdrop,
      which reads as intentional layering rather than a mismatch).
      Rotates every 6s via `setInterval` + `AnimatePresence`
      (`motion.img` keyed by the current path, so mount/unmount drives
      the crossfade); the interval is skipped entirely under
      `prefers-reduced-motion: reduce` (checked once via
      `matchMedia`, since `MotionConfig reducedMotion="user"` at the
      app root only governs Motion-driven animations, not a plain JS
      `setInterval` loop) — a single static image still renders either
      way. Verified the rotation actually fires by sampling the
      rendered `<img>` `src` at t=0/7s/14s within one continuous
      browser session (confirmed different backdrop URLs) — a first
      attempt at verifying via separate fresh-navigation screenshots
      looked like nothing was rotating, which turned out to be a false
      alarm caused by each screenshot restarting the timer from zero.
- [x] **Fifth follow-up, same round** — user reported (correctly) that
      the ambient backdrop was invisible outside the "MOVIES" letters
      and appeared not to rotate at all. Root cause: the slideshow/grid
      layers used negative `z-index` (`-z-30`/`-z-20`), but the
      `ConsoleHeader` wrapper never established its own stacking
      context (`position: relative` alone doesn't create one), so those
      negative-z children escaped past it and painted *behind* the
      page root's own `bg-ink` background several levels up — a classic
      "negative z-index leaks out of its intended container" CSS bug.
      Rotation was actually working the whole time (per the previous
      bullet's verification), just invisible. Fix: added `isolate`
      (`isolation: isolate`) to the `ConsoleHeader` wrapper div, which
      scopes all descendant z-index values — negative included — to
      stay contained within it. One-line fix, no layout/logic changes.
      Re-verified visually: the backdrop now fills the whole header
      (not just behind the letters) and the crossfade is visibly
      apparent between screenshots taken seconds apart.
- [x] **Sixth follow-up, same round** — user didn't like the single
      big backdrop photo at all; wanted a continuous right-to-left
      scrolling row of movie posters instead (same header height,
      different content). Replaced `BackdropSlideshow` (React
      state + `setInterval` + `AnimatePresence` crossfade) with
      `PosterMarquee` — a pure-CSS approach: the poster list is
      rendered twice back-to-back in one flex row (`.marquee-track` in
      `index.css`) and a CSS `@keyframes` animation translates the
      whole row by exactly `-50%` on an infinite loop, which is
      seamless since the second half of the doubled list is identical
      to the first. No React state or interval involved — the scroll
      itself can't stutter on re-render the way a JS-driven timer
      could, and reduced-motion is a plain `@media` guard on the class
      (same pattern as `.shimmer`). `ConsoleHeader.jsx` now takes a
      `posterPaths` array (20 posters from the current results,
      `IMG_CDN_URL`) instead of `backdropPaths`; the giant headline
      still separately uses one `backdropPath` (`BACKDROP_CDN_URL`) for
      its own text-fill, unrelated to the marquee. Verified live: the
      marquee's `translateX` was sampled at two points four seconds
      apart within one session and confirmed moving (`0` →
      `-406.573px`), i.e. genuinely animating right-to-left, not stuck.
- [x] **Seventh follow-up, same round** — two more issues with the
      marquee: (1) it was sourced from the same `results` array the
      grid below renders, so it just replayed the grid's own first row
      as "ambient" background — not actually different content; (2) it
      used `poster_path` images, and movie posters are designed as
      title cards — almost every one has the movie's name baked into
      the artwork, which duplicated/cluttered against the "MOVIES"
      wordmark. Fixed both: swapped to `backdrop_path` (widescreen
      scene stills, essentially never carry title text) via
      `BACKDROP_CDN_URL`, `aspect-video` instead of `aspect-2/3`; and
      decoupled the data source entirely by pulling from
      `usePopularMovies()`/`store.movies.popularMovies` (already an
      existing, independently-cached hook — originally added for
      `Home.jsx`'s marketing grid, reused here rather than adding a new
      fetch) instead of the console's own filtered `results`, so the
      marquee always shows different titles than whatever's in the grid
      regardless of the active preset/filter. Also shuffles the list
      once per mount (`useMemo` + a small Fisher-Yates `shuffle`
      helper) so the playback order isn't identical on every visit.
      `ConsoleHeader`'s prop renamed `posterPaths` → `marqueeBackdrops`
      to match; `PosterMarquee` renamed `BackdropMarquee`.
- [x] **Eighth follow-up, same round** — user reported the marquee
      looked static. The CSS animation was confirmed working (verified
      earlier), so the likely cause was the 50s-per-loop duration being
      too slow to notice at a glance — sped up to 22s in
      `.marquee-track` (`index.css`). Re-verified: sampling
      `translateX` 1s apart showed a large, obviously-visible shift, and
      two screenshots 3s apart showed clearly different scenes. Noted
      for the user: if it's still static on their end, the other likely
      cause is their OS/browser having "reduce motion" enabled, which
      this marquee intentionally respects (same
      `prefers-reduced-motion` guard as `.shimmer`/`.aurora-gradient`)
      — that's a system setting, not a bug, but worth ruling out.
- [x] **Ninth follow-up, same round** — the speed-up didn't fix it for
      the user; still completely static, same two images always. Root
      cause was almost certainly the `prefers-reduced-motion` guard
      flagged in the previous bullet — but rather than debug the user's
      OS setting, replaced the whole approach per their explicit ask
      for "carousel" behavior instead of a continuous scroll. New
      `BackdropCarousel` in `ConsoleHeader.jsx`: chunks the shuffled
      backdrops into batches of 6, shows one batch across the full
      header width, and crossfades to the next batch every 4s
      (`AnimatePresence` + `motion.div` keyed by batch index). Critical
      difference from the marquee: **the batch always advances**, because
      it's driven by a plain `setInterval`/React state, not a CSS
      `@keyframes` animation — nothing about `prefers-reduced-motion`
      can freeze the rotation itself anymore. Only the crossfade's
      smoothness is optional, and that's handled automatically by the
      app-root `MotionConfig reducedMotion="user"` (`App.jsx`) rather
      than a hand-rolled media query — under reduced motion the batch
      still swaps, just via an instant cut instead of a fade. Removed
      the now-dead `.marquee-track`/`@keyframes marquee-scroll` CSS
      entirely. Verified live: two screenshots 6s apart (past the 4s
      interval) showed completely different backdrop sets.
- [x] **Tenth follow-up, same round** — batch-crossfade approach worked
      but the user said it read as a "refresh," not a carousel — they
      wanted individual tiles continuously gliding right-to-left, plus
      two other fixes: always exactly 6 tiles visible (batches sometimes
      showed fewer, e.g. a short trailing chunk when the pool size
      wasn't a multiple of 6), and a much bigger backdrop pool (the
      single-page `usePopularMovies` source, ~20 titles, looped too
      tightly for "a lot"). Replaced `BackdropCarousel` with a new
      continuous-glide version — but this time driven by Framer Motion's
      `animate` (`x: ['0%', '-50%']`, `repeat: Infinity`, `ease:
      'linear'`) instead of a CSS `@keyframes` animation, since a CSS
      keyframe animation is exactly what silently never moved earlier
      (gated behind `prefers-reduced-motion`), while the batch
      crossfade — also Framer Motion, just animating `opacity` instead
      of `x` — demonstrably did work in the same browser. Sizing: each
      tile is set to `100 / doubled.length`% of the *track's* width, and
      the track itself to `(doubled.length / 6) * 100`% of the
      *container's* width — those percentages cancel out to exactly
      `container-width / 6` per tile regardless of viewport size or
      pool size, so it's always exactly 6 tiles wide, and translating
      the track by `-50%` moves exactly one full backdrop-list-width for
      a seamless loop. Pool: new `src/hooks/useMarqueeBackdrops.jsx`
      fetches 5 pages of `/movie/popular` in parallel (up to ~100
      titles) once on mount, replacing the single-page
      `usePopularMovies` source — `Home.jsx`'s own `usePopularMovies`
      call is untouched. Verified live: sampled the track's
      `transform` 3s apart and confirmed a large continuous shift
      (`-870px` → `-3383px`), and a screenshot showed exactly 6 tiles
      filling the header width with visibly more pool variety.
- [x] **Eleventh follow-up, same round** — the Framer Motion version
      still never moved for the user either, while the batch crossfade
      (also Framer Motion) did. That pattern — content-driven changes
      work, actual sliding motion never does, across three completely
      different implementations — points at one specific mechanism:
      this app's root `MotionConfig reducedMotion="user"` (`App.jsx`)
      makes every Framer Motion animation respect the OS-level
      `prefers-reduced-motion` setting automatically. The crossfade's
      *content* change is driven by a `setInterval`/React state update
      (unaffected by that config); only the *fade transition itself* is
      Framer-animated, and reduced motion likely made that fade instant
      rather than skipping the content change — which is why it read as
      working. The glide's *entire* effect is the Framer-animated `x`
      transform, so under the same setting it just never started.
      Fix: went back to a plain CSS `@keyframes` animation (same
      `.marquee-track` technique as the very first marquee attempt) —
      but this time deliberately left it OUT of the
      `prefers-reduced-motion: no-preference` media-query guard used
      everywhere else in `index.css`. A raw CSS animation isn't touched
      by Framer's `MotionConfig` at all, and with no manual media-query
      gate of its own either, nothing in this app can suppress it
      anymore. This is a deliberate, documented, one-off accessibility
      tradeoff (noted in both the CSS comment and the component comment)
      — justified because it's the gentlest possible motion (a slow,
      constant-speed, single-direction pan, not flashing/zooming/parallax)
      and the user has now asked for this exact behavior across five
      consecutive iterations. Verified live: sampled `.marquee-track`'s
      computed `transform` 3s apart and confirmed continuous movement
      (`-1132px` → `-3607px`), and a screenshot matches — 6 tiles,
      visibly different backdrops, filling the header width.
- [x] **Twelfth follow-up, same round** — user asked for the "MOVIES"
      headline to be the "anti" color of whatever's behind it, i.e.
      `mix-blend-mode: difference`, so it stays legible and striking
      regardless of what the carousel is currently showing underneath.
      Replaced the image-filled-letters technique (`background-clip:
      text` + a single static `backdropPath`, the `-webkit-text-stroke`
      cyan outline) with a solid white fill and `mixBlendMode:
      'difference'` — the text now inverts the colors of the carousel
      and grid texture beneath it in real time as the carousel slides,
      rather than showing its own separate fixed image. Since the
      headline's `.isolate` ancestor (added earlier for the stacking-
      context fix) already contains the carousel, grid texture, and
      gradient in one local stacking context, the blend mode composites
      against all of them correctly with no extra wiring. Removed the
      now-unused `backdropPath` prop/plumbing from both
      `ConsoleHeader.jsx` and `Movies.jsx` (it was only ever used for
      the old letter-fill image). Verified visually — the text visibly
      shows inverted teal/cyan tones over the carousel's red/orange
      frames, updating as the carousel moves.
- [x] **Thirteenth follow-up, same round** — carousel speed felt too
      fast; slowed `.marquee-track`'s CSS animation from `26s` to `120s`
      per loop. Verified via computed-`transform` sampling that the
      movement rate dropped proportionally (~825px/s → ~178px/s, a
      ~4.6x slowdown matching the 120/26 duration ratio).
- [x] **Fourteenth follow-up, same round** — added a vignette overlay
      to the carousel: darker at all four edges (top/left/right/bottom),
      bright in the center, not too dark overall. The previous overlay
      was a single top-to-bottom linear gradient (no left/right
      darkening at all — images ran flush to the side edges). Replaced
      with two layered gradients on the same div: a radial ellipse
      (`transparent` at the center 30% radius, fading to a `55%`
      `--color-ink` mix at the edges — the actual vignette) plus a
      gentler linear top-to-bottom fade retained underneath it (`15%`
      mix at the top down to solid `--color-ink` at the very bottom),
      so the search panel still blends cleanly into the page background
      below the header. Uses `color-mix(in srgb, ...)`, the same
      technique already used by `.hero-gradient`/`.aurora-gradient`.
      Verified visually — all four edges read visibly darker than the
      center without crushing the images to black.
- [x] **Fifteenth follow-up, same round** — two small polish requests:
      vignette pushed noticeably darker and reaching further inward
      (radial transparent stop `12%` → `5%`, edge opacity `72%` → `85%`
      ink mix; linear bottom fade `20%/55%` → `30%/65%`), and a `pt-5`
      added to `PresetChips.jsx`'s row so the preset chips (All Titles/
      Trending/Now Playing/...) get breathing room instead of sitting
      flush against the search panel above them.
- [x] **Sixteenth follow-up, same round** — user correctly flagged that
      the left/right edges still weren't visibly dark. Root cause: a
      radial-gradient's explicit ellipse size (`90% 80%`) is a
      percentage of the gradient BOX's own width/height — and this
      header is much wider than it is tall, so a horizontal radius of
      "90% of a very wide box" is itself huge, meaning the color barely
      progressed toward full darkness by the time it reached the actual
      left/right screen edges (vertically, 80% of a much shorter height
      had far less distance to cover, so the top/bottom darkening did
      show). Replaced the single radial ellipse with two independent
      `linear-gradient`s — one `to right` (dark→transparent→transparent→
      dark, symmetric left/right) and one `to bottom` (dark→transparent→
      transparent→solid, matching the existing bottom-fade intent) —
      each darkens its own pair of edges by a fixed percentage of its
      own axis, so it's correct regardless of the box's aspect ratio.
      Verified visually — both the leftmost sliver and rightmost tile
      now read clearly darker than the bright center tiles.
- [x] **Seventeenth follow-up, same round** — user still saw no
      darkening at all (screenshot showed a fully bright edge tile).
      Re-verified against a brand-new dev server instance (not the
      user's own, in case theirs was serving a stale bundle) and the
      linear-gradient vignette from the previous bullet rendered
      correctly there — dark left edge, dark silhouettes on the right
      edge. Given that mismatch, likely cause on the user's end is a
      stale cached bundle rather than a code bug (Vite HMR occasionally
      doesn't pick up an inline-style-only change cleanly). Pushed the
      edges further regardless, per the user's "make it darker either
      way" instruction: left/right edges now go to fully solid
      `var(--color-ink)` at the very 0%/100% stops (not a `color-mix`
      partial-opacity blend like before), transparent stops moved
      inward slightly (`22%/78%` → `26%/74%`); bottom fade's starting
      opacity bumped `55%` → `65%`. If this still doesn't show, the
      likely fix is a hard refresh / dev server restart on the user's
      side, not another code change.
- [x] **Eighteenth follow-up — the actual root cause, correcting the
      previous bullet's wrong "stale cache" diagnosis.** The user's
      screenshot was accurate; the vignette genuinely never rendered
      visibly, on any browser, cached or not. Real cause: `BackdropCarousel`'s
      wrapper div (`ConsoleHeader.jsx`) is `absolute inset-0` with no
      explicit `z-index` (defaults to `auto`), while the vignette and
      grid-texture divs use `-z-20`. In CSS stacking order, positioned
      elements with `z-index: auto` paint *above* elements with an
      explicit negative `z-index` — so the carousel was always
      compositing on top of the vignette, silently hiding it
      completely, on every browser, the entire time. Every earlier
      "verification" in this session was a false positive from
      eyeballing screenshots and mistaking naturally-dark movie frames
      near the edges for the vignette effect. Fix: added `-z-30` to the
      carousel's wrapper div, so the paint order is now carousel (back)
      → grid texture → vignette → content (front), as originally
      intended. This time verified with `document.elementFromPoint()`
      at an edge coordinate — confirmed the vignette div itself (not a
      carousel `<img>`) is the actual topmost element there, which is
      definitive proof (not a screenshot judgment call). Screenshot
      afterward shows the edges genuinely crushed to black. Lesson: for
      any future "X isn't visible" report, check `elementFromPoint`/
      computed z-index stacking before assuming caching, motion
      settings, or CSS gradient math — a hidden-behind-another-layer
      bug produces the exact same symptom as those and is easy to
      misdiagnose from a screenshot alone.
- [x] **Nineteenth follow-up, same round** — user asked to remove the
      faint light-blue grid-line pattern behind the header (didn't look
      good). Removed the `.hud-grid-texture` div from `ConsoleHeader.jsx`
      entirely, and deleted the now-fully-unused `.hud-grid-texture` CSS
      rule from `index.css` (grep-confirmed no other consumers first).
      Vignette and carousel untouched — header now reads cleaner without
      the grid overlay competing with the carousel imagery.

**Deliberately out of scope**: `/shows` and its shared hero components
(`MainContainer`/`VideoBackground`/`VideoTitle` in `browse/`) — untouched,
re-screenshotted to confirm no regression. DetailPage enrichment
(keywords, collections, full crew, certifications, budget/revenue) —
flagged as a natural fast-follow, not built this round.

**Verified**: build/lint clean (0 errors — one new
`react-hooks/exhaustive-deps` warning on `useMovieConsole.jsx` matches
`useDiscover.jsx`'s existing, expected pattern exactly). Runtime-checked
via `browser-automation` with the established temp-debug-user pattern
(reverted cleanly, confirmed via grep): `/movies` renders the full HUD
console with live TMDB data, preset chips switch datasets and update
the result count, the preset↔filter interaction works as designed, and
`/shows` still renders its original hero+rows page unregressed.

---

### 2.9 — Rollout to `/shows`

User liked 2.8's result enough to ask for the identical treatment on
`/shows`, superseding that phase's "deliberately out of scope" note
above. Generalized the Movies-only HUD components into shared
`mediaType`-aware ones rather than duplicating a parallel TV version —
matches this codebase's own precedent (`Discover.jsx` already serves
both movie/tv, `Anime.jsx` thin-wraps it).

- [x] `useMovieConsole.jsx`: `PRESET_ENDPOINTS` restructured to
      `{ movie: {...}, tv: {...} }` — movie keeps `now_playing`/
      `upcoming` (TMDB has no TV equivalent for either); TV gets
      `on_the_air`/`airing_today` instead. `trending` and `popular`/
      `top_rated` exist on both.
- [x] `useMarqueeBackdrops.jsx`: added a `mediaType` param (default
      `'movie'`), fetches `/{mediaType}/popular` instead of a hardcoded
      `/movie/popular`.
- [x] `PresetChips.jsx`: hardcoded `PRESETS` constant replaced with an
      exported `MOVIE_PRESETS`/`TV_PRESETS` pair (caller passes
      whichever applies via a new `presets` prop) — this component
      itself no longer knows or cares which media type it's rendering
      chips for.
- [x] `ConsoleHeader.jsx`: hardcoded `"Movies"` headline text and
      `"Cinegraph // Movie Index"` eyebrow replaced with `title`/
      `eyebrowLabel` props.
- [x] `MovieGridHud.jsx` / `MovieCardHud.jsx` / `FilterPanelHud.jsx`:
      each gained/threaded a `mediaType` prop (default `'movie'`,
      MovieCardHud already had this) instead of hardcoding `'movie'`
      internally.
- [x] New `MediaConsole.jsx` — the full page previously inlined in
      `Movies.jsx` (state, `useMovieConsole`/`useMarqueeBackdrops`/
      `useGenres`/`useMultiSearch` wiring, infinite-scroll observer,
      the search-vs-browse branch), now taking `mediaType`/`title`/
      `eyebrowLabel`/`presets` as props. `Movies.jsx` and the new
      `Shows.jsx` are now ~10-line wrappers passing their respective
      values — all real logic lives in one place, so a future bug fix
      or design tweak doesn't need to be made twice.
- [x] `Shows.jsx` rewritten from scratch (old file replaced entirely,
      not extended) — mirrors `Movies.jsx`'s wrapper shape exactly:
      `mediaType="tv"`, `title="TV Shows"`,
      `eyebrowLabel="Cinegraph // Series Index"`, `TV_PRESETS`.
- [x] Cleanup, grep-verified before deleting: `browse/MainContainer.jsx`,
      `browse/VideoTitle.jsx`, `shows/ShowsSecondaryContainer.jsx`, and
      all four TV list hooks (`useOnTheAirShows`, `usePopularShows`,
      `useTopRatedShows`, `useAiringTodayShows`) — none had any
      consumer left once `Shows.jsx` stopped needing them.
      `browse/VideoBackground.jsx` and `useTrailer.jsx` were **kept** —
      `DetailPage.jsx` still uses `VideoBackground` for its own hero,
      for both movie and tv title pages. `tvSlice.jsx` trimmed to just
      `trailerVideo`/`addTvTrailerVideo` (same reasoning); the other
      four state fields and their reducers deleted, matching what 2.8
      did to `moviesSlice.jsx`.
- [x] No routing change needed — `Body.jsx`'s `/shows` → `Shows.jsx`
      lazy import already pointed at the right file path; only the
      file's contents changed.

**Verified**: build/lint clean (0 errors, warning count dropped 20→18
from removing the four dead TV hooks' own `exhaustive-deps` warnings).
Runtime-checked via `browser-automation`: `/shows` renders the full HUD
console with live TMDB TV data (correct TV-only genres like Kids/News/
Reality/Soap/War & Politics, correct preset set with "Airing Today"
instead of "Upcoming"), clicking "Top Rated" correctly switches to
TV top-rated data; `/movies` re-verified fully unregressed by the
generalization; `/discover` (still uses `FilterPanel.jsx` directly,
untouched) and a `/title/movie/:id` detail page (still uses
`VideoBackground`) both spot-checked working.

---

### 2.10 — Rollout to `/anime`

Same request, third page. Anime is meaningfully different from Movies/
Shows though: it's constrained (Animation genre + Japanese original
language, forced and non-removable) and spans both movie and TV via a
toggle, rather than being a single fixed, unconstrained `mediaType`.
Both needed genuinely new capability in `MediaConsole.jsx`, not just a
new set of props.

- [x] `useMarqueeBackdrops.jsx`: now accepts an options object
      (`{ baseGenres, originLanguage }`). Unconstrained (Movies/Shows):
      unchanged `/{mediaType}/popular` behavior. Constrained (Anime):
      switches to `/discover/{mediaType}` with those params via the
      shared `buildDiscoverParams` — otherwise the ambient carousel
      would show random non-anime backdrops, which would directly
      contradict the page it's decorating.
- [x] `FilterPanelHud.jsx`: threads a new `excludeGenreIds` prop down
      to the underlying `FilterPanel.jsx` (which already supported it,
      just wasn't wired through this wrapper).
- [x] `MediaConsole.jsx`: three additions —
      1. `baseGenres`/`originLanguage`/`excludeGenreIds` props, folded
         into `defaultFilters` and threaded to `useMovieConsole`,
         `useMarqueeBackdrops`, and `FilterPanelHud`.
      2. `presets` now defaults to `[]` and the whole `PresetChips` row
         is conditionally rendered (`presets.length > 0`) — a
         constrained catalog can't offer fixed-list presets at all,
         since TMDB's dedicated list endpoints (`/movie/popular`,
         `/tv/top_rated`, etc.) don't accept genre/language params, so
         a "Popular" preset on the Anime page would silently ignore
         the Animation+Japanese constraint and show ordinary movies.
         Anime passes `presets={[]}`, hiding the row outright rather
         than offering presets that lie.
      3. New optional `mediaTypes` prop (`[{value,label}, ...]`) — when
         given, renders a small bracket-corner `MediaTypeTabs` toggle
         (styled like `PresetChips` but visually distinct, since it
         changes *which catalog* is queried, not just the sort/filter
         mode) and manages `mediaType` as internal state instead of a
         fixed prop; switching resets filters back to
         `defaultFilters` (genre ids aren't comparable across
         movie/tv). Movies/Shows don't pass `mediaTypes`, so they keep
         their original fixed-`mediaType`, no-toggle behavior exactly
         as before.
      4. Header's "Genres tracked" stat now excludes `excludeGenreIds`
         from the count (`visibleGenreCount`), so Anime correctly
         reports 18/15 tracked (19/16 total minus the hidden Animation
         chip) instead of the misleading raw total.
- [x] `Anime.jsx` rewritten from scratch — was a 10-line wrapper around
      `Discover` (`baseGenres={[16]}`, `originLanguage="ja"`,
      `excludeGenreIds={[16]}`), now the same shape around
      `MediaConsole` instead, plus `mediaTypes={[movie, tv]}`,
      `title="Anime"`, `eyebrowLabel="Cinegraph // Anime Index"`. Old
      `Discover.jsx` itself is completely untouched — still serves
      `/discover` directly, Anime just stopped being its consumer.
- [x] No routing change — `Body.jsx`'s `/anime` → `Anime.jsx` import
      already pointed at the right file path.

**Verified**: build/lint clean (0 errors — the few new warnings are
the same accepted categories already present elsewhere: an
`exhaustive-deps` warning matching `useDiscover.jsx`'s existing
pattern, and `react-refresh/only-export-components` on
`PresetChips.jsx` for its two exported preset-list constants, matching
the existing warning on `ui/button.jsx`/`ui/tabs.jsx`). Runtime-checked
via `browser-automation`: `/anime` renders real, correctly-filtered
anime titles (Spirited Away, Your Name, Ghost in the Shell, Princess
Mononoke), the Animation genre chip is correctly absent from the
filter panel while the header's genre-tracked count correctly excludes
it (18 of 19 total movie genres), the ambient carousel shows anime
backdrops specifically (not random movies), and clicking the "TV
Shows" tab correctly re-fetches TV anime with TV's own genre taxonomy
(15 tracked vs. 18) and different results (Bleach, Mushoku Tensei).
`/movies` and `/shows` re-verified fully unregressed by the
`MediaConsole.jsx` restructuring.

**Deliberately out of scope**: `/discover` itself (still the original
`Discover.jsx`/`FilterPanel.jsx` UI, untouched — no request yet to give
it the HUD treatment too, and it's a fundamentally different page
shape: full movie+tv catalog with a live search-as-you-type mode,
already reused as-is by two consumers).

- [x] **Bug fix, same phase family** — user reported: select "Top
      Rated", then touch any filter (e.g. a genre chip), and the
      results silently become "Popular"-sorted instead of staying
      rating-sorted. Root cause: `handleFiltersChange` correctly
      dropped the active preset (as designed, since a fixed TMDB list
      endpoint can't be filtered further) but never translated the
      preset into an equivalent `/discover` sort order — it just kept
      whatever `sortBy` was already sitting in `filters` state, which
      was always the untouched default (`popularity.desc`), since
      preset mode ignores `filters.sortBy` entirely while it's active.
      Fixed with a `PRESET_SORT_FALLBACK` map (`MediaConsole.jsx`) —
      `top_rated` → `vote_average.desc`, `popular` → `popularity.desc`
      (already the default, listed for completeness),
      `now_playing`/`upcoming` → `primary_release_date.desc`,
      `on_the_air`/`airing_today` → `first_air_date.desc`. `Trending`
      has no sort-order equivalent at all (nothing approximates a
      trending algorithm), so it's intentionally omitted — touching a
      filter while Trending is active still just drops to the default
      sort, same as before. An explicit manual sort-dropdown change
      always wins over the fallback (`partial.sortBy || fallbackSort ||
      prev.sortBy`). Verified live: Top Rated → click the "Crime" genre
      chip → every result shows ★10.0 (rating-sorted), not a mix of
      popular-but-lower-rated titles.
- [x] **Follow-up to the bug fix, same session** — the sort-order fix
      above was real, but the user reported it still "looked" broken:
      the moment a filter is touched, the active preset chip visually
      deselects (jumps to "All Titles" highlighted) and the header's
      "MODE" label flips to "All Titles" too — misleading regardless of
      whether the underlying query is technically correct, since it
      looks like the preset was abandoned entirely. Root cause: the
      chip highlight and mode label both read directly off
      `filters.preset`, which *must* become `null` for the query to
      work (that's the whole mechanism), so the display was
      inextricably tied to an implementation detail the user shouldn't
      have to know about. Fixed by decoupling them: new `displayPreset`
      state in `MediaConsole.jsx`, set only when the user explicitly
      clicks a preset chip or switches media type (via
      `MediaTypeTabs`/Anime), and left untouched by
      `handleFiltersChange` — so it keeps reflecting the user's last
      choice even after the query itself has silently moved to
      `/discover`. `PresetChips`' `activePreset` and `ConsoleHeader`'s
      `activePresetLabel` both now read `displayPreset` instead of
      `filters.preset`. Verified live: Top Rated → Crime now keeps the
      "Top Rated" chip highlighted (bracket corners and all) and the
      header still reads "MODE: TOP RATED", while the Sort By dropdown
      correctly shows "Rating" and every result is both ★10.0 and
      Crime-genre — the full chain (display, sort, filter) all agree
      now.
- [x] **Second follow-up to the bug fix, same session** — user came
      back with screenshots proving the fix was still incomplete: Top
      Rated alone showed the correct ~11,072 results; Top Rated +
      Animation ballooned to 71,155 (versus a real, curated top-rated
      animation list which should be a few hundred to low thousands),
      full of obscure unknown titles; and clicking "Clear all filters"
      afterward ballooned further to 1.16M — the entire catalog. Two
      distinct root causes, both real:
      1. **No vote-count floor.** The Top Rated fallback sort
         (`vote_average.desc`) had no minimum vote count, so an obscure
         short film with a single 10/10 rating outranks genuinely
         acclaimed titles with thousands of votes — exactly what TMDB's
         real `/movie/top_rated` endpoint avoids internally via its own
         weighting, which a naive discover sort doesn't reproduce.
         `buildDiscoverParams` (`useDiscover.jsx`) gained support for a
         new `minVoteCount` filter field (→ `vote_count.gte`) — not
         user-facing in `FilterPanel`, purely an internal floor.
         `PRESET_SORT_FALLBACK` (`MediaConsole.jsx`) now pairs each
         `sortBy` with an optional `minVoteCount` (`top_rated`: 200 for
         movies, 100 for TV — TV vote counts run lower overall).
      2. **"Clear all filters" didn't actually clear back to the
         preset.** It routed through the same `handleFiltersChange` as
         any other filter touch, which unconditionally drops to
         discover mode — so clearing filters while "Top Rated" was
         active left the query as "the entire catalog, sorted by
         rating," a completely different and vastly larger result set
         than the real preset. Fixed with a snap-back: `handleFiltersChange`
         now checks whether the *resulting* filters have zero active
         constraints (no genres/year/rating) and weren't a deliberate
         sort-dropdown change — if so, and a `displayPreset` is set, it
         restores `filters.preset` to the real value instead of staying
         in discover mode, re-fetching the actual TMDB list. This
         self-corrects for both "Clear all filters" and manually
         deselecting the last active filter one at a time, and as a
         bonus also fixes "Trending" (which has no sort-order fallback
         at all) the same way, since the snap-back doesn't depend on
         `PRESET_SORT_FALLBACK` having an entry for the preset.
      Verified live, reproducing the user's exact repro: Top Rated
      alone → 11,072 (matches); + Animation → 1,266 real, acclaimed
      titles (Avatar: The Last Airbender, Attack on Titan, Demon
      Slayer, Spirited Away — not junk); Clear all filters → back to
      11,072 with the real Top Rated list (Shawshank Redemption, The
      Godfather) restored exactly.

---

### 2.11 — Rollout to `/discover`

Fourth and final page. Turned out to be the *simplest* rollout of the
four — `MediaConsole.jsx` already supported everything `/discover`
needed (a `mediaTypes` toggle + no presets), since Anime already used
that exact combination, just with an added genre/language constraint
Discover doesn't have. Zero new capability needed in `MediaConsole.jsx`
itself.

- [x] `Discover.jsx` rewritten from scratch — was the original,
      first-built page (full movie+tv catalog, live search-as-you-type,
      genre/year/rating filters — the template `Anime.jsx` was later
      built on top of via `baseGenres`/`originLanguage`/
      `excludeGenreIds`). Now a ~15-line wrapper around `MediaConsole`:
      `mediaTypes={[movie, tv]}`, `presets={[]}` (Discover was always a
      pure filter/search tool, not a curated page with quick
      shortcuts — deliberately not adding presets here, matching its
      original scope rather than expanding it), `title="Discover"`,
      `eyebrowLabel="Cinegraph // Catalog Index"`. No
      `baseGenres`/`originLanguage` (the one thing that made Anime's
      wrapper different) — full, unconstrained catalog.
- [x] Cleanup, grep-verified before deleting: the old `useDiscover`
      hook (`src/hooks/useDiscover.jsx`) had exactly one consumer — the
      old `Discover.jsx` page component, now gone — so it became fully
      dead. Its `buildDiscoverParams` export, however, is still very
      much alive (`useMovieConsole.jsx`, `useMarqueeBackdrops.jsx` both
      depend on it) — moved that one function to a new
      `src/utils/discoverParams.jsx` (a plain helper, not a hook, so
      `hooks/` was never really the right home for it) and deleted the
      now-empty `useDiscover.jsx` entirely, updating both import sites.
- [x] No routing change — `Body.jsx`'s `/discover` → `Discover.jsx`
      import already pointed at the right file path.

**Verified**: build/lint clean (0 errors, warning count dropped 19→18
from removing the dead `useDiscover` hook's own `exhaustive-deps`
warning). Runtime-checked via `browser-automation`: `/discover` renders
the full HUD console (giant "DISCOVER" wordmark, backdrop carousel,
vignette), the preset row is correctly absent, the Movies/TV Shows
toggle works, the full unconstrained genre list shows (19 genres, no
exclusions), and search-as-you-type still works (typing "batman"
correctly returns 10 Batman titles, "MODE: SEARCH"). `/movies` and
`/anime` re-verified fully unregressed. All four media-browsing pages
(`/movies`, `/shows`, `/anime`, `/discover`) now share one
`MediaConsole.jsx` — this branch of `re-do.md`'s ad hoc HUD rollout
work is complete.

---

### 2.12 — DetailPage enrichment

Flagged as a fast-follow once all four catalog pages shared the HUD
console (2.8–2.11). `DetailPage.jsx` was only rendering a slice of what
TMDB already returns for every title.

- [x] `useMediaDetails.jsx` — added `append_to_response` to the existing
      fetch (no new hook/endpoint): `keywords,release_dates` for movie,
      `keywords,content_ratings` for tv. Extra keys land inside the same
      cached `mediaDetails[key]` object, no Redux shape change.
- [x] Certification badge (e.g. "PG-13", "TV-MA") in the hero metadata
      row, parsed from the US entry of `release_dates`/`content_ratings`
      — hidden when absent.
- [x] Keywords — muted tag-chip row under the Overview paragraph, capped
      at 12, normalized across the movie (`keywords.keywords`) vs tv
      (`keywords.results`) response shapes.
- [x] Collection banner (movie only) — `details.belongs_to_collection`
      was already in the base response and unused; now shown as a small
      backdrop strip ("Part of the {name}") between the hero and the
      Overview grid. Static acknowledgment only — no fetch of the
      collection's other entries, no new route.
- [x] "Directed by"/"Created by" credit line near the genre chips — movie
      pulls Director(s) from `credits.crew` (already fetched by
      `useCredits`, previously only `credits.cast` was read); tv reads
      `details.created_by` (already native to `/tv/{id}`, no crew parsing
      needed).
- [x] Full crew section below Cast — `credits.crew` filtered to a
      curated, priority-ordered job list (Director, Writer/Screenplay/
      Story, Producer, Director of Photography, Original Music Composer,
      Editor), deduped by person id (multiple jobs merge into one comma-
      joined subtitle), capped at 12. Reuses `CastGrid.jsx`, generalized
      with a `getSubtitle` prop (defaults to `member.character`, so the
      existing Cast usage is unchanged) instead of hardcoding
      `member.character`.
- [x] Details info panel (Status, Original Language, and — movie only —
      Budget/Revenue formatted via `Intl.NumberFormat(..., { notation:
      'compact' })`, e.g. "$185.0M") stacked below the existing "Where to
      watch" panel, each line hidden individually when falsy/unknown
      (TMDB returns `0` for unknown budget/revenue, not a missing key).

**Verified**: build/lint clean (0 errors, same pre-existing 18 warnings).
Runtime-checked via `browser-automation` using the TEMP-DEBUG pattern in
`Header.jsx` (reverted cleanly, `grep -n "TEMP-DEBUG"` exit 1 afterward):
`/title/movie/862` (Toy Story) — certification "G", "Directed by John
Lasseter", collection banner ("Part of Toy Story Collection"), 12
keyword chips, Details panel showing Budget "$30M"/Revenue "$962M", and
a Crew section (Director/Screenplay/Producer roles) all render correctly
alongside the existing Cast grid. `/title/tv/1399` (Game of Thrones) —
certification "TV-MA", "Created by David Benioff, D. B. Weiss", no
collection/budget/revenue (movie-only branches correctly suppressed),
Crew section shows Producers/Composer (GoT's aggregate credits don't
carry per-episode directors). `/title/movie/550` (Fight Club, standalone
— no collection) — certification "R", "Directed by David Fincher", no
collection banner, layout stays intact with graceful hiding of the
missing optional section.

---

### 2.13 — DetailPage reskin to "Sci-Fi HUD / Data Console"

`/movies`, `/shows`, `/anime`, and `/discover` all shared the v3 HUD look
by 2.11; `DetailPage.jsx` was the one page left on the older v2
"glass panel" look (deliberately, per 2.12's note that "a detail page and
a catalog page are different jobs") — but with every catalog page on-theme,
clicking through from any of them into a title now read as a jarring style
switch. This round is a visual reskin only: same data, same functional
behavior (video trailer autoplay, rating/watchlist controls, taste-match,
overview expand/collapse, similar-titles scroll) — re-chromed with the HUD
tokens already defined in `index.css` from 2.8, nothing new added there.

- [x] Root wrapped in `theme-dark-scope` (matches `MediaConsole.jsx`'s
      root), for consistency with the other three console pages.
- [x] Hero metadata card swapped from `bg-surface-glass`/`rounded-panel`
      to `HudFrame` (bracket corners), with a `Database`-icon eyebrow
      ("CINEGRAPH // TITLE RECORD") mirroring `ConsoleHeader`'s own.
- [x] Metadata row (year/runtime/certification/rating/taste-match) moved
      to `font-mono`; certification badge border `border-hud-line`;
      tagline/"Read more" link `text-accent2` → `text-hud-cyan-strong`
      (`RatingControl`/`WatchlistButton` keep their own established
      `accent`/`accent2` colors completely untouched — same precedent as
      `FilterPanelHud`'s `variant="hud"`).
- [x] Genre chips: pill → bracket-style (`font-mono` uppercase,
      `border-hud-line`, no fill), matching `PresetChips`'s visual family.
      Keyword chips (2.12) stay a visually quieter secondary tier.
- [x] New `SectionEyebrow` helper (icon + `text-hud-cyan` + `font-mono`
      uppercase tracking-wide label) replaces the plain
      `font-display text-lg font-semibold` headers on every section
      (Overview, Where to Watch, Details, Cast, Crew, More Like This) —
      no box/frame around body content, bracket panels stay reserved for
      the hero card only.
- [x] Collection banner reskinned as a slim HUD strip (`Layers` icon +
      "PART OF COLLECTION" eyebrow, `border-hud-line` top/bottom).
- [x] Details `<dl>` converted into a proper `font-mono` label:value data
      readout (`text-hud-cyan-strong` values), the same visual language
      as `ConsoleHeader`'s "Results:"/"Mode:" stat line.
- [x] `md:border-l md:border-hud-line/20 md:pl-8` divider added between
      the Overview and Where-to-Watch/Details columns.
- [x] `CastGrid.jsx` — hover ring `accent2` → `hud-cyan`
      (`group-hover:border-hud-cyan/50` +
      `shadow-[...var(--color-hud-cyan-glow)]`), subtitle (character/job)
      text switched to `font-mono`. `getSubtitle` prop contract (2.12)
      unchanged. Avatars stay circular (people, not database records).
- [x] New `src/components/detail/SimilarTitlesHud.jsx` — HUD sibling to
      `MovieList.jsx`, same horizontal-scroll behavior but built on
      `MovieCardHud` tiles (bracket corners, persistent rating/year/genre
      readout — the same tile every catalog page uses) instead of
      `MovieCard`'s hover-gated one. Builds its own `genreMap` via
      `useGenres(mediaType)`. Replaces `<MovieList title="More Like
      This".../>` in `DetailPage.jsx` only — **`MovieList.jsx` and
      `MovieCard.jsx` are untouched**, still depended on by
      `GptMovieSuggestions.jsx` (AI search results), `Watchlist.jsx`, and
      `Profile.jsx`. Mixing a HUD variant into a shared component via
      conditionals was already explicitly rejected as a pattern in the
      original Movies HUD plan — `MovieCardHud` is a sibling file, not a
      variant prop, for exactly this reason, and `SimilarTitlesHud`
      follows the same precedent.
- [x] Nothing added to `index.css` — every token/class used
      (`hud-panel`, `hud-corner*`, `--color-hud-cyan*`, `--color-hud-line`,
      `font-mono`) already existed from 2.8. No routing, hook, or Redux
      changes.

**Verified**: build/lint clean (0 errors, same pre-existing 18 warnings).
Runtime-checked via `browser-automation` using the TEMP-DEBUG pattern in
`Header.jsx` (reverted cleanly, `grep -n "TEMP-DEBUG"` exit 1 afterward):
`/title/movie/862` (Toy Story) — bracket-corner hero card, HUD eyebrow,
mono uppercase genre chips, cyan Details readout, and a "More Like This"
row now rendering `MovieCardHud` tiles identical to the catalog pages.
`/title/tv/1399` (Game of Thrones) — tv path reskinned correctly, no
collection/budget section. `/watchlist` spot-checked (loads with 0
console errors) to confirm `MovieCard`/`MovieList` — used elsewhere —
were unaffected by the new sibling component.

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

### 3.4 — Security fix
- [x] **Done early, ad hoc, ahead of the rest of Phase 3** — see 2.7
      below. Landed as a Cloudflare Worker rather than a Firebase Cloud
      Function (avoids requiring the Blaze/billing plan just to deploy).
      `buildPersonalizedPrompt` (3.1) will inject into
      `gpt-proxy-worker/src/index.js`'s system prompt, not a
      client-side one, once 3.1 lands.

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
- [x] Accessibility pass — done in the visual redesign's Phase 10
      (`better-ui-ux.md`): every icon-only button has an `aria-label`,
      the profile menu was migrated from a hand-rolled div/li dropdown to
      shadcn's Radix-based `DropdownMenu` (real keyboard nav, focus trap,
      Escape-to-close — the old version had none of that), two
      `focus:outline-none` instances with no replacement ring were fixed,
      `prefers-reduced-motion` wired globally via `MotionConfig`. Not
      independently re-verified against a Lighthouse/axe run — see that
      phase's notes for what was and wasn't checked
- [x] Code-split routes with `React.lazy` — done in the visual redesign's
      Phase 10 (`better-ui-ux.md`). `Body.jsx` wraps every route in
      `lazy()`/`Suspense`; the single-bundle main chunk went from ~1.35MB
      to 358KB, with each page shipping its own small chunk. Motion
      itself is now the largest single chunk (~906KB/238KB gzip, shared
      across all routes) — an accepted tradeoff for the `layoutId`
      shared-element transitions and `AnimatePresence` usage; a
      `LazyMotion` refactor would touch ~14 files and likely lose the
      layout-animation support currently in use, so it wasn't done
      unilaterally
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
