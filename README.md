<div align="center">

  <h1>Cinegraph</h1>
  <p>An AI movie & show recommendation engine built on your own taste graph — not another feed of what's popular this week.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react" alt="React 19">
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4">
    <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux" alt="Redux Toolkit">
    <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase" alt="Firebase 12">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  </p>

</div>

## Live demo

**[https://netflixgpt-e671d.web.app](https://netflixgpt-e671d.web.app)**

## What this is

Cinegraph is three pillars, working together:

1. **A real movie/show database** — browse, filter, search, and drill into
   detail pages backed by [TMDB](https://www.themoviedb.org/documentation/api),
   not a fixed carousel of the same ten titles.
2. **A preference graph** *(in progress)* — the app learns what you
   actually like from your ratings, and turns that into a visible taste
   profile rather than a hidden backend number.
3. **An AI recommendation layer** — GPT-powered natural-language search
   that will read your preference graph before answering, so results get
   personal and explain *why* they were picked.

It deliberately isn't a Netflix clone. No borrowed logo, no borrowed
palette, no borrowed layout — the identity, design system, and
information architecture were all built from scratch around what this
app actually does.

## Features

**Movie & TV database**
- Browse (movies) and TV Shows pages with curated rows (Now Playing,
  Popular, Top Rated, and more)
- **Discover** — a real filterable/searchable catalog: genre chips,
  year range, minimum rating, sort order, and infinite scroll, with a
  desktop sidebar / mobile dropdown filter layout
- **Anime** — Discover's engine reused with Animation genre + Japanese
  original-language constraints baked in, since TMDB has no first-class
  "anime" type
- **Detail pages** for every title — cast, trailer (autoplaying, falls
  back to a backdrop image when TMDB has no trailer), watch providers,
  and a "More Like This" row
- Search reachable from anywhere Discover is used, debounced,
  mixed movie/TV results

**AI search**
- Natural-language movie search ("something like Inception, but
  shorter") powered by GPT via OpenRouter

**Accounts & platform**
- Firebase Authentication (email/password), with session persistence
- Firestore database, provisioned and locked down with per-user
  security rules (`users/{uid}/...`, enforced server-side)
- Light/dark theme, persisted, built on a real design-token system —
  not a hardcoded color swap

## Tech stack

| Category | Technology |
| --- | --- |
| **Frontend** | [React 19](https://react.dev/) |
| **Build tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) — token-based `@theme` design system, no `tailwind.config.js` |
| **State management** | [Redux Toolkit](https://redux-toolkit.js.org/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Backend** | [Firebase](https://firebase.google.com/) — Authentication, Firestore, Hosting |
| **Movie/TV data** | [TMDB API](https://www.themoviedb.org/documentation/api) |
| **AI search** | GPT via [OpenRouter](https://openrouter.ai/) |
| **Testing (visual verification)** | [Playwright](https://playwright.dev/) |

## Architecture

Components are organized by domain, not dumped in one flat folder:

```
src/components/
├── home/       marketing landing page (logged-out)
├── auth/       login / sign-up
├── layout/     Header, Footer, Logo — shared chrome
├── browse/     movies homepage (hero, rows)
├── shows/      TV shows homepage
├── discover/   filterable catalog (also powers the Anime page)
├── anime/      thin wrapper around Discover with fixed genre/language filters
├── detail/     per-title detail page + cast grid
├── shared/     MovieCard / MovieList — reused everywhere posters appear
└── gpt/        AI search box + results
```

Side effects live in custom hooks (`src/hooks/`) — one hook per TMDB
endpoint, each checking the Redux store before fetching so navigating
back to already-loaded data doesn't refetch. Per-title data
(details/credits/similar/watch-providers/genres) is cached in Redux,
keyed by `${mediaType}_${id}`; filter/search results are **not**
cached globally, since they're inherently tied to whatever's currently
typed/selected.

The design system lives entirely in `src/index.css` as a Tailwind v4
`@theme` block — one accent color, one radius scale, one easing curve.
Light/dark theme works by redefining what the *same* token names point
to under `[data-theme='light']`, rather than maintaining two parallel
class sets.

## Getting started

### Prerequisites
- Node.js 18+
- A [TMDB](https://www.themoviedb.org/documentation/api) API read
  access token
- An [OpenRouter](https://openrouter.ai/) API key (used for AI search)
- A Firebase project, if you want auth/Firestore to work against your
  own backend rather than this one

### Setup

```bash
git clone https://github.com/sh1v-max/Netflix-GPT.git
cd Netflix-GPT
npm install
```

Create a `.env` file in the project root:

```
VITE_TMDB_KEY="your-tmdb-read-access-token"
VITE_OPENROUTER_KEY="your-openrouter-api-key"
```

Firebase's client config (`src/utils/firebaseConfig.jsx`) is currently
inline rather than env-driven, since Firebase web config values aren't
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

## Roadmap

Currently mid-way through building the preference graph:

- [x] **Identity & design system** — Cinegraph branding, token-based
      theme, light/dark mode
- [x] **Movie/show database** — Discover, Anime, detail pages, search
- [x] **Firestore provisioned** — database live, security rules
      deployed and verified
- [ ] **Ratings & watchlist** — like/dislike on every poster and detail
      page, a `/watchlist` page
- [ ] **Computed taste profile** — top genres, favorite eras, a
      `/profile` page with real charts, not a settings screen
- [ ] **Personalized AI recommendations** — GPT prompts that read your
      taste profile, with a one-line "why this was picked" on every
      result
- [ ] **Move the AI call server-side** — currently client-side via
      OpenRouter; a Cloud Function will hold the key instead
- [ ] **Tests, CI, accessibility pass, code-splitting**

## Contributing

Contributions are welcome — fork the repo, create a feature branch, and
open a PR.

## License

MIT. See the `LICENSE` file.

<div align="center">
  <p>Built by Shiv Shankar Singh</p>
</div>
