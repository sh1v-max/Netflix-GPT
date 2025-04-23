import React from 'react'

const GptSearchBar = () => {
  return (
    <div>
      <form className=" p-2 m-30 border-black" action="">
        <input
          type="text"
          className=" p-4 m-4 border-black"
          placeholder="What do you like to watch today..."
        />
        <button className='p-2 m-2 border-black'>Search</button>
      </form>
    </div>
  )
}

export default GptSearchBar
