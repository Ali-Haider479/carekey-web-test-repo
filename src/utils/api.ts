import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Create an axios instance with a base URL
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json' // Default Content-Type
  }
})

// Request interceptor to add the token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Fetch authUser and token from localStorage
    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    const token = authUser?.backendAccessToken

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers = config.headers || {}
      config.headers.set('Authorization', `Bearer ${token}`) // Use set() for type safety
    }

    return config
  },
  error => {
    // Handle request errors
    return Promise.reject(error)
  }
)

export default api
