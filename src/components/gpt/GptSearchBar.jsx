import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import lang from '../../utils/languageConstant'
import openai from '../../utils/openaiConfig'
import { API_OPTIONS, GPT_QUERY, GPT_MODEL } from '../../utils/constant'
import { addGptMovieResult } from '../../store/gptSlice'
import { ImSpinner8 } from 'react-icons/im'

const GptSearchBar = () => {
  const langKey = useSelector((store) => store.config.lang)
  const searchText = useRef(null)
  const dispatch = useDispatch()
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  //  search movie in TMDB
  const searchMovieTMDB = async (movie) => {
    const data = await fetch(
      "https://api.themoviedb.org/3/search/movie?query=" + movie+ "&include_adult=false&language=en-US&page=1",
      API_OPTIONS
    )
    const json = await data.json()
    return json.results
  }

  const handleGptSearchClick = async () => {
    if (!searchText.current.value.trim()) return
    setError('')
    setIsSearching(true)
    try {
      const gptResults = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: GPT_QUERY },
          { role: 'user', content: searchText.current.value },
        ],
      })

      if (!gptResults.choices) throw new Error('No response from GPT')
      const gptMovies = gptResults.choices?.[0].message?.content.split(',')
      const PromiseArray = gptMovies.map((movie) => searchMovieTMDB(movie))
      const tmdbResults = await Promise.all(PromiseArray)
      dispatch(addGptMovieResult({ movieNames: gptMovies, movieResults: tmdbResults }))
    } catch (err) {
      setError('Something went wrong with the search. Please try again.')
      console.error('GPT search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col items-center px-2 md:px-4">
      <form
        className="flex w-full max-w-3xl bg-black/60 backdrop-blur-sm p-3 md:p-4 mt-15 md:mt-25 rounded-lg shadow-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={searchText}
          type="text"
          disabled={isSearching}
          className="flex-grow px-3 py-2 md:px-5 md:py-3 text-xs md:text-base rounded-l-lg text-white bg-neutral-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-300 disabled:opacity-60"
          placeholder={lang[langKey].gptSearchPlaceHolder}
        />
        <button
          disabled={isSearching}
          className="flex items-center justify-center gap-2 px-3 py-2 md:px-6 md:py-3 bg-red-700 hover:bg-red-600 disabled:bg-red-800/70 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(239,68,68,0.6)] text-white font-semibold text-xs md:text-base rounded-r-lg transition-all duration-300"
          onClick={handleGptSearchClick}
        >
          {isSearching && <ImSpinner8 className="animate-spin" size={14} />}
          {lang[langKey].search}
        </button>
      </form>
      {error && (
        <p className="max-w-3xl w-full text-red-500 text-xs md:text-sm mt-2 px-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default GptSearchBar
