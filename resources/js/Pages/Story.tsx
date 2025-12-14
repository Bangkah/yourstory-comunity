import { useEffect, useState } from 'react'
import { usePage, Link } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'
import CommentList from '@/Components/CommentList'
import LikeButton from '@/Components/LikeButton'
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

interface Story {
  id: number
  title: string
  content: string
  user?: {
    id: number
    name: string
  }
  like_count: number
  comments_count: number
  created_at: string
}

interface PageProps extends Record<string, any> {
  storyId: number
}

export default function Story() {
  const page = usePage<PageProps>()
  const storyId = page.props.storyId
  const [story, setStory] = useState<Story | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStory = async () => {
    try {
      setLoading(true)
      const storyData = await api.getStory(storyId)
      setStory(storyData)

      // Fetch comments
      const commentsData = await api.getComments(storyId)
      setComments(Array.isArray(commentsData) ? commentsData : [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch story:', err)
      setError(err.response?.data?.message || 'Failed to load story')
      setStory(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStory()
  }, [storyId])

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading story...</p>
        </div>
      </Layout>
    )
  }

  if (error || !story) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              {error || 'Story not found'}
            </p>
            <Link href="/stories" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              ← Back to Stories
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/stories"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
        >
          <span>←</span>
          <span className="font-medium">Back to Stories</span>
        </Link>

        {/* Story Card */}
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400"></div>
          
          <div className="p-8 md:p-12">
            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {story.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">{story.user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(story.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              {story.title}
            </h1>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {story.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 pt-8 border-t border-gray-200 dark:border-slate-700">
              <LikeButton
                storyId={story.id}
                initialLikes={story.like_count}
                onLikeToggled={fetchStory}
              />
              <div className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium">
                <span className="text-2xl">💬</span>
                <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <CommentList
            storyId={story.id}
            comments={comments}
            onCommentAdded={fetchStory}
          />
        </div>
      </div>
    </Layout>
  )
}
