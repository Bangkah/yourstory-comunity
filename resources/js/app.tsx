import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { AuthProvider } from './Context/AuthContext'

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Your Story'

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob<{ default: React.ComponentType }>('./Pages/**/*.tsx'),
    ),
  setup({ el, App, props }) {
    createRoot(el).render(
      <AuthProvider>
        <App {...props} />
      </AuthProvider>
    )
  },
  progress: {
    color: '#4F46E5',
  },
})
