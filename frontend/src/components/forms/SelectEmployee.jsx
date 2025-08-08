import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const SelectEmployee = () => {
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()
  const navigate = useNavigate()

  // Função para carregar funcionários da equipe
  const loadEmployees = async () => {
    try {
      setLoading(true)
      const token = getToken()
      console.log('🔐 Token:', token ? 'Presente' : 'Ausente')
      
      const response = await fetch('/api/employees/EMP001/team-members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Data received:', data)
      
      if (data.success && data.data && data.data.teamMembers && data.data.teamMembers.length > 0) {
        setEmployees(data.data.teamMembers)
        console.log('✅ Funcionários carregados:', data.data.teamMembers.length)
      } else {
        setEmployees([])
        console.log('❌ Nenhum funcionário encontrado')
      }
      
    } catch (error) {
      console.error('💥 Erro ao carregar funcionários:', error)
      setError('Erro ao carregar funcionários. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // useEffect para carregar funcionários quando o componente é montado
  useEffect(() => {
    loadEmployees()
  }, [])

  // Função para lidar com a mudança na seleção
  const handleEmployeeSelection = (event) => {
    setSelectedEmployeeId(event.target.value)
  }

  // Função para lidar com o clique do botão continuar
  const handleContinue = () => {
    if (selectedEmployeeId) {
      navigate(`/exit-form?employeeId=${selectedEmployeeId}`)
    }
  }

  // Função para lidar com o clique do botão voltar
  const handleBack = () => {
    navigate('/')
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
          <h2>Selecionar Funcionário para Saída</h2>
          <p>Selecione o funcionário que está saindo:</p>
          
          <div className="form-group">
            <label htmlFor="employee-select" className="form-label">Funcionário:</label>
            <select 
              id="employee-select" 
              className="form-field"
              value={selectedEmployeeId}
              onChange={handleEmployeeSelection}
            >
              <option value="">Selecione um funcionário...</option>
              {loading && (
                <option value="" disabled>Carregando funcionários...</option>
              )}
              {error && (
                <option value="" disabled>{error}</option>
              )}
              {!loading && !error && employees.length === 0 && (
                <option value="" disabled>Nenhum membro da equipe encontrado</option>
              )}
              {!loading && !error && employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </option>
              ))}
            </select>
          </div>
          
          <div className="nav-buttons">
            <button 
              className="btn btn--secondary"
              onClick={handleBack}
            >
              Voltar
            </button>
            <button 
              className="btn btn--primary"
              disabled={!selectedEmployeeId}
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default SelectEmployee
