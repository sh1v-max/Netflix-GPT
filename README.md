<div align="center">

  <h1>Cinegraph</h1>
  <p>An AI movie, TV, and anime recommendation engine built on your own taste graph — not another feed of what's popular this week.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react" alt="React 19">
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4">
    <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux" alt="Redux Toolkit">
    <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase" alt="Firebase 12">
    <img src="https://img.shields.io/badge/Gemini_API-AI_Search-4285F4?logo=googlegemini&logoColor=white" alt="Gemini API">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  </p>

</div>

## Live demo

**[https://cinewatchgraph-ai.web.app](https://cinewatchgraph-ai.web.app)**

## What this is

Cinegraph is three pillars, working together:

1. **A real movie/TV/anime database** — browse, filter, search, and
   drill into detail pages backed by [TMDB](https://www.themoviedb.org/documentation/api),
   not a fixed carousel of the same ten titles.
2. **A preference graph** — rate what you watch (like/dislike) and the
   app computes a real taste profile from it: top genres, favorite
   decades, what you tend to avoid — visible on your `/profile` page,
   not a hidden backend number.
3. **An AI recommendation layer** — natural-language search (Gemini,
   proxied through a Cloudflare Worker so the key never touches the
   browser) that reads your taste graph before answering, explains
   *why* each result was picked, supports multi-turn follow-ups
   ("more like the third one, but shorter"), and covers movies, TV
   shows, *and* anime in one search.

It deliberately isn't a Netflix clone. No borrowed logo, no borrowed
palette, no borrowed layout — the identity, design system (a dark
"space console" aesthetic — bracket-corner data readouts, cyan accents,
monospace labels), and information architecture were all built from
scratch around what this app actually does.

## Features

**Movie, TV & anime database**
- `/movies`, `/shows`, `/discover` — a real filterable/searchable
  catalog per media type: genre chips, year range, minimum rating, sort
  order, infinite scroll, sticky sidebar filters on desktop / a toggle
  drawer on mobile
- **Anime** — the same catalog engine with the Animation genre +
  Japanese original-language constraint baked in, since TMDB has no
  first-class "anime" type
- **Detail pages** for every title — cast/crew, an autoplaying trailer
  (click-to-open theater view), watch providers, a taste-compatibility
  read against your own ratings, and a "More Like This" row
- Debounced multi-search reachable from the catalog pages, mixed
  movie/TV results

**AI search** (`/home`)
- Natural-language search ("something like Inception, but shorter") —
  personalized once you've rated 3+ titles, with a one-line "why this
  was picked" per result
- **Multi-turn conversation** — follow-up refinements build on your
  prior turns (up to 5 back), not a fresh query every time
- **For You** — three always-visible, independently personalized rows
  (Movies / TV Shows / Anime) generated with no query at all, each
  computed from only that category's rating history
- Covers movies, TV shows, and anime in a single search — each result
  classified and cross-referenced against real TMDB data, never a
  hallucinated title

**Ratings, watchlist & taste profile**
- Like/dislike on every poster and detail page, synced live via
  Firestore (no manual refetching anywhere in the app)
- `/watchlist` — bookmark titles from any poster; a dedicated page with
  the same bracket-corner card grid as the catalog pages
- `/profile` — your computed taste graph (top genres, favorite decade)
  as real charts, a watchlist preview, and an avatar picker (18 presets
  across four styles, or upload your own via Cloudinary)

**Accounts & platform**
- Firebase Authentication (email/password), with session persistence
- Firestore, provisioned and locked down with per-user security rules
  (`users/{uid}/...`, enforced server-side — not just hidden in the UI)
- Fully responsive, including a fixed bottom tab bar on mobile (not a
  hamburger drawer)

## Tech stack

| Category | Technology |
| --- | --- |
| **Frontend** | [React 19](https://react.dev/) |
| **Build tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) — token-based `@theme` design system, no `tailwind.config.js` |
| **Animation** | [Motion](https://motion.dev/) (Framer Motion) — every transition/scroll animation in the app runs through it, not native CSS |
| **State management** | [Redux Toolkit](https://redux-toolkit.js.org/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Backend** | [Firebase](https://firebase.google.com/) — Authentication, Firestore, Hosting |
| **Movie/TV/anime data** | [TMDB API](https://www.themoviedb.org/documentation/api) |
| **AI search** | [Gemini API](https://ai.google.dev/), proxied through a standalone [Cloudflare Worker](./gpt-proxy-worker) — the key lives only as a Worker secret, never shipped to the client |
| **Avatar uploads** | [Cloudinary](https://cloudinary.com/) — unsigned client-side upload, no backend needed |

## Architecture

Components are organized by domain, not dumped in one flat folder:

```
src/components/
├── home/       marketing landing page (logged-out)
├── auth/       login / sign-up
├── layout/     Header, MobileBottomNav, Footer, Logo — shared chrome
├── movies/     the shared catalog "console" engine (MediaConsole, filters, grid)
├── shows/      thin wrapper around the catalog engine, media type = tv
├── discover/   thin wrapper around the catalog engine, no fixed preset
├── anime/      thin wrapper around the catalog engine, genre/language locked
├── detail/     per-title detail page, cast grid, similar titles
├── gpt/        AI search bar, results, For You rows, how-it-works
├── watchlist/  saved titles page
├── profile/    taste graph, avatar picker, account actions
├── shared/     RatingControl, WatchlistButton, MovieCardHud, HudScrollRow — reused everywhere
└── ui/         shadcn/Radix primitives (Dialog, DropdownMenu, Sheet, ...)
```

Side effects live in custom hooks (`src/hooks/`) — one hook per
concern, each checking the Redux store before fetching so navigating
back to already-loaded data doesn't refetch. Per-title data
(details/credits/similar/watch-providers/genres) is cached in Redux,
keyed by `${mediaType}_${id}`; filter/search results are **not**
cached globally, since they're inherently tied to whatever's currently
typed/selected.

The design system lives entirely in `src/index.css` as a Tailwind v4
`@theme` block — cyan/indigo accent tokens, bracket-corner "HUD panel"
primitives, one easing curve shared by every Motion animation in the
app.

## Getting started

### Prerequisites
- Node.js 18+
- A [TMDB](https://www.themoviedb.org/documentation/api) API read
  access token
- A Firebase project, if you want auth/Firestore to work against your
  own backend rather than this one
- (Optional) A [Cloudinary](https://cloudinary.com/) account, for
  custom avatar uploads
- (Optional) A deployed instance of [`gpt-proxy-worker`](./gpt-proxy-worker),
  for AI search — see that folder's own setup

### Setup

```bash
git clone https://github.com/sh1v-max/Netflix-GPT.git
cd Netflix-GPT
npm install
```

Create a `.env` file in the project root:

```
VITE_TMDB_KEY="your-tmdb-read-access-token"
VITE_GPT_PROXY_URL="https://your-deployed-worker.workers.dev"
VITE_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
VITE_CLOUDINARY_UPLOAD_PRESET="your-unsigned-upload-preset"
```

Firebase's client config (`src/utils/firebaseConfig.jsx`) is inline
rather than env-driven, since Firebase web config values aren't
secret — swap them for your own project's config if forking this.

```bash
npm run dev
```

Runs at `http://localhost:5173`.

### Deploying

```bash
npm run build
npx firebase deploy --only hosting,firestore:rules
```

The AI proxy is deployed separately — see
[`gpt-proxy-worker/`](./gpt-proxy-worker):

```bash
cd gpt-proxy-worker
npx wrangler deploy
```

## Roadmap

- [x] **Identity & design system** — Cinegraph branding, "space
      console" token-based theme
- [x] **Movie/TV/anime database** — catalog engine, detail pages,
      search
- [x] **Ratings, watchlist & taste profile** — live Firestore sync,
      computed genre/decade charts on `/profile`
- [x] **Personalized AI recommendations** — taste-graph-aware prompts,
      "why this was picked" per result, no-query "For You" rows
- [x] **Multi-turn AI conversation** — follow-up refinements, up to 5
      turns of context
- [x] **AI call moved server-side** — a Cloudflare Worker holds the
      Gemini key; the client never sees it
- [x] **Mobile responsiveness pass** — fixed bottom tab bar, no
      cut-off/overflowing layouts
- [ ] **Tests** — Vitest + React Testing Library, starting with the
      taste-profile computation and preferences slices
- [ ] **CI** — lint/build/test on every PR
- [ ] **Accessibility audit** — a real Lighthouse/axe pass, not just
      spot-fixes

See [`re-do.md`](./re-do.md) for the full, detailed build log this
roadmap is summarized from.

## Contributing

Contributions are welcome — fork the repo, create a feature branch, and
open a PR.

## License

MIT. See the `LICENSE` file.

<div align="center">
  <p>Built by Shiv Shankar Singh</p>
</div>
