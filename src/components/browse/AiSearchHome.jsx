import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import GptSearch from '../gpt/GptSearch'

// The logged-in "home base" — AI search first, per the original
// search-first-landing design decision. Lives at its own /home route
// (previously a Redux view-state toggle sharing /browse with the movie
// grid, which meant "Home" and "Movies" pointed at the same URL).
const AiSearchHome = () => (
  <div className="relative w-screen min-h-screen flex flex-col">
    <Header />
    <div className="flex-1">
      <div className="relative w-full h-full">
        <div className="fixed inset-0 -z-40 aurora-gradient" />
        <div className="relative h-full theme-dark-scope">
          <GptSearch />
        </div>
      </div>
    </div>
    <Footer />
  </div>
)

export default AiSearchHome
