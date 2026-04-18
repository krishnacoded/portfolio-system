import axios from 'axios'

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || '/api',
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ──────────────────────────────────────────────
// Request interceptor — attach JWT if present
// ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ──────────────────────────────────────────────
// Response interceptor — normalize errors
// ──────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {

    // 🔥 AUTO LOGOUT ON 401 (NEW ADDITION)
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/admin"
      return Promise.reject(new Error("Session expired. Please login again."))
    }

    // Rate limit
    if (err.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment.')
    }

    // FastAPI validation / custom errors
    if (err.response?.data?.detail) {
      if (Array.isArray(err.response.data.detail)) {
        // Pydantic validation errors
        const messages = err.response.data.detail
          .map((e) => e.msg)
          .join(', ')
        throw new Error(messages)
      }

      // Normal FastAPI error
      throw new Error(err.response.data.detail)
    }

    // Network error
    if (err.message === 'Network Error') {
      throw new Error('Backend not reachable. Is server running?')
    }

    throw err
  }
)

// ──────────────────────────────────────────────
// API methods
// ──────────────────────────────────────────────
export const submitContact = async (data) => {
  const res = await api.post('/contact', data)
  return res.data
}

export default api

// Admin Dashboard API
export const getContacts = () => api.get('/admin/contact')
export const getContactCount = () => api.get('/admin/contact/count')

//Signup API
export const signup = async (email, password) => {
  const res = await api.post('/auth/signup', {
    email,
    password,
  })
  return res.data
}