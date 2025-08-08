import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const headerStyle = {
  backgroundColor: '#374151',
  color: '#ffffff',
  padding: '1rem 0',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
}

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  margin: '0',
  color: '#ffffff'
}

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login')
      }

      if (data.success && data.token) {
        // Store JWT token and user data in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email
        }))

        setSuccess('Login realizado com sucesso! Redirecionando...')
        
        // Redirect to home page after successful login
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Show user-friendly error messages
      if (err.message.includes('fetch')) {
        setError('Erro de conexão. Verifique se o servidor está funcionando.')
      } else if (err.message.includes('401') || err.message.includes('credenciais')) {
        setError('Credenciais inválidas. Verifique seu username e senha.')
      } else {
        setError(err.message || 'Erro inesperado. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header style={headerStyle}>
        <div className="container">
          <h1 style={titleStyle}>Sistema de Gestão de Funcionários</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <div className="text-center mb-lg">
            <h2>Login</h2>
            <p>Entre com suas credenciais para acessar o sistema</p>
          </div>
          
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading}
                  placeholder="Digite seu username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading}
                  placeholder="Digite sua senha"
                />
              </div>

              {error && (
                <div style={{ 
                  color: '#ef4444', 
                  backgroundColor: '#fef2f2', 
                  padding: '0.75rem', 
                  borderRadius: '0.375rem', 
                  marginBottom: '1rem',
                  border: '1px solid #fecaca'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ 
                  color: '#22c55e', 
                  backgroundColor: '#f0fdf4', 
                  padding: '0.75rem', 
                  borderRadius: '0.375rem', 
                  marginBottom: '1rem',
                  border: '1px solid #bbf7d0'
                }}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--large"
                disabled={isLoading}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="text-center">
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Não tem uma conta?
                </p>
                <Link 
                  to="/register" 
                  className="btn btn--secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Criar conta
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default Login
