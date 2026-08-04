# Cinegraph — Better UI/UX Implementation Plan

Companion to `DESIGN-SYSTEM.md` (the approved tokens/philosophy). This
file is the execution plan: phases, steps, and the real files each
phase touches. Work stops after each phase for approval before the
next one starts. Architecture, routing, Redux, Firebase, and TMDB
logic are **out of scope** everywhere below — visual/interaction layer
only.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Setup & Tooling ✅

- [x] Install `motion` (Framer Motion), `lucide-react`
- [x] Install shadcn/ui (Vite + Radix base, Nova preset), `cn()` utility
- [x] Map shadcn's CSS variable slots onto Cinegraph v2 tokens in
      `src/index.css`, both dark (default) and light
- [x] Rewrite `src/index.css` with the full v2 token set, kept alongside
      v1 tokens so nothing regressed mid-migration
- [x] Add base shadcn primitives: button, card, dialog, sheet, tabs,
      dropdown-menu, tooltip, skeleton, input
- [x] Sanity check: build/lint clean, no visual regression

**Bugs caught & fixed here**: an accent-color token collision (shadcn's
`--accent` slot silently repointed every `bg-accent`/`text-accent`
class app-wide from gold to a neutral gray); a missing
`eslint-plugin-react` meant `no-unused-vars` couldn't see `<motion.div>`
JSX usage, false-flagging every file using Motion.

---

## Phase 1 — Design System ✅ (approved)

Captured in `DESIGN-SYSTEM.md`.

---

## Phase 2 — Home & Header ✅

`Home.jsx`, `Header.jsx`, `Logo.jsx`, `ui/button.jsx` (added `glow`/`xl`
variants).

- [x] Aurora-gradient hero, Space Grotesk headline, indigo accent
- [x] Header: glass elevation on scroll, `layoutId` active-nav underline
- [x] Dropdown menu reskinned with `AnimatePresence`
- [x] Staggered entrance for hero content
- [x] `prefers-reduced-motion` respected via `useReducedMotion`
- [x] Removed the purely-decorative avatar photo-flip (no functional
      meaning — against the anti-pattern list)

---

## Phase 3 — Browse ✅

`MainContainer.jsx`, `VideoBackground.jsx`, `VideoTitle.jsx`,
`MovieCard.jsx`, `MovieList.jsx`.

- [x] `VideoTitle` floating glass metadata card, fade/slide-in on hero change
- [x] `MovieCard` hover lift + elevation instead of flat scale
- [x] Row stagger reveal, `aria-label`s added to previously-unlabeled
      scroll/mute buttons
- [x] `react-icons` → `lucide-react` throughout
- [x] `MainContainer` loading state uses the real shadcn `Skeleton`

**Bug caught**: shadcn's `--muted`/`--secondary`/`--accent` slots all
pointed at the same value as `--card`, making the new `Skeleton`
nearly invisible — added a distinct `--color-bg-muted` token.

---

## Phase 4 — Discover ✅

`FilterPanel.jsx`, `Discover.jsx`, `MovieCard.jsx` (`layoutId` prop).

- [x] Genre chips: spring press feedback, glow when active
- [x] Year/rating filters collapsed behind progressive disclosure
- [x] Illustrated empty states (search-empty, filters-too-narrow) with a
      real recovery action — never bare "No results"
- [x] Skeleton grid for initial load, small spinner for pagination
- [x] `layoutId={poster-${mediaType}-${id}}` on grid posters, ready for
      the Detail page shared-element transition

---

## Phase 5 — Movie Detail ✅

`DetailPage.jsx`, `CastGrid.jsx`, `RatingControl.jsx`, plus a small
additive change to `preferencesSlice.jsx` / `usePreferencesSync.jsx`.

- [x] Two-layer gradient backdrop, floating glass metadata card with
      poster thumbnail carrying the matching `layoutId`
- [x] **Taste compatibility indicator** — computed from real genre
      overlap in the user's own rating history, only renders when there's
      an actual signal (3+ other rated titles + genre overlap). Required
      retaining `genreIds` per rating in Redux (already written to
      Firestore, just not previously kept client-side) — additive, no new
      queries, `ratings`' existing shape untouched
- [x] Collapsible overview ("Read more"), animated cast carousel
- [x] `RatingControl` gets spring press-feedback (signal colors unchanged)

---

## Phase 6 — GPT Search ✅

`GptSearch.jsx`, `GptSearchBar.jsx`, `GptMovieSuggestions.jsx`, new
`ThinkingDots.jsx`.

- [x] Researched via `ui-ux-pro-max` (ux/style/gsap domains) — 3-dot
      typing indicator timing, "stream don't spinner" rule, AI-Native UI
      style tokens
- [x] Lifted search state up to `GptSearch` so bar + results share one
      "thinking" state
- [x] Large glass search hero, 4 example-prompt chips (idle only)
- [x] Three distinct result states: idle / thinking / error (previously
      one generic branch)
- [x] End-to-end verified via Playwright `--eval` click on a real chip

---

## Phase 7 — Shows ✅ (verification only, no changes needed)

Composes entirely from Phase 3/Phase 0 primitives already migrated —
nothing left in v1 styling to touch.

## Phase 8 — Anime ✅ (verification only, no changes needed)

Pure config wrapper around the already-redesigned `Discover`.

---

## Phase 9 — Shared Components ✅

`Footer.jsx`, `Login.jsx` (a real gap — never listed in any phase of
this plan originally, caught during the audit).

- [x] Audited `MovieCard`/`MovieList`/`RatingControl` — already
      consistent, nothing to reconcile
- [x] Footer: token migration (kept `react-icons`' `FaGithub` — this
      version of `lucide-react` ships UI icons only, no brand marks)
- [x] Login: full v2 pass — aurora branding panel, staggered entrance,
      gold→indigo, shadcn `Button`

---

## Post-Phase-9 bug fixes (found via user report + Playwright verification)

- [x] **`whileInView` reliability**: Home's feature sections and
      `MovieList`/`CastGrid` row reveals were gated behind scroll-triggered
      animation that could leave real content (including the final CTA)
      stuck at `opacity: 0` under certain timing conditions. Switched to
      guaranteed animate-on-mount everywhere content is load-bearing, not
      decorative.
- [x] **GPT search idle-state layout**: empty state was force-set to
      `45vh`, floating disconnected from the search bar. Restructured into
      one cohesive centered hero block; gave the AI-search view the
      `.aurora-gradient` background treatment it was missing.
- [x] **Sticky footer, systemic**: every page wrapper (`Browse`, `Shows`,
      `Home`, `Discover`, `DetailPage`) used `min-h-screen` on a plain
      block div, which doesn't pin the footer to the bottom — on any
      short-content page this left dead space trailing *after* the
      footer. Fixed with the standard `flex flex-col` + `<main
      className="flex-1">` sticky-footer pattern across all five wrappers.
      Verified precisely via `footer.getBoundingClientRect().bottom ===
      window.innerHeight` on short pages and `=== document.scrollHeight`
      on tall ones.

---

## Phase 10 — Polish ✅

- [x] Cross-screen consistency pass: confirmed one easing curve
      (identical `[0.16, 1, 0.3, 1]` across all 11 files that had it —
      extracted into shared `src/lib/motion.js`, removing the
      duplication rather than leaving it copy-pasted); confirmed radius
      scale had no stray one-off values; found and fixed real drift on
      the elevation scale — several small floating buttons (mute,
      scroll arrows, rating pills, language select) were using
      Tailwind's default `shadow-md`/`shadow-lg` instead of the design
      system's `shadow-cg-elevated` token
- [x] `prefers-reduced-motion`: wired globally via `MotionConfig
      reducedMotion="user"` in `App.jsx` instead of threading
      `useReducedMotion()` into 14 files individually — removed Home's
      now-redundant manual checks as dead code
- [x] Keyboard-nav sweep: migrated the header's hand-rolled profile
      dropdown (a `motion.div` trigger + bare `<li>` items — not
      focusable, no Escape, no ARIA) to shadcn's real `DropdownMenu`;
      fixed two `focus:outline-none` instances with no replacement ring
      (language select, mute button); confirmed no icon-only button
      lacks an `aria-label` and no `tabIndex` overrides exist anywhere
- [x] Contrast audit: glass surfaces over flat backgrounds have a large
      margin (5% white over near-black); glass surfaces over dynamic
      imagery (`VideoTitle`/`DetailPage` cards) are mitigated via
      existing gradient scrims but can't be mathematically guaranteed
      against arbitrary video frames — an honest, inherent limit of
      translucent glass over dynamic content, not something left unfixed
- [x] Perf pass: route-level code splitting (`Body.jsx`, `React.lazy`) —
      main bundle 1.35MB → 358KB; found and fixed a real CLS bug
      (`MovieCard`'s poster had `h-auto` with no reserved aspect ratio,
      collapsing to 0 height until each image loaded — the most-used
      component in the app); added missing `loading="lazy"` on 6
      below-the-fold images
- [x] Light mode parity: found the real gap was much bigger than
      expected — `--color-border-hairline`/`--color-surface-glass`
      (used in 13 components) had no light-mode override at all, and
      three "always cinematic dark" hero sections (Home, Login, the
      AI-search view) rendered with illegible dark-on-dark text due to
      a genuine CSS inheritance subtlety (`color` inherits *by computed
      value*, not live — re-pinning a custom property on a descendant
      doesn't retroactively fix an ancestor's already-resolved `color`).
      Fixed with a full v2-token light override block plus
      `.aurora-gradient`/`.theme-dark-scope` classes that re-pin tokens
      *and* set `color` directly. Verified via computed-style inspection
      (not just visual screenshots) on Home, Login, Browse, and Discover
- [x] Updated `OVERVIEW.md` (tech stack, design system section, routing)
      and `re-do.md` (pointed at this file, marked the code-splitting and
      accessibility items done)

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
