import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SummaryEntry = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [summaryData, setSummaryData] = useState(null)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()

  // Função para formatar data de YYYY-MM-DD para DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  // Função para mapear valores de radio button para texto legível
  const mapRadioValue = (value) => {
    return value === 'sim' ? 'Sim' : 'Não'
  }

  // useEffect para extrair parâmetros da URL
  useEffect(() => {
    try {
      const data = {}
      
      // Extrair todos os parâmetros da URL
      for (const [key, value] of searchParams) {
        data[key] = decodeURIComponent(value)
      }
      
      // Verificar se dados existem e se têm campos obrigatórios
      if (!data || Object.keys(data).length === 0 || !data.fullName) {
        setError('Dados do formulário não encontrados.')
        return
      }
      
      setSummaryData(data)
      setError(null)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar os dados do formulário.')
    }
  }, [searchParams])

  // Função para lidar com o botão voltar
  const handleBack = () => {
    navigate(-1) // Equivalente ao history.back()
  }

  // Função para lidar com a confirmação
  const handleConfirm = async () => {
    try {
      const token = getToken()
      
      // Gerar ID único para novo funcionário
      const newEmployeeId = `EMP${Date.now().toString().slice(-3)}`
      
      // PRIMEIRO: Criar o funcionário
      const employeeData = {
        id: newEmployeeId,
        name: summaryData.fullName,
        email: summaryData.email,
        role: summaryData.role,
        company: summaryData.instituteName,
        is_leader: false
      }
      
      console.log('Criando funcionário:', employeeData)
      
      const employeeResponse = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
      })
      
      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json()
        throw new Error(errorData.message || `Erro ao criar funcionário: ${employeeResponse.status}`)
      }
      
      const employeeResult = await employeeResponse.json()
      console.log('Funcionário criado:', employeeResult)
      
      // SEGUNDO: Criar a entrada
      const entryData = {
        employeeId: newEmployeeId,
        projectId: 'PROJ001', 
        date: new Date().toISOString().split('T')[0],
        role: summaryData.role,
        startDate: summaryData.startDate
      }
      
      console.log('Criando entrada:', entryData)
      
      const entryResponse = await fetch('/api/movements/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })
      
      const entryResult = await entryResponse.json()
      console.log('Resultado entrada:', entryResult)
      
      if (entryResult.success) {
        alert(`✅ Funcionário ${summaryData.fullName} cadastrado e entrada registrada com sucesso!`)
        navigate('/')
      } else {
        throw new Error(entryResult.message || 'Erro ao criar entrada')
      }
      
    } catch (error) {
      console.error('Erro:', error)
      alert(`❌ Erro: ${error.message}`)
    }
  }

  return (
    <>
      <header>
        <h1>Sistema de Movimentação de Contratos</h1>
      </header>
      
      <main>
        <div className="container">
          <h2>Resumo da Entrada de Funcionário</h2>
          
          <div id="summary-content" className="integrated-summary">
            {error ? (
              <p className="error-message">{error}</p>
            ) : !summaryData ? (
              <p>Carregando informações...</p>
            ) : (
              <>
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Nome Completo:</span>
                    <span className="data-value">{summaryData.fullName || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">CPF:</span>
                    <span className="data-value">{summaryData.cpf || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">E-mail:</span>
                    <span className="data-value">{summaryData.email || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Nome do Instituto:</span>
                    <span className="data-value">{summaryData.instituteName || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Realizou o treinamento de compliance da HP?</span>
                    <span className="data-value">{mapRadioValue(summaryData.complianceTraining)}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">É faturável?</span>
                    <span className="data-value">{mapRadioValue(summaryData.billable)}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Data de Início:</span>
                    <span className="data-value">{formatDate(summaryData.startDate)}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Papel do profissional:</span>
                    <span className="data-value">{summaryData.role || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Nome do projeto HP:</span>
                    <span className="data-value">{summaryData.projectName || ''}</span>
                  </div>
                </div>
              </>
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
              Confirmar Entrada
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default SummaryEntry
