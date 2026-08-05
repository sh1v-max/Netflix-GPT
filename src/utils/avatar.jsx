import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebaseConfig'

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // matches storage.rules

// One fixed path per user (not one-file-per-upload) — re-uploading just
// overwrites, so there's no orphaned-file cleanup to worry about.
export const uploadCustomAvatar = async (uid, file) => {
  const avatarRef = ref(storage, `avatars/${uid}/photo`)
  await uploadBytes(avatarRef, file, { contentType: file.type })
  return getDownloadURL(avatarRef)
}

// 18 preset avatars via DiceBear's public avatar API (SVG, no auth, no
// hosting of our own needed) — fixed seeds so the same 18 render every
// time, not randomized per page load.
const PRESET_SEEDS = [
  'Nova', 'Orion', 'Luna', 'Atlas', 'Iris', 'Kai',
  'Sage', 'Rowan', 'Ember', 'Finn', 'Wren', 'Zara',
  'Milo', 'Vera', 'Leo', 'Nyx', 'Ash', 'Juno',
]

export const PRESET_AVATARS = PRESET_SEEDS.map(
  (seed) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
)
