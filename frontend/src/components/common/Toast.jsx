import React, { useEffect, useState } from 'react'

const Toast = ({ id, message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Fade in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, 4000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(id)
    }, 300) // Wait for exit animation
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          className: 'toast-success',
          bgColor: 'var(--color-success)',
          textColor: 'white'
        }
      case 'error':
        return {
          icon: '❌',
          className: 'toast-error',
          bgColor: 'var(--color-danger)',
          textColor: 'white'
        }
      case 'warning':
        return {
          icon: '⚠️',
          className: 'toast-warning',
          bgColor: 'var(--color-warning)',
          textColor: 'white'
        }
      case 'info':
        return {
          icon: 'ℹ️',
          className: 'toast-info',
          bgColor: 'var(--color-primary)',
          textColor: 'white'
        }
      default:
        return {
          icon: 'ℹ️',
          className: 'toast-info',
          bgColor: 'var(--color-primary)',
          textColor: 'white'
        }
    }
  }

  const config = getTypeConfig()

  return (
    <div 
      className={`toast ${config.className} ${isVisible ? 'toast-visible' : ''} ${isExiting ? 'toast-exit' : ''}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor
      }}
      onClick={handleDismiss}
    >
      <span className="toast-icon">{config.icon}</span>
      <span className="toast-message">{message}</span>
      <button 
        className="toast-close"
        onClick={handleDismiss}
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  )
}

const ToastContainer = ({ toasts, onDismissToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={onDismissToast}
        />
      ))}
    </div>
  )
}

export default ToastContainer
