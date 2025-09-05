import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/api'

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Error validating token:', error);
    }
    return false
  }
}

// AuthContextProvider component
export const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token')
        
        if (token && isValidToken(token)) {
          setIsAuthenticated(true)
          
          // Decode the token payload to get user data
          try {
            const parts = token.split('.')
            const payload = JSON.parse(atob(parts[1]))
            setCurrentUser({
              username: payload.username || payload.email, // Use username do payload ou email como fallback
              email: payload.email || null
            })
          } catch (decodeError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error decoding token payload:', decodeError);
            }
            setCurrentUser(null)
          }
        } else {
          // Remove invalid or expired token
          localStorage.removeItem('token')
          setIsAuthenticated(false)
          setCurrentUser(null)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error initializing auth:', error);
        }
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setCurrentUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function - receives email and password, uses centralized API
  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios')
      }

      const data = await auth.login(email, password)

      if (!data.success || !data.token) {
        throw new Error(data.message || 'Resposta inválida do servidor: token ausente ou estrutura incorreta.')
      }

      const token = data.token

      if (!isValidToken(token)) {
        throw new Error('Token inválido recebido do servidor')
      }

      setIsAuthenticated(true)
      
      // Use user data from response and token payload
      try {
        const parts = token.split('.')
        const payload = JSON.parse(atob(parts[1]))
        
        // Combine data from response and token payload
        setCurrentUser({
          username: data.user?.employee?.name || payload.email, // Use employee name or email as fallback
          email: payload.email || data.user?.email || null,
          employee: data.user?.employee || null,
          isManager: payload.isManager || false
        })
      } catch (decodeError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error decoding token payload during login:', decodeError);
        }
        // Fallback to just the response data if token decode fails
        setCurrentUser({
          username: data.user?.employee?.name || data.user?.email,
          email: data.user?.email || null,
          employee: data.user?.employee || null,
          isManager: false
        })
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('User logged in successfully');
      }
    } catch (error) {
      console.error('Login error:', error.message || error);
      throw error
    }
  }

  // Logout function - removes JWT from localStorage
  const logout = () => {
    try {
      auth.logout()
      setIsAuthenticated(false)
      setCurrentUser(null)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('User logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error.message || error);
    }
  }

  // Get the current token
  const getToken = () => {
    return localStorage.getItem('token')
  }

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
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
