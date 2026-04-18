import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status

    if (status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/admin"
      return Promise.reject(new Error("Session expired. Please login again."))
    }

    if (status === 429) {
      return Promise.reject(new Error("Too many requests. Please try again later."))
    }

    if (err.response?.data?.detail) {
      if (Array.isArray(err.response.data.detail)) {
        const message = err.response.data.detail.map((e) => e.msg).join(", ")
        return Promise.reject(new Error(message))
      }
      return Promise.reject(new Error(err.response.data.detail))
    }

    if (err.message === "Network Error") {
      return Promise.reject(new Error("Server unreachable."))
    }

    return Promise.reject(err)
  }
)

export const submitContact = async (data) => {
  const res = await api.post("/contact", data)
  return res.data
}

export const signup = async (email, password) => {
  const res = await api.post("/auth/signup", { email, password })
  return res.data
}

export default api