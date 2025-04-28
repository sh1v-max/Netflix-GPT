import { onAuthStateChanged, signOut } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { auth } from '../utils/firebaseConfig'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LOGO, SUPPORTED_LANG } from '../utils/constant'
import { addUser, removeUser } from '../store/userSlice'
import { toggleGptSearchView } from '../store/gptSlice'
import { changeLanguages } from '../store/configSlice'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((store) => store.user)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isGptActive, setIsGptActive] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate('/')
      })
      .catch((error) => {
        navigate('/error')
        console.error('Sign out error:', error)
      })
    console.log('User signed out')
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
        navigate('/browse')
      } else {
        dispatch(removeUser())
        navigate('/')
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

  const handleGptSearchClick = () => {
    setIsGptActive(!isGptActive)
    dispatch(toggleGptSearchView())
  }

  const handleLanguageChange = (e) => {
    dispatch(changeLanguages(e.target.value))
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'backdrop-blur-md bg-black/20 py-1 md:py-1'
          : isGptActive
          ? 'bg-gradient-to-b from-black to-transparent py-3 md:py-4'
          : 'bg-black py-3 md:py-4'
      }`}
    >
      <img
        className="w-24 md:w-44 object-contain"
        src={LOGO}
        alt="Netflix Logo"
      />
      {user && (
        <div className="flex items-center gap-2 md:gap-4">
          {isGptActive && (
            <select
              className="appearance-none backdrop-blur-md bg-white/10 text-white border border-white/20 text-xs md:text-sm py-1 md:py-2 px-3 md:px-4 rounded-md cursor-pointer focus:outline-none transition-all duration-300 ease-in-out hover:bg-white/20 shadow-md"
              onChange={handleLanguageChange}
            >
              {SUPPORTED_LANG.map((lang) => (
                <option
                  key={lang.identifier}
                  value={lang.identifier}
                  className="bg-black bg-opacity-30 text-white" // Option styling
                >
                  {lang.name}
                </option>
              ))}
            </select>
          )}

          <button
            className="bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm py-1 md:py-2 px-2 md:px-5 rounded-md cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md"
            onClick={handleGptSearchClick}
          >
            {isGptActive ? 'Home' : 'StartGPT'}
          </button>

          <div className="relative">
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
                className="w-[26px] h-[26px] md:w-10 md:h-10 rounded-md object-cover border border-transparent cursor-pointer"
              />
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 w-34 md:w-42 backdrop-blur-lg bg-white/5 border border-white/20 rounded-xl shadow-lg py-2 z-500 mt-2">
                <ul>
                  <li className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md cursor-pointer transition-colors">
                    Profile
                  </li>
                  <li className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md cursor-pointer transition-colors">
                    Account
                  </li>
                  <li className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md cursor-pointer transition-colors">
                    Premium
                  </li>
                  <li className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md cursor-pointer transition-colors">
                    Settings
                  </li>
                  <li className="border-t border-white/20 my-2 mx-4"></li>
                  <button
                    className="px-4 w-full text-left py-2 text-sm text-red-500 hover:bg-red-600 hover:text-white rounded-md cursor-pointer transition-colors"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
