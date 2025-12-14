import { FormEvent, useState } from 'react'
import { useForm } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'

export default function Login() {
  const { data, setData, post, errors, processing } = useForm({
    email: '',
    password: '',
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    post('/api/login')
  }

  return (
    <Layout title="Login">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Welcome Back
        </h2>

        <form onSubmit={submit} className="space-y-4">
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

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {processing ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
