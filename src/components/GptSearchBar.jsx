import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import lang from '../utils/languageConstant'
import openai from '../utils/openai'
import { API_OPTIONS } from '../utils/constant'
import { addGptMovieResult } from '../utils/gptSlice'

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
    console.log(searchText.current.value)

    // make an api call to gpt api and get movies results
    const gptQuery =
      'Act as a Movie Recommendation system and suggest some movies for the query, only give me names of 20 movies, comma separated like the example result give ahead. For example: result1,result2,result3,result4,result5. Notice there is no space between result1 and result2, etc. They are only comma separated. You need to give result in same format'

    const gptResults = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: gptQuery },
        { role: 'user', content: searchText.current.value },
      ],
    })

    if (!gptResults.choices) return

    const gptMovies = gptResults.choices?.[0].message?.content.split(',')
    console.log(gptMovies)

    const PromiseArray =gptMovies.map((movie) => searchMovieTMDB(movie))
    //  this will return you five promises and not the result data
    //  [Promise, Promise, Promise, Promise, Promise]
    console.log(PromiseArray)

    const tmdbResults = await Promise.all(PromiseArray)
    console.log(tmdbResults)

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
