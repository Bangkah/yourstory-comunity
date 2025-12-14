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

export default function Home() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.getStories(1, { limit: 3 })
        const storiesData = response.data || response
        setStories(Array.isArray(storiesData) ? storiesData.slice(0, 3) : [])
      } catch (err) {
        console.error('Failed to fetch featured stories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  return (
    <Layout title="Welcome">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Share Your Stories with the World
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Your Story Community is a platform for writers, storytellers, and creative minds to share their unique perspectives and connect with others.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/stories"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Explore Stories
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600 dark:text-gray-300">Discover amazing stories from around the world</p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-12 text-center">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '✨', title: 'Easy to Use', description: 'Simple and intuitive interface' },
            { icon: '🌍', title: 'Global Community', description: 'Connect with writers worldwide' },
            { icon: '🔒', title: 'Secure & Private', description: 'Your stories are protected' },
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Stories */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Featured Stories
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : stories.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No stories yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-32 rounded mb-4"></div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {story.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {story.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{story.user?.name}</span>
                  <span>❤️ {story.like_count}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
