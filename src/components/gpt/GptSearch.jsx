import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import lang from '../../utils/languageConstant'
import openai from '../../utils/openaiConfig'
import { API_OPTIONS, GPT_QUERY, GPT_MODEL } from '../../utils/constant'
import { addGptMovieResult } from '../../store/gptSlice'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'

// Owns the search lifecycle (query, in-flight state, errors) so both the
// input and the results area can react to the same "thinking" state and
// the results area's suggestion chips can trigger a real search.
const GptSearch = () => {
  const langKey = useSelector((store) => store.config.lang)
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const searchMovieTMDB = async (movie) => {
    const data = await fetch(
      'https://api.themoviedb.org/3/search/movie?query=' +
        movie +
        '&include_adult=false&language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    return json.results
  }

  const runSearch = async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setQuery(text)
    setError('')
    setIsSearching(true)
    try {
      const gptResults = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: GPT_QUERY },
          { role: 'user', content: trimmed },
        ],
      })

      if (!gptResults.choices) throw new Error('No response from GPT')
      const gptMovies = gptResults.choices?.[0].message?.content.split(',')
      const promiseArray = gptMovies.map((movie) => searchMovieTMDB(movie))
      const tmdbResults = await Promise.all(promiseArray)
      dispatch(addGptMovieResult({ movieNames: gptMovies, movieResults: tmdbResults }))
    } catch (err) {
      setError('Something went wrong with the search. Please try again.')
      console.error('GPT search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="relative h-full w-full">
      <div>
        <GptSearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={runSearch}
          isSearching={isSearching}
          placeholder={lang[langKey].gptSearchPlaceHolder}
          submitLabel={lang[langKey].search}
        />
        <GptMovieSuggestions isSearching={isSearching} error={error} />
      </div>
    </div>
  )
}

export default GptSearch
