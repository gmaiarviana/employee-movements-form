import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random() // Simple unique ID
    const newToast = {
      id,
      message,
      type
    }

    setToasts(currentToasts => [...currentToasts, newToast])

    // Auto-dismiss backup (in case component doesn't handle it)
    setTimeout(() => {
      dismissToast(id)
    }, 4500)

    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(currentToasts => 
      currentToasts.filter(toast => toast.id !== id)
    )
  }, [])

  const dismissAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value = {
    toasts,
    showToast,
    dismissToast,
    dismissAllToasts
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
