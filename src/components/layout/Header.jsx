import { onAuthStateChanged, signOut } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { auth } from '../../utils/firebaseConfig'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANG } from '../../utils/constant'
import Logo from './Logo'
import { addUser, removeUser } from '../../store/userSlice'
import { changeLanguages } from '../../store/configSlice'
import usePreferencesSync from '../../hooks/usePreferencesSync'
import { User, LogOut, Sun, Moon, Bookmark, Globe, ChevronDown } from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((store) => store.user)
  const configLang = useSelector((store) => store.config.lang)
  // /home (AI search) and /movies (movie grid) are real, distinct routes —
  // no Redux view-state flag needed, the URL itself is the source of truth.
  const isGptActive = location.pathname === '/home'
  const [isScrolled, setIsScrolled] = useState(false)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('cinegraph-theme') || 'dark'
  )
  usePreferencesSync()

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
        const { uid, email, displayName, photoURL, metadata } = user
        dispatch(
          addUser({
            uid: uid,
            email: email,
            name: displayName,
            photo: photoURL,
            createdAt: metadata?.creationTime || null,
          })
        )
        // Only redirect away from the landing/login pages — don't yank the
        // user back to /home when this listener re-fires on /shows, etc.
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/home')
        }
      } else {
        dispatch(removeUser())
        // Only kick the user off protected pages — don't force a redirect
        // away from '/' or '/login' themselves, or landing there while
        // logged out (the normal case) bounces straight back to '/'.
        if (
          location.pathname === '/home' ||
          location.pathname === '/movies' ||
          location.pathname === '/shows' ||
          location.pathname === '/discover' ||
          location.pathname === '/anime' ||
          location.pathname === '/watchlist' ||
          location.pathname === '/profile' ||
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

  const currentLang =
    SUPPORTED_LANG.find((lang) => lang.identifier === configLang) || SUPPORTED_LANG[0]

  const handleLanguageChange = (identifier) => {
    dispatch(changeLanguages(identifier))
  }

  const navLinkClass = (active) =>
    `relative py-1 transition-colors ${
      active ? 'text-text-dark font-semibold' : 'text-text-dark-muted hover:text-text-dark'
    }`

  // "Home" is two different things depending on auth: for a logged-in
  // user it's /home (AI search) — there's no other "home", they're
  // redirected away from '/' entirely; for a logged-out visitor it's the
  // actual landing page at '/'. Match the Logo link's own behavior.
  const isHomeActive = user ? location.pathname === '/home' : location.pathname === '/'

  const NavUnderline = () => (
    <motion.span
      layoutId="header-nav-underline"
      className="absolute left-0 right-0 -bottom-1 h-0.5 bg-hud-cyan rounded-full"
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    />
  )

  return (
    <header
      className={`fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-500 ${
        isScrolled
          ? 'backdrop-blur-[--blur-cg-glass] bg-surface-glass border-b border-border-hairline py-1 md:py-1'
          : isGptActive
          ? 'bg-linear-to-b from-ink to-transparent py-3 md:py-4'
          : 'bg-ink py-3 md:py-4'
      }`}
    >
      <div className="flex items-center gap-4 md:gap-8">
        <Link to={user ? '/home' : '/'}>
          <Logo className="text-text-dark" />
        </Link>
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link to={user ? '/home' : '/'} className={navLinkClass(isHomeActive)}>
            Home
            {isHomeActive && <NavUnderline />}
          </Link>
          <Link to="/movies" className={navLinkClass(location.pathname === '/movies')}>
            Movies
            {location.pathname === '/movies' && <NavUnderline />}
          </Link>
          <Link to="/shows" className={navLinkClass(location.pathname === '/shows')}>
            TV Shows
            {location.pathname === '/shows' && <NavUnderline />}
          </Link>
          <Link to="/anime" className={navLinkClass(location.pathname === '/anime')}>
            Anime
            {location.pathname === '/anime' && <NavUnderline />}
          </Link>
          <Link to="/discover" className={navLinkClass(location.pathname === '/discover')}>
            Discover
            {location.pathname === '/discover' && <NavUnderline />}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="text-text-dark-muted hover:text-text-dark p-2 md:p-3 cursor-pointer transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
        {!user && location.pathname !== '/login' && (
          <Button
            asChild
            variant="default"
            size="default"
            className="px-4 bg-hud-cyan text-ink hover:bg-hud-cyan-strong"
          >
            <Link to="/login">Sign In</Link>
          </Button>
        )}
        {user && (
          <>
          {isGptActive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 text-text-dark-muted hover:text-text-dark text-xs md:text-sm px-2.5 py-2 md:py-2.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hud-cyan rounded-lg"
                  aria-label="Change search language"
                >
                  <Globe size={16} />
                  <span className="hidden sm:inline">{currentLang.name}</span>
                  <ChevronDown size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 backdrop-blur-[--blur-cg-glass] bg-surface-glass border-border-hairline rounded-panel shadow-cg-elevated p-1.5"
              >
                {SUPPORTED_LANG.map((lang) => (
                  <DropdownMenuItem
                    key={lang.identifier}
                    onClick={() => handleLanguageChange(lang.identifier)}
                    className={`py-2 pl-3 focus:bg-white/10 ${
                      lang.identifier === currentLang.identifier
                        ? 'text-hud-cyan-strong font-medium'
                        : 'text-text-dark focus:text-text-dark'
                    }`}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <span className="hidden sm:block w-px h-5 bg-border-hairline" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="flex items-center space-x-1 md:space-x-2 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hud-cyan"
                aria-label="Open profile menu"
              >
                <img
                  src={user.photo}
                  alt=""
                  className="w-6.5 h-6.5 md:w-8 md:h-8 rounded-lg object-cover border border-border-hairline transition-shadow hover:shadow-[0_0_0_2px_var(--color-hud-cyan-glow)]"
                />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-34 md:w-42 backdrop-blur-[--blur-cg-glass] bg-surface-glass border-border-hairline rounded-panel shadow-cg-elevated p-1.5"
            >
              <DropdownMenuItem asChild className="gap-2 py-2 pl-3 text-text-dark focus:bg-white/10 focus:text-text-dark">
                <Link to="/profile">
                  <User size={14} />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 py-2 pl-3 text-text-dark focus:bg-white/10 focus:text-text-dark">
                <Link to="/watchlist">
                  <Bookmark size={14} />
                  Watchlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="gap-2 py-2 pl-3 text-rust focus:bg-rust focus:text-text-dark"
              >
                <LogOut size={14} />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
