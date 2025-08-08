import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Summary = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()

  // Extrair parâmetros da URL
  const employeeId = searchParams.get('employeeId')
  const exitDate = searchParams.get('exitDate')
  const reason = searchParams.get('reason')

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Mapear valores para texto legível
  const reasonMap = {
    'interno-externo': 'Interno → Externo',
    'externo-interno': 'Externo → Interno',
    'interno-interno': 'Interno → Interno',
    'externo-externo': 'Externo → Externo',
    'saida-projeto': 'Saída do projeto'
  }

  // Carregar dados via API
  useEffect(() => {
    const loadSummaryData = async () => {
      if (!employeeId) {
        setError('ID do funcionário não encontrado.')
        setLoading(false)
        return
      }

      try {
        const token = getToken()
        const response = await fetch(`/api/employees/${employeeId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do funcionário')
        }
        
        const data = await response.json()
        
        // Verificar se resposta tem estrutura correta
        if (data.success && data.data) {
          setSummaryData(data.data)
        } else {
          setSummaryData(data)
        }
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setError('Erro ao carregar informações do resumo.')
        setLoading(false)
      }
    }

    loadSummaryData()
  }, [employeeId])

  // Função para lidar com a confirmação
  const handleConfirm = async () => {
    try {
      const token = getToken()
      
      // Preparar dados para API seguindo formato do backend
      const exitData = {
        employeeId: employeeId,
        projectId: 'PROJ001', // Projeto padrão por enquanto
        date: new Date().toISOString().split('T')[0], // Data atual
        reason: reason, // Motivo da saída (ex: "interno-externo")
        exitDate: exitDate // Data de saída informada no formulário
      }
      
      console.log('Salvando saída:', exitData)
      
      const response = await fetch('/api/movements/exits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exitData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Resultado da saída:', result)
      
      if (result.success) {
        alert(`✅ Saída de ${summaryData.employee.name} registrada com sucesso!`)
        navigate('/')
      } else {
        throw new Error(result.message || 'Erro ao salvar saída')
      }
      
    } catch (error) {
      console.error('Erro ao salvar saída:', error)
      alert(`❌ Erro ao salvar saída: ${error.message}`)
    }
  }

  // Função para lidar com o botão voltar
  const handleBack = () => {
    navigate(`/exit-form?employeeId=${employeeId}`)
  }

  const reasonText = reasonMap[reason] || reason || 'Motivo não informado'

  return (
    <>
      <header>
        <h1>Sistema de Saída de Funcionários</h1>
      </header>
      
      <main>
        <div className="container">
          <h2>Resumo da Saída de Funcionário</h2>
          
          <div id="summary-content" className="integrated-summary">
            {loading && <p>Carregando informações...</p>}
            
            {error && <p className="error-message">{error}</p>}
            
            {summaryData && (
              <div className="integrated-summary-card">
                <div className="summary-grid">
                  <div className="data-row">
                    <span className="data-label">Funcionário:</span>
                    <span className="data-value">{summaryData.employee.name}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">ID:</span>
                    <span className="data-value">{summaryData.employee.id}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Email:</span>
                    <span className="data-value">{summaryData.employee.email}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Cargo:</span>
                    <span className="data-value">{summaryData.employee.role}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Empresa:</span>
                    <span className="data-value">{summaryData.employee.company}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Projeto:</span>
                    <span className="data-value">{summaryData.project.name}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tipo de Projeto:</span>
                    <span className="data-value">{summaryData.project.type}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">SOW:</span>
                    <span className="data-value">{summaryData.project.sow}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Data de Saída:</span>
                    <span className="data-value">{formatDate(exitDate)}</span>
                  </div>
                  <div className="data-row highlight">
                    <span className="data-label">Motivo da Saída:</span>
                    <span className="data-value">{reasonText}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-buttons">
            <button 
              type="button" 
              id="back-button" 
              className="secondary-button"
              onClick={handleBack}
            >
              Voltar
            </button>
            <button 
              type="button" 
              id="confirm-button" 
              className="primary-button"
              onClick={handleConfirm}
            >
              Confirmar Saída
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default Summary
