import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import lang from '../utils/languageConstant'
import openai from '../utils/openaiConfig'
import { API_OPTIONS, GPT_QUERY } from '../utils/constant'
import { addGptMovieResult } from '../store/gptSlice'

const GptSearchBar = () => {
  const langKey = useSelector((store) => store.config.lang)
  const searchText = useRef(null)
  const dispatch = useDispatch()

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
    const gptResults = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: GPT_QUERY },
        { role: 'user', content: searchText.current.value },
      ],
    })

    if (!gptResults.choices) return
    const gptMovies = gptResults.choices?.[0].message?.content.split(',')
    const PromiseArray =gptMovies.map((movie) => searchMovieTMDB(movie))
    const tmdbResults = await Promise.all(PromiseArray)
    dispatch(addGptMovieResult({movieNames: gptMovies, movieResults: tmdbResults}))
  }

  return (
    <div className="flex justify-center items-center">
      <form
        className="flex w-full max-w-3xl bg-black/60 backdrop-blur-sm p-4 mt-40 rounded-lg shadow-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={searchText}
          type="text"
          className="flex-grow px-5 py-3 rounded-l-lg text-white bg-neutral-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-300"
          placeholder={lang[langKey].gptSearchPlaceHolder}
        />
        <button
          className="px-6 py-3 bg-red-700 hover:bg-red-600 hover:shadow-[0_0_10px_rgba(239,68,68,0.6)] text-white font-semibold rounded-r-lg transition-all duration-300 "
          onClick={handleGptSearchClick}
        >
          {lang[langKey].search}
        </button>
      </form>
    </div>
  )
}

export default GptSearchBar
