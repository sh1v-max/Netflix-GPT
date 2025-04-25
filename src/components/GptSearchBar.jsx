import React from 'react'
import { useSelector} from  'react-redux'
import lang from '../utils/languageConstant';

const GptSearchBar = () => {

  const langKey =  useSelector(store => store.config.lang);
  
  return (
    <div className="flex justify-center items-center">
      <form className="flex w-full max-w-3xl bg-black/60 backdrop-blur-sm p-4 mt-40 rounded-lg shadow-lg">
        <input
          type="text"
          className="flex-grow px-5 py-3 rounded-l-lg text-white bg-neutral-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-300"
          placeholder={lang[langKey].gptSearchPlaceHolder}
        />
        <button
          className="px-6 py-3 bg-red-700 hover:bg-red-600 hover:shadow-[0_0_10px_rgba(239,68,68,0.6)] text-white font-semibold rounded-r-lg transition-all duration-300 "
        >
          {lang[langKey].search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
