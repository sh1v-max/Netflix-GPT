import React from 'react'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'
import { IMG_BACKGROUND } from '../utils/constant'

const GptSearch = () => {
  return (
    <div className="relative h-screen w-full">
      <div>
        <img
          src={IMG_BACKGROUND}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover -z-20 opacity-80"
        />
      </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-70 -z-10"></div>
      <div>
        <GptSearchBar />
        <GptMovieSuggestions />
      </div>
    </div>
  )

  // return (
  //   // this will have gpt search bar and movies suggestions
  //   <div>
  //      <div className="relative h-screen w-full flex items-center justify-center">
  //       <img
  //         src="https://assets.nflxext.com/ffe/siteui/vlv3/fc164b4b-f085-44ee-bb7f-ec7df8539eff/d23a1608-7d90-4da1-93d6-bae2fe60a69b/IN-en-20230814-popsignuptwoweeks-perspective_alpha_website_large.jpg"
  //         alt="Background"
  //         className="w-full h-full object-cover absolute inset-0 -z-10"
  //       />
  //     </div>
  //     <GptSearchBar />
  //     <GptMovieSuggestions />
  //   </div>
  // )
}

export default GptSearch
