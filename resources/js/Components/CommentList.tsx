import { useState } from 'react'
import { useAuth } from '@/Context/AuthContext'
import api from '@/Services/api'

interface Comment {
  id: number
  content: string
  user?: {
    id: number
    name: string
  }
  created_at: string
}

interface CommentListProps {
  storyId: number
  comments: Comment[]
  onCommentAdded: () => void
}

export const CommentList: React.FC<CommentListProps> = ({
  storyId,
  comments,
  onCommentAdded,
}) => {
  const { isAuthenticated, user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setLoading(true)
      await api.createComment(storyId, newComment)
      setNewComment('')
      onCommentAdded()
    } catch (error: any) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure?')) return

    try {
      await api.deleteComment(commentId)
      onCommentAdded()
    } catch (error: any) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {comment.user?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
                {user?.id === comment.user?.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentList
