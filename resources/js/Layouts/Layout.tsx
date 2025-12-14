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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                📖 Your Story
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                Home
              </Link>
              <Link href="/stories" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                Stories
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
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
