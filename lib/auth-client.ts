/**
 * Client-side authentication utilities
 */

const TOKEN_KEY = 'seomaster_auth_token'
const USER_KEY = 'seomaster_user'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  companyName?: string | null
}

/**
 * Save authentication token to localStorage
 */
export function saveAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Save user data to localStorage
 */
export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (error) {
        console.error('Error parsing user data:', error)
        return null
      }
    }
  }
  return null
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

/**
 * Logout user (clear all auth data)
 */
export function logout(): void {
  removeAuthToken()
  removeUser()
}

/**
 * Login user (save token and user data)
 */
export function loginUser(token: string, user: User): void {
  saveAuthToken(token)
  saveUser(user)
}
