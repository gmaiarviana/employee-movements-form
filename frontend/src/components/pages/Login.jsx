import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'email') {
      setEmail(value)
    } else if (name === 'password') {
      setPassword(value)
    }
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Use the login function from AuthContext
      await login(email, password)

      setSuccess('Login realizado com sucesso! Redirecionando...')
      
      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Login error:', err)
      
      // Show user-friendly error messages
      if (err.message.includes('fetch')) {
        setError('Erro de conexão. Verifique se o servidor está funcionando.')
      } else if (err.message.includes('401') || err.message.includes('credenciais')) {
        setError('Credenciais inválidas. Verifique seu email e senha.')
      } else {
        setError(err.message || 'Erro inesperado. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = () => {
    setEmail('guilherme_viana@atlantico.com.br')
    setPassword('admin123')
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
            
            {/* Credenciais para experimentação */}
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              border: '1px solid #d1d5db'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#374151', 
                margin: '0 0 0.5rem 0',
                fontWeight: '600'
              }}>
                Credenciais para experimentação:
              </p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280', 
                margin: '0'
              }}>
                Email: <strong>guilherme_viana@atlantico.com.br</strong> | Senha: <strong>admin123</strong>
              </p>
            </div>
          </div>
          
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading}
                  placeholder="Digite seu email"
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
                  value={password}
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

              <button
                type="button"
                onClick={handleQuickLogin}
                className="btn btn--secondary"
                disabled={isLoading}
                style={{ 
                  width: '100%', 
                  marginBottom: '1rem',
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                Login Rápido (Admin)
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
