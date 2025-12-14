import Layout from '@/Layouts/Layout'

interface StoryProps {
  id: number
}

export default function Story({ id }: StoryProps) {
  return (
    <Layout title={`Story #${id}`}>
      <div className="max-w-3xl mx-auto">
        <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Story Title Here
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              By <span className="font-semibold">Author Name</span> • Published on December 14, 2024
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              This is the story content. It will be rendered here with full formatting and styling.
              Users can write beautiful, immersive stories that capture readers' attention.
            </p>
          </div>

          <div className="flex space-x-4 pt-8 border-t dark:border-slate-700">
            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <span>👍</span>
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <span>💬</span>
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <span>📤</span>
              <span>Share</span>
            </button>
          </div>
        </article>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6">
                <p className="font-semibold text-gray-900 dark:text-white">Commenter {i}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  This is a sample comment. Users can discuss the story here.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
