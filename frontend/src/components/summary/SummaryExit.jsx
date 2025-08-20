import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { employees, movements } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const SummaryExit = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  // Extrair parâmetros da URL
  const employeeId = searchParams.get('employeeId')
  const exitDate = searchParams.get('exitDate')
  const reason = searchParams.get('reason')
  const hasReplacement = searchParams.get('hasReplacement')
  const machineType = searchParams.get('machineType')
  const machineReuse = searchParams.get('machineReuse') // Novo campo

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
        const data = await employees.getDetails(employeeId)
        
        // Verificar se resposta tem estrutura correta
        if (data.success && data.data) {
          setSummaryData(data.data)
        } else {
          setSummaryData(data)
        }
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setError(error.message || 'Erro ao carregar informações do resumo.')
        setLoading(false)
      }
    }

    loadSummaryData()
  }, [employeeId])

  // Função para lidar com a confirmação
  const handleConfirm = async () => {
    try {
      // Verificar se temos project_id real disponível
      if (!summaryData?.project?.id) {
        showToast('Funcionário não possui projeto ativo para saída.', 'error')
        return
      }

      // Preparar dados para API seguindo formato do backend
      const exitData = {
        employeeId: employeeId,
        projectId: summaryData.project.id, // ✅ Usar project_id real
        date: exitDate, // Data de saída informada no formulário
        reason: reason, // Motivo da saída (ex: "interno-externo")
        exitDate: exitDate, // Data de saída informada no formulário
        hasReplacement: hasReplacement, // 'sim' ou 'nao'
        machineType: machineType, // 'Máquina da empresa' ou 'Ambiente AWS'
        machineReuse: machineReuse // 'sim', 'nao' ou null
      }
      
      console.log('Salvando saída:', exitData)
      
      const result = await movements.createExit(exitData)
      console.log('Resultado da saída:', result)
      
      if (result.success) {
        showToast(`Saída de ${summaryData.employee.name} registrada com sucesso!`, 'success')
        navigate('/')
      } else {
        throw new Error(result.message || 'Erro ao salvar saída')
      }
      
    } catch (error) {
      console.error('Erro ao salvar saída:', error)
      showToast(`Erro ao salvar saída: ${error.message}`, 'error')
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
                <h3>Dados Corporativos</h3>
                <div className="summary-grid">
                  <div className="data-row">
                    <span className="data-label">ID:</span>
                    <span className="data-value">{summaryData.employee.id}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Nome Completo:</span>
                    <span className="data-value">{summaryData.employee.name}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">E-mail:</span>
                    <span className="data-value">{summaryData.employee.email}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Nome do Instituto:</span>
                    <span className="data-value">{summaryData.employee.company}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Cargo:</span>
                    <span className="data-value">{summaryData.employee.role}</span>
                  </div>
                </div>

                <h3>Dados do Projeto</h3>
                <div className="summary-grid">
                  <div className="data-row">
                    <span className="data-label">Nome do projeto:</span>
                    <span className="data-value">{summaryData.project.name}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tipo de projeto:</span>
                    <span className="data-value">{summaryData.project.type}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">SOW ou PT do projeto:</span>
                    <span className="data-value">{summaryData.project.sow}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Papel do profissional:</span>
                    <span className="data-value">{summaryData.employee.currentRole || 'Não informado'}</span>
                  </div>
                </div>

                <h3>Dados HP</h3>
                <div className="summary-grid">
                  <div className="data-row">
                    <span className="data-label">Employee ID HP:</span>
                    <span className="data-value">{summaryData.employee.hp_employee_id || 'Não informado'}</span>
                  </div>
                </div>

                <h3>Dados da Saída</h3>
                <div className="summary-grid">
                  <div className="data-row">
                    <span className="data-label">Data de Saída:</span>
                    <span className="data-value">{formatDate(exitDate)}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Haverá Replacement?</span>
                    <span className="data-value">{hasReplacement === 'sim' ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tipo de Infraestrutura:</span>
                    <span className="data-value">{machineType}</span>
                  </div>
                  {machineType === 'Máquina da empresa' && machineReuse && (
                    <div className="data-row">
                      <span className="data-label">Máquina será reutilizada?</span>
                      <span className="data-value">{machineReuse === 'sim' ? 'Sim' : 'Não'}</span>
                    </div>
                  )}
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

export default SummaryExit
