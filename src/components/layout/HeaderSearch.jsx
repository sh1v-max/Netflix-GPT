import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaTimes } from 'react-icons/fa'
import useMultiSearch from '../../hooks/useMultiSearch'
import { IMG_CDN_URL } from '../../utils/constant'

const HeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { results, isLoading } = useMultiSearch(query)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeSearch = () => {
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={containerRef}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Search titles"
          className="text-text-dark-muted hover:text-text-dark p-2 md:p-3 cursor-pointer transition-colors"
        >
          <FaSearch size={16} />
        </button>
      ) : (
        <div className="flex items-center bg-ink-elevated border border-white/10 rounded-[--radius-card] px-3 py-1.5">
          <FaSearch size={14} className="text-text-dark-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
            placeholder="Search titles..."
            className="bg-transparent text-text-dark text-sm px-2 py-0.5 focus:outline-none w-32 sm:w-48"
          />
          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="text-text-dark-muted hover:text-text-dark cursor-pointer"
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {isOpen && query.trim() && (
        <div className="absolute top-full right-0 mt-2 w-72 md:w-80 max-h-96 overflow-y-auto bg-ink-elevated border border-white/10 rounded-[--radius-card] shadow-lg z-50">
          {isLoading && (
            <p className="text-text-dark-muted text-sm px-4 py-3">Searching...</p>
          )}
          {!isLoading && results?.length === 0 && (
            <p className="text-text-dark-muted text-sm px-4 py-3">No matches found.</p>
          )}
          {!isLoading &&
            results?.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                to={`/title/${item.media_type}/${item.id}`}
                onClick={closeSearch}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
              >
                {item.poster_path ? (
                  <img
                    src={IMG_CDN_URL + item.poster_path}
                    alt=""
                    className="w-8 h-12 object-cover rounded-sm shrink-0"
                  />
                ) : (
                  <div className="w-8 h-12 bg-ink rounded-sm shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-text-dark text-sm font-medium truncate">
                    {item.title || item.name}
                  </p>
                  <p className="text-text-dark-muted text-xs">
                    {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                    {(item.release_date || item.first_air_date) &&
                      ` · ${(item.release_date || item.first_air_date).slice(0, 4)}`}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}

export default HeaderSearch
