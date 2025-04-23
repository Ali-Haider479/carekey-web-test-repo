import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { getSession } from 'next-auth/react'

// Create an axios instance with a base URL
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json' // Default Content-Type
  }
})

// Request interceptor to add the token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get the session from next-auth
    const session = await getSession()
    console.log('REFRESH SESSION', session)
    // If no session or refresh token error, redirect to sign-in
    if (!session || session.error === 'RefreshTokenError') {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin'
      }
      throw new Error('No valid session')
    }

    // Add the access token to the Authorization header
    const token = session.user.accessToken
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

// Response interceptor to handle 401 errors and refresh tokens
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Check if the error is 401 and the request hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Mark as retried to prevent infinite loops

      try {
        // Get the current session
        const session = await getSession()
        console.log('REFRESH TOKEN INSIDE API CALL----', session)
        if (!session || session.error === 'RefreshTokenError') {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin'
          }
          throw new Error('No valid session')
        }

        // Call the refresh endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken: session.user.refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        )

        const { accessToken, refreshToken, expiresIn } = response.data

        console.log('REFRESH AFTER MAKE API CALL----', response.data)

        // Update the session with new tokens (next-auth will handle this via getSession)
        await getSession() // Trigger session refresh

        // Update the Authorization header and retry the original request
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`)

        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
