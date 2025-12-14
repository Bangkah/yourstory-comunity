import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'
import api from '@/Services/api'

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

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        const response = await api.getStories()
        const storiesData = response.data || response
        setStories(Array.isArray(storiesData) ? storiesData : [])
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch stories:', err)
        setError(err.response?.data?.message || 'Failed to load stories')
        setStories([])
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  if (loading) {
    return (
      <Layout title="Stories">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Stories">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-300">
            No stories yet. Be the first to share!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/story/${story.id}`}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-40 rounded mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {story.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                {story.content}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{story.user?.name}</span>
                <span>{new Date(story.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-4 mt-4 pt-4 border-t dark:border-slate-700">
                <span className="text-sm">❤️ {story.like_count}</span>
                <span className="text-sm">💬 {story.comments_count}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
