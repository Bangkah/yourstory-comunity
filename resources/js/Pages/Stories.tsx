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
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading stories...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            All Stories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover amazing stories from our community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Stories Yet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Be the first to share your amazing story!
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-slate-700"
              >
                <div className="relative h-48 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {story.content}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {story.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{story.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(story.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span className="font-semibold">{story.like_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span className="font-semibold">{story.comments_count}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
