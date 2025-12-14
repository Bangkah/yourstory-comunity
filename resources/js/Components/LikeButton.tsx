import { useState } from 'react'
import { useAuth } from '@/Context/AuthContext'
import api from '@/Services/api'

interface LikeButtonProps {
  storyId: number
  initialLikes: number
  onLikeToggled?: () => void
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  storyId,
  initialLikes,
  onLikeToggled,
}) => {
  const { isAuthenticated } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like stories')
      return
    }

    try {
      setLoading(true)
      const response = await api.toggleLike(storyId)
      
      // Update local state based on response
      if (response.liked !== undefined) {
        setHasLiked(response.liked)
        setLikes(response.likes_count || response.like_count || likes)
      } else {
        setHasLiked(!hasLiked)
        setLikes(hasLiked ? likes - 1 : likes + 1)
      }
      
      onLikeToggled?.()
    } catch (error: any) {
      console.error('Failed to toggle like:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
        hasLiked
          ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20'
      } disabled:opacity-50`}
    >
      <span className="text-xl">{hasLiked ? '❤️' : '🤍'}</span>
      <span className="font-semibold">{likes} Likes</span>
    </button>
  )
}

export default LikeButton
