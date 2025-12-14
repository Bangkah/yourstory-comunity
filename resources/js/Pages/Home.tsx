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
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-3xl"></div>
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16 px-8">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg">
              ✨ Welcome to Your Story Community
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Connect with
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Storytellers Worldwide
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              The community hub for <a href="https://yourstory-orcin.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">YourStory</a> - where writers, storytellers, and creative minds share their unique perspectives and connect globally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/stories"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                🔍 Explore Stories
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 font-semibold transition-all transform hover:scale-105"
              >
                ✍️ Get Started
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative text-center space-y-4 p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-indigo-200 dark:border-slate-700">
              <div className="text-9xl mb-6 animate-bounce">📚</div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                Discover Amazing Stories
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                From writers around the world
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* YourStory Ecosystem */}
      <div className="mt-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Part of YourStory Ecosystem
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover our complete storytelling platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <a 
            href="https://yourstory-orcin.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
            <div className="relative">
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">📱</div>
              <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                YourStory App
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Our main storytelling platform - Create, edit, and publish your stories with powerful tools
              </p>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                Visit App <span className="ml-2">→</span>
              </span>
            </div>
          </a>
          <a 
            href="https://yourstory-portfolio.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
            <div className="relative">
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">🏢</div>
              <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                About YourStory
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Learn about our company, mission, and the team behind YourStory platform
              </p>
              <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center">
                Learn More <span className="ml-2">→</span>
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Join Our Community?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to connect and grow
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🤝', title: 'Connect & Share', description: 'Engage with fellow storytellers through comments and discussions', color: 'from-blue-400 to-cyan-400' },
            { icon: '🌍', title: 'Global Community', description: 'Connect with passionate writers from around the world', color: 'from-indigo-400 to-purple-400' },
            { icon: '💬', title: 'Get Feedback', description: 'Receive valuable feedback and support from the community', color: 'from-purple-400 to-pink-400' },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200 dark:border-slate-700"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
              <div className="relative">
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Stories */}
      <div className="mt-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Stories
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover the most popular stories from our community
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading amazing stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              No stories yet. Be the first!
            </p>
            <Link href="/register" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-slate-700"
              >
                <div className="relative h-48 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Featured</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {story.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {story.content}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {story.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{story.user?.name}</span>
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
