import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'

// Dedicated, larger pool just for the Movies console's ambient carousel —
// deliberately NOT the same `results` the grid renders (that read as a
// duplicate/bug, not a design choice) and deliberately more than one page
// of `usePopularMovies` (20 titles looped too tightly to feel like "a lot").
// Fetches several pages of TMDB's popular list in parallel, once, and
// keeps only the backdrop (not poster — no baked-in title text) paths.
const PAGE_COUNT = 5

const useMarqueeBackdrops = () => {
  const [backdrops, setBackdrops] = useState([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const pages = await Promise.all(
        Array.from({ length: PAGE_COUNT }, (_, i) =>
          fetch(
            `${TMDB_BASE_URL}/movie/popular?language=en-US&page=${i + 1}`,
            API_OPTIONS
          ).then((res) => res.json())
        )
      )
      if (cancelled) return
      const paths = pages
        .flatMap((page) => page.results || [])
        .filter((movie) => movie.backdrop_path)
        .map((movie) => movie.backdrop_path)
      setBackdrops(paths)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return backdrops
}

export default useMarqueeBackdrops
