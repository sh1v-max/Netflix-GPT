import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { updateProfile, signOut } from 'firebase/auth'
import {
  Sparkles,
  Pencil,
  Check,
  X,
  Calendar,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Camera,
} from 'lucide-react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import MovieCard from '../shared/MovieCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '../../utils/firebaseConfig'
import { addUser } from '../../store/userSlice'
import useTasteProfile from '../../hooks/useTasteProfile'
import useWatchlistDetails from '../../hooks/useWatchlistDetails'
import SequentialBarChart from './SequentialBarChart'
import AvatarPicker from './AvatarPicker'
import { EASE } from '@/lib/motion'

const buildSummary = (profile, genreNameById) => {
  const topNames = profile.topGenres.map((g) => genreNameById[g.genreId]).filter(Boolean)

  if (topNames.length === 0) {
    return "Rate a few more titles and Cinegraph will start mapping your taste."
  }

  const parts = [`You tend to like — ${topNames.join(', ')}.`]
  if (profile.favoriteDecade) parts.push(`Your favorite era so far is the ${profile.favoriteDecade}s.`)
  return parts.join(' ')
}

const memberSince = (createdAt) => {
  if (!createdAt) return null
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const StatTile = ({ icon, label, value }) => (
  <div className="bg-ink-elevated rounded-panel border border-border-hairline p-4 md:p-5 flex items-center gap-3">
    <div className="rounded-lg bg-bg-muted p-2 text-accent2 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="font-display text-xl md:text-2xl font-semibold leading-none">{value}</p>
      <p className="text-text-dark-muted text-xs mt-1">{label}</p>
    </div>
  </div>
)

const Profile = () => {
  const user = useSelector((store) => store.user)
  const watchlist = useSelector((store) => store.preferences.watchlist)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { profile, genreNameById } = useTasteProfile()
  const { items: watchlistItems, isLoading: watchlistLoading } = useWatchlistDetails(watchlist)

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-ink text-text-dark flex flex-col">
        <Header />
        <main className="flex-1" />
        <Footer />
      </div>
    )
  }

  const handleSaveName = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed === user.name) {
      setNameInput(user.name || '')
      setIsEditingName(false)
      return
    }
    await updateProfile(auth.currentUser, { displayName: trimmed })
    dispatch(addUser({ ...user, name: trimmed }))
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setNameInput(user.name || '')
    setIsEditingName(false)
  }

  const handleAvatarSelect = async (photoURL) => {
    await updateProfile(auth.currentUser, { photoURL })
    dispatch(addUser({ ...user, photo: photoURL }))
  }

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigate('/'))
      .catch((error) => console.error('Sign out error:', error))
  }

  const genreChartData = profile.topGenres.map((g) => ({
    label: genreNameById[g.genreId] || `Genre ${g.genreId}`,
    value: g.score,
  }))
  const decadeChartData = profile.decades.map((d) => ({
    label: `${d.decade}s`,
    value: d.count,
  }))
  const joined = memberSince(user.createdAt)

  return (
    <div className="min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="pt-20 md:pt-28 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
          {/* Identity header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex items-center gap-4 md:gap-5 mb-8"
          >
            <button
              type="button"
              onClick={() => setIsAvatarPickerOpen(true)}
              aria-label="Change avatar"
              className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0 cursor-pointer"
            >
              <img
                src={user.photo}
                alt=""
                className="w-full h-full rounded-full object-cover border border-border-hairline shadow-cg-elevated"
              />
              <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
            <div className="min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    className="font-display text-xl md:text-2xl font-semibold bg-ink border border-border-hairline rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent2 min-w-0"
                  />
                  <button
                    onClick={handleSaveName}
                    aria-label="Save name"
                    className="text-accent2 hover:text-accent2-strong cursor-pointer p-1"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    aria-label="Cancel"
                    className="text-text-dark-muted hover:text-text-dark cursor-pointer p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-xl md:text-2xl font-semibold truncate">
                    {user.name || 'Cinegraph member'}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    aria-label="Edit name"
                    className="text-text-dark-muted hover:text-accent2 cursor-pointer p-1 shrink-0"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
              <p className="text-text-dark-muted text-sm truncate">{user.email}</p>
              {joined && (
                <p className="text-text-dark-muted text-xs mt-1 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Member since {joined}
                </p>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10"
          >
            <StatTile icon={<Sparkles size={16} />} label="Titles rated" value={profile.totalRated} />
            <StatTile icon={<ThumbsUp size={16} />} label="Liked" value={profile.likeCount} />
            <StatTile icon={<ThumbsDown size={16} />} label="Disliked" value={profile.dislikeCount} />
            <StatTile icon={<Bookmark size={16} />} label="Watchlist" value={Object.keys(watchlist).length} />
          </motion.div>

          {/* Taste graph */}
          <h2 className="font-display text-lg md:text-xl font-semibold mb-4">Your taste graph</h2>
          {profile.totalRated === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="bg-ink-elevated rounded-panel border border-border-hairline flex flex-col items-center text-center py-16 mb-10"
            >
              <div className="mb-4 rounded-full bg-bg-muted p-4 text-accent2">
                <Sparkles size={28} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Nothing to map yet</h3>
              <p className="text-text-dark-muted text-sm max-w-sm px-6">
                Like or dislike a few titles from any poster or detail page
                — your taste graph builds itself from there.
              </p>
            </motion.div>
          ) : (
            <div className="mb-10">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
                className="bg-ink-elevated rounded-panel border border-border-hairline p-5 md:p-6 mb-6"
              >
                <p className="text-sm md:text-base leading-relaxed">
                  {buildSummary(profile, genreNameById)}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {genreChartData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
                    className="bg-ink-elevated rounded-panel border border-border-hairline p-5 md:p-6"
                  >
                    <h3 className="font-display text-sm md:text-base font-semibold mb-4 uppercase tracking-wide text-text-dark-muted">
                      Top genres
                    </h3>
                    <SequentialBarChart data={genreChartData} />
                  </motion.div>
                )}

                {decadeChartData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
                    className="bg-ink-elevated rounded-panel border border-border-hairline p-5 md:p-6"
                  >
                    <h3 className="font-display text-sm md:text-base font-semibold mb-4 uppercase tracking-wide text-text-dark-muted">
                      By decade
                    </h3>
                    <SequentialBarChart data={decadeChartData} />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Watchlist preview */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg md:text-xl font-semibold">Watchlist</h2>
            {watchlistItems.length > 0 && (
              <Link to="/watchlist" className="text-accent2 text-sm font-medium hover:underline">
                View all
              </Link>
            )}
          </div>
          {watchlistLoading ? (
            <div className="flex gap-3 mb-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-24 md:w-32 aspect-2/3 rounded-lg shrink-0" />
              ))}
            </div>
          ) : watchlistItems.length === 0 ? (
            <p className="text-text-dark-muted text-sm mb-10">
              Nothing saved yet — bookmark a title from any poster or detail
              page to build your watchlist.
            </p>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.03 } } }}
              className="flex gap-3 overflow-x-auto no-scrollbar mb-10"
            >
              {watchlistItems.slice(0, 8).map((item) => (
                <motion.div
                  key={`${item.media_type}-${item.id}`}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="shrink-0"
                >
                  <MovieCard
                    id={item.id}
                    posterPath={item.poster_path}
                    title={item.title || item.name}
                    mediaType={item.media_type}
                    genreIds={item.genre_ids}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Account actions */}
          <div className="border-t border-border-hairline pt-6">
            <Button onClick={handleSignOut} variant="destructive" className="gap-2">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <AvatarPicker
        open={isAvatarPickerOpen}
        onOpenChange={setIsAvatarPickerOpen}
        uid={user.uid}
        currentPhoto={user.photo}
        onSelect={handleAvatarSelect}
      />
    </div>
  )
}

export default Profile
