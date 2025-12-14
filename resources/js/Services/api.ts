import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = '/api'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface Story {
  id: number
  title: string
  content: string
  user_id: number
  like_count: number
  comments_count: number
  created_at: string
  user?: {
    id: number
    name: string
  }
}

interface Comment {
  id: number
  content: string
  user_id: number
  story_id: number
  parent_id: number | null
  created_at: string
  user?: {
    id: number
    name: string
  }
}

interface User {
  id: number
  name: string
  email: string
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle 401 responses
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(data: LoginData) {
    const response = await this.api.post('/login', data)
    const { token, user } = response.data.data || response.data
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return { token, user }
  }

  async register(data: RegisterData) {
    const response = await this.api.post('/register', data)
    const { token, user } = response.data.data || response.data
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return { token, user }
  }

  async logout() {
    try {
      await this.api.post('/logout')
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async getMe(): Promise<User> {
    const response = await this.api.get('/me')
    return response.data.data || response.data
  }

  // Story endpoints
  async getStories(page = 1, filters?: any) {
    const response = await this.api.get('/stories', {
      params: { page, ...filters },
    })
    return response.data
  }

  async getStory(id: number): Promise<Story> {
    const response = await this.api.get(`/stories/${id}`)
    return response.data.data || response.data
  }

  async createStory(data: { title: string; content: string }) {
    const response = await this.api.post('/stories', data)
    return response.data.data || response.data
  }

  async updateStory(id: number, data: { title: string; content: string }) {
    const response = await this.api.put(`/stories/${id}`, data)
    return response.data.data || response.data
  }

  async deleteStory(id: number) {
    await this.api.delete(`/stories/${id}`)
  }

  // Comment endpoints
  async getComments(storyId: number) {
    const response = await this.api.get(`/stories/${storyId}/comments`)
    return response.data.data || response.data
  }

  async createComment(storyId: number, content: string, parentId?: number) {
    const response = await this.api.post(`/stories/${storyId}/comments`, {
      content,
      parent_id: parentId,
    })
    return response.data.data || response.data
  }

  async deleteComment(id: number) {
    await this.api.delete(`/comments/${id}`)
  }

  // Like endpoints
  async toggleLike(storyId: number) {
    const response = await this.api.post(`/stories/${storyId}/like`)
    return response.data.data || response.data
  }

  // Follower endpoints
  async follow(userId: number) {
    const response = await this.api.post(`/users/${userId}/follow`)
    return response.data.data || response.data
  }

  async unfollow(userId: number) {
    const response = await this.api.post(`/users/${userId}/unfollow`)
    return response.data.data || response.data
  }

  async getFollowers(userId: number) {
    const response = await this.api.get(`/users/${userId}/followers`)
    return response.data.data || response.data
  }

  async getFollowing(userId: number) {
    const response = await this.api.get(`/users/${userId}/following`)
    return response.data.data || response.data
  }

  // Notification endpoints
  async getNotifications() {
    const response = await this.api.get('/notifications')
    return response.data.data || response.data
  }

  async markNotificationAsRead(id: number) {
    const response = await this.api.put(`/notifications/${id}/read`)
    return response.data.data || response.data
  }
}

export default new ApiService()
