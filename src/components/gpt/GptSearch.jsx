import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import lang from '../../utils/languageConstant'
import { API_OPTIONS, GPT_PROXY_URL } from '../../utils/constant'
import { addGptMovieResult, clearGptConversation } from '../../store/gptSlice'
import { buildPersonalizedPrompt } from '../../utils/buildPersonalizedPrompt'
import useTasteProfile from '../../hooks/useTasteProfile'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'
import ForYouRows from './ForYouRows'

// Client-side mirror of the worker's own cap (gpt-proxy-worker/src/index.js)
// — trimmed here too so a long conversation doesn't grow the request body
// forever, not just relying on the worker to cut it down.
const MAX_HISTORY_TURNS = 5

// Owns the search lifecycle (query, in-flight state, errors) so both the
// input and the results area can react to the same "thinking" state and
// the results area's suggestion chips can trigger a real search.
const GptSearch = () => {
  const langKey = useSelector((store) => store.config.lang)
  const dispatch = useDispatch()
  const { profile, genreNameById } = useTasteProfile()
  const turns = useSelector((store) => store.gpt.turns)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const searchMovieTMDB = async (movie) => {
    const data = await fetch(
      'https://api.themoviedb.org/3/search/movie?query=' +
        encodeURIComponent(movie) +
        '&include_adult=false&language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    return json.results
  }

  // Each call is either the first search or a follow-up refinement
  // ("more like the third one but shorter") — prior turns ride along as
  // `history` so the worker can pass them to Gemini as real conversation
  // turns instead of the model only ever seeing one message at a time.
  const runSearch = async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setQuery(text)
    setError('')
    setIsSearching(true)
    try {
      const profileSummary = buildPersonalizedPrompt(profile, genreNameById)
      const history = turns
        .slice(-MAX_HISTORY_TURNS)
        .map((turn) => ({ query: turn.query, names: turn.movieNames }))
      const proxyResponse = await fetch(GPT_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, profileSummary, history }),
      })

      if (!proxyResponse.ok) throw new Error('No response from GPT')
      const { results } = await proxyResponse.json()
      const gptMovies = results.map((r) => r.name)
      const reasons = results.map((r) => r.reason)
      const promiseArray = gptMovies.map((movie) => searchMovieTMDB(movie))
      const tmdbResults = await Promise.all(promiseArray)
      dispatch(
        addGptMovieResult({
          query: trimmed,
          movieNames: gptMovies,
          movieResults: tmdbResults,
          reasons,
        })
      )
    } catch (err) {
      setError('Something went wrong with the search. Please try again.')
      console.error('GPT search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartOver = () => {
    dispatch(clearGptConversation())
    setQuery('')
    setError('')
  }

  // Idle = nothing to show yet, nothing in flight. Center the whole search
  // block (headline + bar + chips) as one full hero moment instead of
  // pinning the bar to the top and leaving a small disconnected block.
  const isIdle = !isSearching && !error && turns.length === 0

  return (
    <div className="relative w-full pt-20 md:pt-24 pb-12 px-2">
      <div
        className={
          isIdle ? 'flex flex-col items-center justify-center min-h-[75vh]' : ''
        }
      >
        <GptSearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={runSearch}
          isSearching={isSearching}
          isFollowUp={turns.length > 0}
          onStartOver={handleStartOver}
          placeholder={lang[langKey].gptSearchPlaceHolder}
          submitLabel={lang[langKey].search}
        />
        <GptMovieSuggestions isSearching={isSearching} error={error} />
      </div>
      {isIdle && <ForYouRows />}
    </div>
  )
}

export default GptSearch
