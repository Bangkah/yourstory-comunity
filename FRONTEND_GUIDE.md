# Frontend Development Guide - Inertia.js + React

## 🚀 Quick Start

### Prerequisites
- PHP 8.4+
- Node.js 18+
- Composer & npm installed

### Installation

```bash
cd /home/atha/Dokumen/myproject/yourstoryComunity

# Install backend dependencies (if not done)
composer install --ignore-platform-req=ext-grpc

# Install frontend dependencies
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan db:seed

# Build frontend assets
npm run build

# Start development server
php artisan serve
npm run dev  # In another terminal
```

## 📁 Project Structure

```
resources/
├── js/
│   ├── app.tsx                 # Entry point
│   ├── Layouts/
│   │   └── Layout.tsx          # Base layout component
│   └── Pages/
│       ├── Home.tsx            # Home page
│       ├── Stories.tsx         # Stories list
│       ├── Login.tsx           # Login form
│       └── Register.tsx        # Registration form
└── css/
    └── app.css                 # Tailwind directives

routes/
├── api.php                     # API routes (Laravel)
└── web.php                     # Web routes (Inertia)
```

## 🔧 Development Workflow

### Running Development Server

```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Watch for changes and rebuild
npm run dev
```

### Creating New Pages

1. Create page component in `resources/js/Pages/MyPage.tsx`
2. Add route in `routes/web.php`
3. Use layout: `import Layout from '@/Layouts/Layout'`

Example page:

```tsx
import Layout from '@/Layouts/Layout'

export default function MyPage() {
  return (
    <Layout title="Page Title">
      <div>Your content here</div>
    </Layout>
  )
}
```

### Creating New Components

Create reusable components in `resources/js/Components/`:

```tsx
// resources/js/Components/Button.tsx
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  const classes = variant === 'primary' 
    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
  
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg ${classes}`}>
      {children}
    </button>
  )
}
```

## 🔌 Using Backend API

### With Inertia Form Helper

```tsx
import { useForm } from '@inertiajs/react'

export default function LoginForm() {
  const { data, setData, post, errors, processing } = useForm({
    email: '',
    password: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/api/login')
  }

  return (
    <form onSubmit={submit}>
      <input
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
        type="email"
      />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit" disabled={processing}>
        Login
      </button>
    </form>
  )
}
```

### With Axios

```tsx
import axios from 'axios'
import { useState } from 'react'

export default function StoryList() {
  const [stories, setStories] = useState([])

  const fetchStories = async () => {
    const response = await axios.get('/api/stories')
    setStories(response.data.data)
  }

  return (
    <div>
      {stories.map((story) => (
        <div key={story.id}>{story.title}</div>
      ))}
    </div>
  )
}
```

## 🎨 Styling with Tailwind CSS

Tailwind is pre-configured. Use utility classes:

```tsx
<div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-3xl font-bold text-gray-900 mb-4">Hello</h1>
  <p className="text-gray-600">This is styled with Tailwind</p>
</div>
```

## 📦 Available Scripts

```bash
# Development
npm run dev           # Start dev server with hot reload
npm run dev:wsl     # For WSL users

# Production
npm run build        # Build for production
npm run build:wsl   # Build for WSL

# Types
npm run ts:check    # Check TypeScript types
```

## 🧪 Testing (Coming Soon)

Frontend testing setup ready with:
- Jest for unit tests
- React Testing Library
- Cypress for E2E tests

## 🌐 API Integration

The backend API is available at `/api/`. All endpoints documented in:
- `BACKEND_DOCUMENTATION.md`
- `API_DOCUMENTATION.md`
- Postman collection: `postman_collection.json`

### Available Endpoints

```
Authentication:
POST   /api/login
POST   /api/logout
GET    /api/me

Stories:
GET    /api/stories
POST   /api/stories
GET    /api/stories/{id}
PUT    /api/stories/{id}
DELETE /api/stories/{id}

Comments:
POST   /api/stories/{id}/comments
GET    /api/stories/{id}/comments
PUT    /api/comments/{id}
DELETE /api/comments/{id}

And more... (See API docs)
```

## 🔐 Authentication

Use Laravel Sanctum tokens (already configured):

```tsx
// Tokens are automatically included in requests via Inertia
// No additional setup needed!
```

## 🚀 Deployment

### Production Build

```bash
npm run build
php artisan storage:link
```

### Docker

```bash
docker-compose up -d
docker-compose exec app npm run build
```

## 📚 Resources

- [Inertia.js Docs](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Laravel Documentation](https://laravel.com/docs)
- Backend API: See `BACKEND_DOCUMENTATION.md`

## ❓ Troubleshooting

### Port Already in Use

```bash
# Change dev server port
npm run dev -- --port 3001
```

### CSS Not Loading

```bash
# Rebuild assets
npm run build
php artisan view:cache
```

### Hot Reload Not Working

```bash
# Clear cache and rebuild
npm run dev -- --clearScreen=false
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

**Happy coding!** 🎉

For questions about backend API: See `BACKEND_DOCUMENTATION.md`
