import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../design-system.css'

const ExitForm = () => {
  const [searchParams] = useSearchParams()
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exitDate, setExitDate] = useState('')
  const [exitReason, setExitReason] = useState('')
  const navigate = useNavigate()

  const employeeId = searchParams.get('employeeId')

  // Função para carregar informações do funcionário
  const loadEmployeeInfo = async () => {
    if (!employeeId) {
      setError('ID do funcionário não encontrado.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/employees/${employeeId}/details`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setEmployeeInfo(data)
      setError(null)
    } catch (error) {
      console.error('Erro ao carregar informações do funcionário:', error)
      setError('Não foi possível carregar as informações do funcionário. Tente novamente.')
      setEmployeeInfo(null)
    } finally {
      setLoading(false)
    }
  }

  // useEffect para carregar informações do funcionário quando o componente é montado
  useEffect(() => {
    loadEmployeeInfo()
  }, [employeeId])

  // Função para lidar com o envio do formulário
  const handleSubmit = (event) => {
    event.preventDefault()
    
    // Validar se todos os campos estão preenchidos
    if (!exitDate || !exitReason || !employeeId) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    // Construir URL para a página de summary com os parâmetros
    const summaryUrl = `/summary?employeeId=${encodeURIComponent(employeeId)}&exitDate=${encodeURIComponent(exitDate)}&reason=${encodeURIComponent(exitReason)}`
    
    // Redirecionar para a página de summary
    navigate(summaryUrl)
  }

  // Função para lidar com o clique do botão voltar
  const handleBack = () => {
    navigate('/select-employee')
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Sistema de Saída de Funcionários</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <h2>Dados da Saída de Funcionário</h2>
          
          <div id="employee-info" className="employee-info-display">
            {loading && <p>Carregando informações do funcionário...</p>}
            {error && (
              <div className="employee-display">
                <h3>Erro ao carregar informações</h3>
                <p className="error-message">{error}</p>
              </div>
            )}
            {!loading && !error && employeeInfo && (
              <div className="employee-display">
                <h3>Funcionário Selecionado</h3>
                <p><strong>ID:</strong> {employeeInfo.employee.id}</p>
                <p><strong>Nome:</strong> {employeeInfo.employee.name}</p>
                <p><strong>Email:</strong> {employeeInfo.employee.email}</p>
                <p><strong>Cargo:</strong> {employeeInfo.employee.role}</p>
                <p><strong>Empresa:</strong> {employeeInfo.employee.company}</p>
                <p><strong>Projeto Atual:</strong> {employeeInfo.project.name}</p>
                <p><strong>Tipo do Projeto:</strong> {employeeInfo.project.type}</p>
                <p><strong>SOW:</strong> {employeeInfo.project.sow}</p>
              </div>
            )}
          </div>
          
          <form id="exit-form" className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="exit-date" className="form-label">Data de Saída</label>
              <input 
                type="date" 
                id="exit-date" 
                name="exit-date" 
                required 
                className="form-field"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="exit-reason" className="form-label">Motivo da Saída</label>
              <select 
                id="exit-reason" 
                name="exit-reason" 
                required 
                className="form-field"
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
              >
                <option value="">Selecione o motivo da saída</option>
                <option value="interno-externo">Interno → Externo</option>
                <option value="externo-interno">Externo → Interno</option>
                <option value="interno-interno">Interno → Interno</option>
                <option value="externo-externo">Externo → Externo</option>
                <option value="saida-projeto">Saída do projeto</option>
              </select>
            </div>
            
            <div className="nav-buttons">
              <button 
                type="button" 
                id="back-button" 
                className="btn btn--secondary"
                onClick={handleBack}
              >
                Voltar
              </button>
              <button 
                type="submit" 
                id="continue-button" 
                className="btn btn--primary"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default ExitForm
