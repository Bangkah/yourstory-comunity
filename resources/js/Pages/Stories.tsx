import Layout from '@/Layouts/Layout'

export default function Stories() {
  return (
    <Layout title="Stories">
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Stories list coming soon...
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-40 rounded mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Story #{i}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">By Author Name</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
