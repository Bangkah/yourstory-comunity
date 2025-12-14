import { PropsWithChildren } from 'react'
import { Link, router } from '@inertiajs/react'
import { useAuth } from '@/Context/AuthContext'

interface LayoutProps extends PropsWithChildren {
  title?: string
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.visit('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="text-3xl transition-transform group-hover:scale-110">📖</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Your Story
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                href="/stories" 
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                Stories
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {title && (
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 shadow-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Your Story Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
