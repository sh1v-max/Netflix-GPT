import { onAuthStateChanged, signOut } from 'firebase/auth'
import React, { useEffect, useRef, useState } from 'react'
import { auth } from '../../utils/firebaseConfig'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { SUPPORTED_LANG } from '../../utils/constant'
import Logo from './Logo'
import { addUser, removeUser } from '../../store/userSlice'
import { toggleGptSearchView, setShowGptSearch } from '../../store/gptSlice'
import { changeLanguages } from '../../store/configSlice'
import {
  FaFilm,
  FaSearch,
  FaUser,
  FaUserCog,
  FaCog,
  FaSignOutAlt,
  FaStar,
  FaSun,
  FaMoon,
} from 'react-icons/fa'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((store) => store.user)
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch)
  // The GPT search toggle only has meaning on /browse — on /shows there's
  // nothing listening to this flag yet, so don't show the app as "in search
  // mode" there.
  const isGptActive = showGptSearch && location.pathname === '/browse'
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('cinegraph-theme') || 'dark'
  )
  const menuRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cinegraph-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate('/')
      })
      .catch((error) => {
        navigate('/error')
        console.error('Sign out error:', error)
      })
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName, photoURL } = user
        dispatch(
          addUser({
            uid: uid,
            email: email,
            name: displayName,
            photo: photoURL,
          })
        )
        // Only redirect away from the landing/login pages — don't yank the
        // user back to /browse when this listener re-fires on /shows, etc.
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/browse')
        }
      } else {
        dispatch(removeUser())
        // Only kick the user off protected pages — don't force a redirect
        // away from '/' or '/login' themselves, or landing there while
        // logged out (the normal case) bounces straight back to '/'.
        if (
          location.pathname === '/browse' ||
          location.pathname === '/shows' ||
          location.pathname === '/discover' ||
          location.pathname === '/anime' ||
          location.pathname.startsWith('/title/')
        ) {
          navigate('/')
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGptSearchClick = () => {
    if (location.pathname !== '/browse') {
      navigate('/browse')
      return
    }
    dispatch(toggleGptSearchView())
  }

  const handleLanguageChange = (e) => {
    dispatch(changeLanguages(e.target.value))
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-500 ${
        isScrolled
          ? 'backdrop-blur-md bg-ink/60 py-1 md:py-1'
          : isGptActive
          ? 'bg-linear-to-b from-ink to-transparent py-3 md:py-4'
          : 'bg-ink py-3 md:py-4'
      }`}
    >
      <div className="flex items-center gap-4 md:gap-8">
        <Link
          to={user ? '/browse' : '/'}
          onClick={() => user && dispatch(setShowGptSearch(true))}
        >
          <Logo className="text-text-dark" />
        </Link>
        {user && !isGptActive && (
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link
              to="/browse"
              onClick={() => dispatch(setShowGptSearch(true))}
              className={`transition-colors ${
                location.pathname === '/browse' && showGptSearch
                  ? 'text-text-dark font-semibold'
                  : 'text-text-dark-muted hover:text-text-dark'
              }`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => dispatch(setShowGptSearch(false))}
              className={`transition-colors ${
                location.pathname === '/browse' && !showGptSearch
                  ? 'text-text-dark font-semibold'
                  : 'text-text-dark-muted hover:text-text-dark'
              }`}
            >
              Movies
            </Link>
            <Link
              to="/shows"
              className={`transition-colors ${
                location.pathname === '/shows'
                  ? 'text-text-dark font-semibold'
                  : 'text-text-dark-muted hover:text-text-dark'
              }`}
            >
              TV Shows
            </Link>
            <Link
              to="/discover"
              className={`transition-colors ${
                location.pathname === '/discover'
                  ? 'text-text-dark font-semibold'
                  : 'text-text-dark-muted hover:text-text-dark'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/anime"
              className={`transition-colors ${
                location.pathname === '/anime'
                  ? 'text-text-dark font-semibold'
                  : 'text-text-dark-muted hover:text-text-dark'
              }`}
            >
              Anime
            </Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-2">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="text-text-dark-muted hover:text-text-dark p-2 md:p-3 cursor-pointer transition-colors"
        >
          {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
        {!user && location.pathname !== '/login' && (
          <Link
            to="/login"
            className="bg-accent hover:bg-accent-strong text-on-accent text-sm font-semibold px-4 py-2 rounded-[--radius-card] transition-colors"
          >
            Sign In
          </Link>
        )}
        {user && (
          <>
          {isGptActive && (
            <select
              className="appearance-none backdrop-blur-md bg-white/10 text-text-dark border border-white/20 text-xs md:text-sm py-1 md:py-1.5 px-3 md:pr-2 md:pl-5 rounded-[--radius-card] cursor-pointer focus:outline-none transition-all duration-300 hover:bg-white/20 shadow-md"
              onChange={handleLanguageChange}
            >
              {SUPPORTED_LANG.map((lang) => (
                <option
                  key={lang.identifier}
                  value={lang.identifier}
                  className="bg-ink-elevated text-text-dark"
                >
                  {lang.name}
                </option>
              ))}
            </select>
          )}

          <button
            className="relative group text-text-dark-muted hover:text-text-dark p-2 md:p-3 cursor-pointer transition-all duration-300"
            onClick={handleGptSearchClick}
            aria-label={isGptActive ? 'Browse movies' : 'Search with AI'}
          >
            {isGptActive ? <FaFilm size={20} /> : <FaSearch size={20} />}
            <span className="absolute left-1 right-1 bottom-0 h-1 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
          </button>

          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center space-x-1 md:space-x-2 cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              <img
                src={user.photo}
                alt="User Profile"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease',
                }}
                className="w-6.5 h-6.5 md:w-8 md:h-8 rounded-md object-cover border border-transparent cursor-pointer"
              />
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 w-34 md:w-42 backdrop-blur-lg bg-ink-elevated/90 border border-white/10 rounded-xl shadow-lg py-2 z-500 mt-2">
                <ul>
                  <li className="pl-5 md:pl-8 py-2 text-sm text-text-dark hover:bg-white/10 rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <FaUser size={14} />
                    <div className="border-r border-white/20 h-5"></div>
                    Profile
                  </li>
                  <li className="pl-5 md:pl-8 py-2 text-sm text-text-dark hover:bg-white/10 rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <FaUserCog size={14} />
                    <div className="border-r border-white/20 h-5"></div>
                    Account
                  </li>
                  <li className="pl-5 md:pl-8 py-2 text-sm text-accent hover:bg-white/10 rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <FaStar size={14} />
                    <div className="border-r border-white/20 h-5"></div>
                    Premium
                  </li>
                  <li className="pl-5 md:pl-8 py-2 text-sm text-text-dark hover:bg-white/10 rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <FaCog size={14} />
                    <div className="border-r border-white/20 h-5"></div>
                    Settings
                  </li>
                  <li className="border-t border-white/10 my-2 mx-4"></li>
                  <button
                    className="pl-5 md:pl-8 w-full text-left py-2 text-sm text-rust hover:bg-rust hover:text-text-dark rounded-md cursor-pointer transition-colors flex items-center gap-2"
                    onClick={handleSignOut}
                  >
                    <FaSignOutAlt size={14} />
                    <div className="border-r border-white/20 h-5"></div>
                    Sign Out
                  </button>
                </ul>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
