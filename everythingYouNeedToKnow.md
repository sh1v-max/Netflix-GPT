### Project Overview: Cinegraph

Cinegraph is a full-stack AI movie/TV/anime recommendation app built on
React 19 + Vite 6. It isn't a Netflix clone — no borrowed logo,
palette, or layout — and it isn't just a catalog with a search box
bolted on. Three real pillars, working together: a real TMDB-backed
database (browse/filter/search/detail pages), a preference graph
(ratings → a computed taste profile, visible on `/profile`), and an AI
recommendation layer (Gemini, personalized, multi-turn, covering
movies/TV/anime in one search). See `README.md` for the user-facing
pitch and `OVERVIEW.md` for the full architecture reference — this
doc's job is interview prep: what to say when asked about a decision,
and why.

---

### Part 1: Architecture and Philosophy

- **SPA**, React Router 7 for client-side routing, no SSR/meta-framework
  — a deliberate choice, discussed in the Q&A below.
- **Component-based, organized by domain** (`src/components/movies/`,
  `detail/`, `gpt/`, `profile/`, `watchlist/`, `shared/`, `ui/` for
  shadcn/Radix primitives), not one flat folder.
- **Core user journey**: land on `/` (marketing page) → sign up/in
  (`/login`) → `/home`, an AI-search-first landing (not a carousel
  wall) → browse via `/movies`/`/shows`/`/anime`/`/discover` or search
  naturally → click into a detail page → rate it (like/dislike) → the
  rating feeds a computed taste profile (`/profile`) that personalizes
  every future AI search.

---

### Part 2: The Stack — what, why, how

#### 1. React 19
- **Why**: component model fits a UI built from repeated pieces
  (poster cards, rows, detail sections); huge ecosystem (Redux Toolkit,
  React Router, Motion).
- **How**: JSX throughout `src/components/`; local state via
  `useState`, global state via Redux; **custom hooks** (`src/hooks/`)
  own all data-fetching/caching, keeping components focused on
  rendering.

#### 2. Vite 6
- **Why over Create React App**: near-instant dev server start and HMR
  via native ES modules; Rollup-based production builds (tree-shaking,
  code-splitting).
- **How**: `vite.config.js` for plugins (`@vitejs/plugin-react`,
  Tailwind's Vite plugin); `npm run dev` for local, `npm run build` →
  `dist/` for production. Routes are code-split via `React.lazy` in
  `Body.jsx` — the single-bundle main chunk went from ~1.35MB to
  ~358KB doing this.

#### 3. Tailwind CSS v4
- **Why**: styles co-located with markup, no context-switching to CSS
  files; the whole design system (colors, spacing, radius, easing) is
  one source of truth.
- **How**: **no `tailwind.config.js`** — v4's `@theme` block lives
  entirely in `src/index.css`. Custom tokens (`--color-hud-cyan`,
  `--color-accent2`, `--font-display`, `--ease-cg-standard`, etc.)
  define the "space console" aesthetic: bracket-corner `hud-panel`
  cards, monospace uppercase labels, cyan/indigo accents.

#### 4. Redux Toolkit
- **Why over Context**: the app has genuinely interrelated, frequently
  updated state (auth, cached TMDB data per title, live Firestore
  ratings/watchlist, in-flight AI search/conversation state) — Context
  re-renders every consumer on any change; Redux only re-renders
  components subscribed to the specific slice that changed.
- **How**: `configureStore` in `src/store/appStore.jsx`, seven slices
  via `createSlice`: `user`, `movies` (Home's marketing grid only),
  `details` (per-title cache, keyed `${mediaType}_${id}`),
  `preferences` (ratings/watchlist, synced live from Firestore),
  `gpt` (search conversation `turns` array), `forYou` (no-query
  recommendations, cached per category), `config` (language).

#### 5. Firebase
- **Why**: Authentication + Firestore cover everything needed
  (accounts, per-user data) without running a backend server.
- **How**: `getAuth()`/`getFirestore()` initialized in
  `src/utils/firebaseConfig.jsx`/`firestoreConfig.jsx`. `usePreferencesSync`
  opens a live `onSnapshot` listener the moment a user's UID exists —
  every `RatingControl` anywhere in the app reflects a change instantly,
  no manual refetching. Firestore security rules enforce
  `users/{uid}/...` ownership server-side, not just hidden in the UI.
  **Firebase Storage is deliberately not used** — as of late 2024 it
  requires the paid Blaze plan to provision at all, even to stay inside
  free-tier limits; custom avatar uploads go through **Cloudinary**'s
  unsigned client-side upload API instead, at zero cost.

#### 6. AI search — Gemini via a Cloudflare Worker
This is the feature most worth being able to explain in depth (see
`ai_usage.md` for the full version).
- **Why not call an LLM directly from the browser**: two separate
  problems. (1) Most LLM APIs, Gemini included, don't send CORS headers
  for browser-origin requests — a direct `fetch()` gets blocked before
  it reaches Google. (2) Even if CORS weren't an issue, any
  `VITE_`-prefixed env var ships inside the built JS bundle, readable
  by anyone via dev tools — an API key there could be lifted and run up
  against your quota/billing.
- **The fix**: a standalone Cloudflare Worker (`gpt-proxy-worker/`,
  separate `package.json`, not part of the Vite build) holds the
  Gemini key as an encrypted secret, sets its own CORS headers for the
  app's real origins, and is the only thing that ever calls Gemini.
- **Why Cloudflare Workers over Firebase Cloud Functions** (Firebase
  was already in use): deploying *any* Cloud Function — even one just
  calling Gemini — requires upgrading to Firebase's paid Blaze plan.
  Cloudflare Workers deploy free, no card, 100K requests/day.
- **Provider history**: started calling OpenAI directly (cost money per
  request — not viable for a learning project) → moved to OpenRouter
  (free-tier models, but the model in use got silently pulled from
  their catalog with no warning) → moved to Gemini (documented, stable
  free tier — though it turned out to be a hard 20 requests/day cap,
  confirmed by hitting it) → briefly tried OpenAI again directly for a
  more generous advertised free tier, reverted the same day when the
  API rejected every request with `credit_balance_exhausted` (that free
  tier isn't actually usable without a funded/billed account). Currently
  on Gemini.

---

### Part 3: Feature walkthroughs

**Auth flow**: `Login.jsx` uses `useRef` for form fields (uncontrolled
— no re-render per keystroke, fine for a simple submit-only form) +
regex validation (`validateConfig.jsx`) before calling
`signInWithEmailAndPassword`/`createUserWithEmailAndPassword`.
`Header.jsx` mounts one `onAuthStateChanged` listener app-wide:
logged-in → `addUser` to Redux + redirect to `/home`; logged-out →
`removeUser` + redirect away from protected routes.

**Catalog pages** (`/movies`, `/shows`, `/anime`, `/discover`): all
four share one engine, `MediaConsole.jsx` — genre chips, year range,
min rating, sort order, infinite scroll via `IntersectionObserver`.
Anime is TMDB's Animation genre + Japanese original-language
constraint (TMDB has no first-class "anime" type). Filters render as a
sticky desktop sidebar or a toggle drawer on mobile — not two separate
implementations.

**Detail pages**: cast/crew, click-to-open trailer, watch providers, a
taste-compatibility read computed from genre overlap with the user's
own rating history (only shown once there's real signal — 3+ other
rated titles with genre overlap), a "More Like This" row.

**Ratings → taste profile**: liking/disliking a title writes to
Firestore; `computeTasteProfile.jsx` turns the raw
ratings/genres/years into top genres, a favorite decade, and an
avoid-list — pure, synchronous, no extra Firestore read (computed
client-side from what's already synced). `/profile` renders this as
real charts (`SequentialBarChart.jsx`), not a settings screen.

**AI search** (`/home`): personalized once 3+ titles are rated
(`buildPersonalizedPrompt.jsx` turns the taste profile into a sentence
sent alongside the query), supports multi-turn follow-ups (prior turns
sent as real conversation history, not just text pasted into one
message), and classifies each result as movie or TV so it can search
the right TMDB endpoint. "For You" (three rows — Movies/TV/Anime) runs
the same pipeline with no query at all, each personalized from only
that category's rating history.

---

### Part 4: Interview questions this project should prepare you for

**Why an SPA, not Next.js/SSR?**
"The whole experience sits behind a login for the parts that matter —
SEO isn't a real concern for `/home`, `/movies`, `/watchlist`, etc. An
SPA gives instant client-side navigation once the initial bundle loads,
which matters more here than first-paint SEO would. The pre-login
marketing page (`/`) is the one place SSR would help most, and it's
also the smallest, simplest page in the app — the tradeoff was judged
not worth adopting a whole meta-framework for."

**Why Redux Toolkit over Context or a lighter library (Zustand,
Jotai)?**
"The state here is genuinely complex and cross-cutting: cached
per-title data keyed by ID, live-synced Firestore preferences, a
multi-turn AI conversation with its own turn history, three
independently-cached 'For You' categories. Redux DevTools' time-travel
debugging earned its keep multiple times while building the multi-turn
feature. That said, a lot of the *local* interaction state (search bar
text, in-flight loading flags) deliberately stays in `useState`, not
Redux — global state for genuinely global concerns, not a rule that
everything belongs in the store."

**Why proxy the AI call through your own Cloudflare Worker instead of
using a service like OpenRouter that allows direct browser calls?**
"OpenRouter's exact appeal — free-tier models callable straight from
the browser — is also its instability: the model this project used got
pulled from their catalog without warning, and search broke with zero
code changes on our end. Gemini's free tier doesn't rotate models the
same way, but it also doesn't support browser CORS, which forced (in a
good way) moving the call server-side — which is the correct security
posture anyway, regardless of which provider allows browser calls."

**How would you explain the anime-detection approach, and its
limitation?**
"TMDB has no first-class 'anime' media type — it's approximated as the
Animation genre plus Japanese original-language for the catalog pages.
For splitting a user's *rating history* into movie/TV/anime buckets
(used to personalize the three 'For You' rows separately), the
original-language field isn't stored per rating in Firestore, so that
bucket uses Animation-genre-alone as a proxy — 'animated,' not strictly
'Japanese animated.' Documented as a known simplification rather than
presented as exact — the kind of tradeoff worth being upfront about in
an interview rather than glossing over."

**What's a real bug you found and fixed, not just a feature you
built?**
Good ones to have ready, each with a real root cause (not "I fixed a
bug," but the actual mechanism):
- A Tailwind Grid item overflowed its column because grid items default
  to `min-width: auto` — `min-w-0` on the item let it shrink and wrap
  text normally. (Two earlier fix attempts missed this — one addressed
  a different, real bug in the same area; the eventual fix was found
  by measuring `getBoundingClientRect()` directly instead of reasoning
  about the CSS.)
- Every scroll-row's prev/next button used the browser's native
  `scrollBy({behavior:'smooth'})`, which several browsers silently
  collapse into an instant jump when the OS has "reduce motion"
  enabled — invisible unless you know to check for it. Replaced with a
  hand-driven animation via Motion's imperative `animate()`.
- A `w-full` + percentage-margin combination on the same element (`w-full
  mx-[10%]`) made a container ~120% as wide as its parent — `w-full`
  claims 100% of the available width, then percentage margins add more
  on top instead of being subtracted from it.

**What would you do differently if starting over?**
"Add tests from day one rather than treating them as a Phase 4 item —
`computeTasteProfile` and the personalization prompt-building logic in
particular are pure functions that would have been trivial to test as
they were written, and the multi-turn conversation logic would have
benefited from tests catching regressions across the several rounds of
changes it went through."

---

For anything this doc doesn't cover in enough depth, `OVERVIEW.md` is
the authoritative architecture reference and `re-do.md` is the full
build log — both are kept current, this doc is the "explain it out
loud" companion to them.
