# Cinegraph — Better UI/UX Implementation Plan

Companion to `DESIGN-SYSTEM.md` (the approved tokens/philosophy). This
file is the execution plan: phases, steps, and the real files each
phase touches. Work stops after each phase for approval before the
next one starts. Architecture, routing, Redux, Firebase, and TMDB
logic are **out of scope** everywhere below — visual/interaction layer
only.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Setup & Tooling

Nothing user-visible changes yet. Gets the new stack installed and
wired without breaking the current app.

- [ ] Install `motion` (Framer Motion), `lucide-react`
- [ ] Install shadcn/ui: run its CLI against this Vite + Tailwind v4
      project, generate `components.json`, add the `cn()` utility
      (`src/lib/utils.js`)
- [ ] Confirm Tailwind v4 `@theme` compatibility with shadcn's CSS
      variable conventions (shadcn expects `--background`,
      `--foreground`, `--primary`, `--radius` etc. — map these onto
      the Cinegraph tokens rather than keeping two parallel systems)
- [ ] Rewrite `src/index.css`: replace/extend the current `@theme`
      block with the full token set from `DESIGN-SYSTEM.md` (color,
      type, spacing, radius, elevation, motion tokens), both
      `[data-theme='dark']` (default) and `[data-theme='light']`
- [ ] Add base shadcn primitives we'll actually use: `button`, `card`,
      `dialog`, `sheet`, `tabs`, `dropdown-menu`, `tooltip`, `skeleton`,
      `input` — install via CLI, do not customize yet (that happens
      per-phase, in context)
- [ ] Sanity check: app still builds and runs unchanged (no visual
      regressions yet — this phase is plumbing only)

**Exit criteria**: `npm run dev` runs clean, new deps present, tokens
in `index.css`, no component visually changed yet.

---

## Phase 1 — Design System ✅ (approved)

Captured in `DESIGN-SYSTEM.md`. Referenced, not repeated, here.

---

## Phase 2 — Home (`src/components/home/Home.jsx`, `src/components/layout/Header.jsx`)

The "wow in 5 seconds" screen. AI search becomes the actual hero.

- [ ] Rebuild hero: large centered AI search treatment, aurora
      background (`--aurora-1/2/3`, slow animated gradient position,
      `mix-blend-mode: screen`), Space Grotesk headline
- [ ] Header: glass elevation (Level 2 token), magnetic/spring hover on
      nav items, active-route indicator via `layoutId` underline
- [ ] Replace any remaining default-browser-feel elements (buttons,
      focus states) with the shadcn+cva Cinegraph skin
- [ ] Entrance: staggered reveal for hero content (headline → search →
      supporting copy), 30–50ms stagger, `--ease-standard`
- [ ] Respect `prefers-reduced-motion` (disable aurora animation +
      stagger, keep content immediately visible)

**After this phase**: UX rationale, accessibility notes (contrast on
aurora background, focus order through header nav), performance notes
(gradient animation GPU cost, background paint), interaction summary —
then wait for approval.

---

## Phase 3 — Browse (`src/components/browse/{Browse,MainContainer,SecondaryContainer,VideoBackground,VideoTitle}.jsx`)

- [ ] `VideoBackground`/`VideoTitle`: floating metadata card over the
      trailer instead of flat text-on-video overlay, glass surface,
      gradient scrim tuned for AA contrast
- [ ] `SecondaryContainer` rows: replace flat poster rows with
      depth-layered cards (elevation + glow-on-hover, not just scale)
- [ ] Row entrance: staggered reveal on scroll-into-view
- [ ] Row horizontal scroll: momentum-friendly, visible affordance,
      keyboard-navigable (arrow keys within a row)

---

## Phase 4 — Discover (`src/components/discover/{Discover,FilterPanel}.jsx`)

This is the "exploration, not catalogue" moment.

- [ ] `FilterPanel`: animated genre/mood chips (spring press feedback,
      active-state glow), progressive disclosure for advanced filters
- [ ] Result grid: shared-layout poster transitions into Detail page
      (`layoutId` per movie id)
- [ ] Empty state: never "No results" — swap in a discovery prompt
      (suggested genres / AI prompt / hidden-gem collection) per the
      design system's anti-pattern list
- [ ] Loading: skeleton grid matching final card geometry (no CLS)

---

## Phase 5 — Movie Detail (`src/components/detail/{DetailPage,CastGrid}.jsx`)

Reimagined, not Netflix-style.

- [ ] Massive cinematic backdrop with layered gradient (not flat scrim)
- [ ] Floating metadata card(s) over backdrop — glass elevation
- [ ] `CastGrid` → animated horizontal cast carousel, hover elevation
      per cast card
- [ ] Taste compatibility indicator (uses existing `preferencesSlice` /
      `ratings.jsx` data — no new data logic, just a visual read of
      data that already exists)
- [ ] Shared-element transition in from the poster that was clicked
      (continuity with Discover/Browse grids)
- [ ] Expandable sections (overview, cast, similar titles) — animate
      height via `grid-template-rows` trick or `AnimatePresence`, not
      raw `height` animation (perf)
- [ ] `RatingControl` gets the interaction-philosophy treatment: satisfying
      press feedback, no layout shift on state change

---

## Phase 6 — GPT Search (`src/components/gpt/{GptSearch,GptSearchBar,GptMovieSuggestions}.jsx`)

The centerpiece AI experience.

- [ ] `GptSearchBar`: conversational large input, focus state with
      accent glow
- [ ] Thinking state: purposeful loading animation (not a generic
      spinner) while the AI request is in flight
- [ ] Streaming text reveal for the AI response (if backend supports
      streaming — otherwise a progressive reveal simulating it)
- [ ] `GptMovieSuggestions`: results animate in with stagger, each
      suggestion card shows recommendation rationale/confidence
- [ ] Interactive follow-up suggestion chips after a response

**Note**: this phase is UI-only. The known `dangerouslyAllowBrowser`
API-key exposure issue in `GptSearchBar.jsx` is a separate backend
concern, not addressed here.

---

## Phase 7 — Shows (`src/components/shows/{Shows,ShowsSecondaryContainer}.jsx`)

Same treatment as Browse/Discover, applied to the Shows surface —
reuses primitives built in Phases 3–4 rather than inventing new
patterns.

- [ ] Apply the finalized card/row/filter components from Phases 3–4
- [ ] Confirm mood/genre chip treatment reads correctly for TV-specific
      metadata (seasons/episodes vs. runtime)

---

## Phase 8 — Anime (`src/components/anime/Anime.jsx`)

- [ ] Same shared primitives applied; confirm no anime-specific layout
      breaks (this is currently the thinnest of the content surfaces —
      likely the fastest phase)

---

## Phase 9 — Shared Components (`src/components/shared/{MovieCard,MovieList,RatingControl}.jsx`, `src/components/layout/Footer.jsx`)

Consolidation pass — by this point these have mostly been touched
piecemeal per-screen; this phase makes sure they're actually one
consistent component, not near-duplicates.

- [ ] Audit `MovieCard`/`MovieList` for one final canonical version used
      everywhere (Home/Browse/Discover/Shows/Anime)
- [ ] `RatingControl` final pass: consistent with Detail page version
- [ ] `Footer`: bring up to the same visual language (currently
      untouched by any earlier phase)

---

## Phase 10 — Polish

- [ ] Cross-screen consistency pass: one easing curve, one radius
      scale, one elevation system — actually verify, not just assume
- [ ] Full `prefers-reduced-motion` sweep across every phase's
      animations
- [ ] Full keyboard-nav sweep (tab order, focus rings, escape routes
      on every modal/sheet)
- [ ] Contrast audit on every glass/blur surface introduced
- [ ] Lighthouse pass: CLS, LCP, unnecessary re-renders, lazy-loading
      check on images/routes
- [ ] Light mode parity pass (secondary priority throughout, finalized
      here)
- [ ] Update `OVERVIEW.md` and `re-do.md` to reflect the new stack and
      design system

---

## Working rules for every phase

1. No phase starts until the previous one is approved.
2. After each phase: explain UX decisions + why they improve
   usability, accessibility considerations, performance considerations,
   interaction improvements — before moving on.
3. Litmus test before calling a phase done: would Linear/Arc/Vercel
   ship this, or does it still read as a movie-website component?
4. No architecture, routing, Redux, Firebase, or TMDB integration
   changes in any phase — visual/interaction layer only.
