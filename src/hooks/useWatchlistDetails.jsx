import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'

// Watchlist docs only store { mediaType, mediaId } (same minimal shape as
// ratings) — this fetches full details for each saved item so they can
// render as MovieCardHud tiles (the same persistent-data-readout tile every
// catalog page uses), and normalizes the response to the `genre_ids` shape
// MovieCardHud expects (TMDB's single-item endpoints return
// `genres: [{id, name}]`, not a flat id array). Also carries through
// `vote_average`/`release_date`/`first_air_date` for that tile's rating and
// year readout — a single-item response already includes these, no extra
// fetch needed.
const useWatchlistDetails = (watchlist) => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const docIds = Object.keys(watchlist || {})
  const key = docIds.sort().join(',')

  useEffect(() => {
    if (docIds.length === 0) {
      setItems([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const fetchOne = async (docId) => {
      const separatorIndex = docId.indexOf('_')
      const mediaType = docId.slice(0, separatorIndex)
      const mediaId = docId.slice(separatorIndex + 1)
      const res = await fetch(`${TMDB_BASE_URL}/${mediaType}/${mediaId}`, API_OPTIONS)
      if (!res.ok) return null
      const details = await res.json()
      return {
        id: details.id,
        media_type: mediaType,
        poster_path: details.poster_path,
        title: details.title,
        name: details.name,
        genre_ids: (details.genres || []).map((genre) => genre.id),
        vote_average: details.vote_average,
        release_date: details.release_date,
        first_air_date: details.first_air_date,
      }
    }

    Promise.all(docIds.map(fetchOne)).then((results) => {
      if (cancelled) return
      setItems(results.filter(Boolean))
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { items, isLoading }
}

export default useWatchlistDetails
