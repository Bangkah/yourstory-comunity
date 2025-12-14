import { FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'

export default function Register() {
  const { data, setData, post, errors, processing } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    post('/api/register')
  }

  return (
    <Layout title="Create Account">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Join Our Community
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.currentTarget.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } dark:bg-slate-700 dark:text-white dark:border-slate-600`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.currentTarget.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } dark:bg-slate-700 dark:text-white dark:border-slate-600`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.currentTarget.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } dark:bg-slate-700 dark:text-white dark:border-slate-600`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.currentTarget.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
              } dark:bg-slate-700 dark:text-white dark:border-slate-600`}
              placeholder="••••••••"
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {processing ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
