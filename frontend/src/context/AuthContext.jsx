import React, { createContext, useContext, useState, useEffect } from 'react'

// Create the AuthContext
const AuthContext = createContext()

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }
  return context
}

// JWT token validation helper function
const isValidToken = (token) => {
  if (!token) return false
  
  try {
    // Basic JWT structure validation (header.payload.signature)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Decode the payload to check expiration
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
}

// AuthContextProvider component
export const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('jwt_token')
        
        if (token && isValidToken(token)) {
          setIsAuthenticated(true)
        } else {
          // Remove invalid or expired token
          localStorage.removeItem('jwt_token')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('jwt_token')
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function - receives JWT and stores it in localStorage
  const login = (token) => {
    try {
      if (!token) {
        throw new Error('Token is required')
      }

      if (!isValidToken(token)) {
        throw new Error('Invalid token format')
      }

      localStorage.setItem('jwt_token', token)
      setIsAuthenticated(true)
      
      console.log('User logged in successfully')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout function - removes JWT from localStorage
  const logout = () => {
    try {
      localStorage.removeItem('jwt_token')
      setIsAuthenticated(false)
      
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get the current token
  const getToken = () => {
    return localStorage.getItem('jwt_token')
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
