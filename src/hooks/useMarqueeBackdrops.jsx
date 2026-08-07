import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { buildDiscoverParams } from './useDiscover'

// Dedicated, larger pool just for the console's ambient carousel —
// deliberately NOT the same `results` the grid renders (that read as a
// duplicate/bug, not a design choice) and deliberately more than one page
// of a single `/popular` page (20 titles looped too tightly to
// feel like "a lot"). Fetches several pages in parallel, once, and keeps
// only the backdrop (not poster — no baked-in title text) paths.
//
// Plain `/{mediaType}/popular` by default — but a page with a forced
// constraint (Anime: Animation genre + Japanese original language) needs
// the pool constrained too, or the ambient carousel shows random
// non-anime backdrops, which contradicts the page. When `baseGenres`/
// `originLanguage` are passed, this switches to `/discover/{mediaType}`
// with those constraints instead (same params `useMovieConsole` applies
// to the actual grid, via the shared `buildDiscoverParams`).
const PAGE_COUNT = 5

const useMarqueeBackdrops = (mediaType = 'movie', { baseGenres, originLanguage } = {}) => {
  const [backdrops, setBackdrops] = useState([])
  const isConstrained = Boolean(baseGenres?.length || originLanguage)
  // Stable primitive key for the effect's dep array — baseGenres is an
  // array literal from the caller, so comparing by identity would refetch
  // on every render; compare by content instead.
  const baseGenresKey = (baseGenres || []).join(',')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const pages = await Promise.all(
        Array.from({ length: PAGE_COUNT }, (_, i) => {
          const url = isConstrained
            ? `${TMDB_BASE_URL}/discover/${mediaType}?${buildDiscoverParams({ baseGenres, originLanguage, mediaType }, i + 1)}`
            : `${TMDB_BASE_URL}/${mediaType}/popular?language=en-US&page=${i + 1}`
          return fetch(url, API_OPTIONS).then((res) => res.json())
        })
      )
      if (cancelled) return
      const paths = pages
        .flatMap((page) => page.results || [])
        .filter((item) => item.backdrop_path)
        .map((item) => item.backdrop_path)
      setBackdrops(paths)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mediaType, isConstrained, baseGenresKey, originLanguage])

  return backdrops
}

export default useMarqueeBackdrops
