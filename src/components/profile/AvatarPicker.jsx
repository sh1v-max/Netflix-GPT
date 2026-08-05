import React, { useRef, useState } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { MAX_AVATAR_BYTES, PRESET_AVATARS, uploadCustomAvatar } from '../../utils/avatar'

const AvatarPicker = ({ open, onOpenChange, uid, currentPhoto, onSelect }) => {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handlePresetClick = (url) => {
    onSelect(url)
    onOpenChange(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Image must be under 5MB.')
      return
    }

    setError('')
    setIsUploading(true)
    try {
      const url = await uploadCustomAvatar(uid, file)
      onSelect(url)
      onOpenChange(false)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Upload failed — please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ink-elevated border-border-hairline text-text-dark sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose an avatar</DialogTitle>
          <DialogDescription className="text-text-dark-muted">
            Pick a preset or upload your own photo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-6 gap-3 py-2">
          {PRESET_AVATARS.map((url) => {
            const isActive = url === currentPhoto
            return (
              <button
                key={url}
                type="button"
                onClick={() => handlePresetClick(url)}
                aria-label="Select avatar"
                className="relative rounded-full overflow-hidden border-2 border-border-hairline hover:border-accent2 focus:outline-none focus:ring-2 focus:ring-accent2 transition-colors cursor-pointer aspect-square"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Check size={16} className="text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="border-t border-border-hairline pt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-hairline hover:border-accent2 text-text-dark-muted hover:text-accent2 py-3 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Add your own
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AvatarPicker
