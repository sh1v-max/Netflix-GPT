import { useRef } from 'react';
import MovieCard from './MovieCard'
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const MovieList = ({ title, movies }) => {
  const scrollRef = useRef(null);
  if (!movies || movies.length === 0) return null
  // console.log(movies)

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      if (container.scrollLeft <= 0) container.scrollLeft = maxScroll;
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth)
        container.scrollLeft = 0;
    }
  };
  
  return (
    <div className="relative px-6 mb-12">
      <h1 className="text-3xl py-4 text-white font-semibold">{title}</h1>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-[55%] -translate-y-1/2 bg-gray-700/50 hover:bg-gray-500/70 text-white p-3 rounded-full z-20 transition duration-300 backdrop-blur-sm shadow-lg"
      >
        <HiChevronLeft size={28} />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-scroll no-scrollbar scroll-smooth"
      >
        <div className="flex gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} posterPath={movie.poster_path} />
          ))}
        </div>
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-[55%] -translate-y-1/2 bg-gray-700/50 hover:bg-gray-500/70 text-white p-3 rounded-full z-20 transition duration-300 backdrop-blur-sm shadow-lg"
      >
        <HiChevronRight size={28} />
      </button>
    </div>
  );
}

export default MovieList
