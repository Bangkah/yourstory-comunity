import { useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
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

interface PageProps {
  params: {
    id: string
  }
}

export default function Story() {
  const page = usePage<PageProps>()
  const storyId = parseInt(page.props.params.id)
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
  }

  if (error || !story) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-800 dark:text-red-200">
              {error || 'Story not found'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={story.title}>
      <div className="max-w-3xl mx-auto">
        <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {story.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              By <span className="font-semibold">{story.user?.name}</span> •{' '}
              {new Date(story.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {story.content}
            </p>
          </div>

          <div className="flex space-x-4 pt-8 border-t dark:border-slate-700">
            <LikeButton
              storyId={story.id}
              initialLikes={story.like_count}
              onLikeToggled={fetchStory}
            />
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 rounded-lg">
              <span className="text-xl">💬</span>
              <span className="font-semibold">{comments.length} Comments</span>
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
