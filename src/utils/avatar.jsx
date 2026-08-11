export const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // matches Cloudinary preset limit

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Uploads via Cloudinary's unsigned upload API (no backend needed — the
// preset itself scopes what's allowed). `public_id` is fixed per user so
// re-uploading overwrites in place instead of accumulating orphaned files.
export const uploadCustomAvatar = async (uid, file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('public_id', uid)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Cloudinary upload failed')
  const data = await res.json()
  return data.secure_url
}

// Preset avatars via DiceBear's public avatar API (SVG, no auth, no
// hosting of our own needed) — fixed seeds so the same set renders every
// time, not randomized per page load. Pulled from four different DiceBear
// styles (instead of one flat/abstract style) so there's real variety to
// pick from: `adventurer`/`lorelei` (illustrated people), `bottts` (robots),
// `pixel-art` (retro pixel characters).
const RAW_GROUPS = [
  { style: 'adventurer', label: 'Adventurer', seeds: ['Nova', 'Orion', 'Luna', 'Atlas', 'Iris', 'Kai'] },
  { style: 'lorelei', label: 'Lorelei', seeds: ['Sage', 'Rowan', 'Ember', 'Finn', 'Wren', 'Zara'] },
  { style: 'pixel-art', label: 'Pixel Art', seeds: ['Milo', 'Vera', 'Leo', 'Nyx', 'Ash', 'Juno'] },
  { style: 'bottts', label: 'Bottts', seeds: ['Rex', 'Byte', 'Echo', 'Volt', 'Ziggy', 'Chip'] },
]

// One section per style, each holding its own { url } list — AvatarPicker
// renders these as labeled groups so the picker reads as four distinct
// styles rather than one flat unlabeled grid.
export const PRESET_GROUPS = RAW_GROUPS.map(({ style, label, seeds }) => ({
  label,
  avatars: seeds.map((seed) => ({
    url: `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`,
  })),
}))

// Flat list of every preset URL — used where a single lookup/comparison
// is needed (e.g. checking if the current photo is a preset).
export const PRESET_AVATARS = PRESET_GROUPS.flatMap((g) => g.avatars.map((a) => a.url))
