import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { auth, projects as projectsApi } from '../../services/api'

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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    projectId: ''
  })
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()
  const { login } = useAuth()

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true)
        const response = await projectsApi.getAll()
        if (response.success) {
          setProjects(response.data)
        } else {
          setError('Erro ao carregar projetos')
        }
      } catch (err) {
        console.error('Error loading projects:', err)
        setError('Erro ao carregar projetos. Verifique sua conexão.')
      } finally {
        setProjectsLoading(false)
      }
    }
    
    loadProjects()
  }, [])

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

    // Basic validation
    if (!formData.name.trim()) {
      setError('O nome é obrigatório')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.')
      setIsLoading(false)
      return
    }

    if (!formData.projectId) {
      setError('Por favor, selecione um projeto')
      setIsLoading(false)
      return
    }

    try {
      // Send only the required fields to the backend
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        projectId: formData.projectId
      }

      const data = await auth.register(registrationData)

      if (data.success) {
        setSuccess('Conta criada com sucesso! Redirecionando para o login...')
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          projectId: ''
        })
        
        // If backend returns a token, automatically log the user in
        if (data.token) {
          try {
            login(data.token)
            setSuccess('Conta criada com sucesso! Redirecionando...')
            setTimeout(() => {
              navigate('/select-employee')
            }, 1500)
          } catch (loginError) {
            console.error('Auto-login error:', loginError)
            // Fall back to manual login redirect
            setTimeout(() => {
              navigate('/login')
            }, 2000)
          }
        } else {
          // Redirect to login page after successful registration
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('Registration error:', err)
      
      // Show user-friendly error messages
      if (err.message.includes('Network error')) {
        setError('Erro de conexão. Verifique se o servidor está funcionando.')
      } else if (err.message.includes('já existe') || err.message.includes('already exists')) {
        setError('Username ou email já estão em uso. Tente outros valores.')
      } else if (err.status === 400) {
        setError('Dados inválidos. Verifique os campos e tente novamente.')
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
            <h2>Criar Conta</h2>
            <p>Preencha os dados abaixo para criar sua conta no sistema</p>
          </div>
          
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading}
                  placeholder="Digite seu nome completo"
                  minLength="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading}
                  placeholder="Digite seu email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectId" className="form-label">
                  Projeto
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading || projectsLoading}
                >
                  <option value="">
                    {projectsLoading ? 'Carregando projetos...' : 'Selecione um projeto'}
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="Digite uma senha (mín. 6 caracteres)"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-field"
                  required
                  disabled={isLoading}
                  placeholder="Digite a senha novamente"
                  minLength="6"
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
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <div className="text-center">
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Já tem uma conta?
                </p>
                <Link 
                  to="/login" 
                  className="btn btn--secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Fazer login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default Register
