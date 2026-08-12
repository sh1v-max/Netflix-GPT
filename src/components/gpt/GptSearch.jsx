import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import lang from '../../utils/languageConstant'
import { GPT_PROXY_URL } from '../../utils/constant'
import { addGptMovieResult, clearGptConversation } from '../../store/gptSlice'
import { buildPersonalizedPrompt } from '../../utils/buildPersonalizedPrompt'
import { searchTitleTMDB } from '../../utils/searchTitleTMDB'
import useTasteProfile from '../../hooks/useTasteProfile'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'
import ForYouRows from './ForYouRows'
import HowItWorks from './HowItWorks'

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
      const mediaTypes = results.map((r) => (r.mediaType === 'tv' ? 'tv' : 'movie'))
      const reasons = results.map((r) => r.reason)
      const tmdbResults = await Promise.all(
        gptMovies.map((name, i) => searchTitleTMDB(name, mediaTypes[i]))
      )
      dispatch(
        addGptMovieResult({
          query: trimmed,
          movieNames: gptMovies,
          mediaTypes,
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
      {/* Only in idle state — once there's a real search or conversation
          on screen, an explainer for how the feature works is clutter,
          not help. */}
      {isIdle && <HowItWorks />}
      {/* Always rendered, not gated by isIdle — a persistent shell (see
          ForYouRows) so this section never appears/disappears depending
          on whether there's an active search. */}
      <ForYouRows />
    </div>
  )
}

export default GptSearch
