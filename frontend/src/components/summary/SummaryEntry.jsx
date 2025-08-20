import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { employees, movements } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { formatCPF, formatDate, formatRG } from '../../utils/formatters'

const SummaryEntry = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [summaryData, setSummaryData] = useState(null)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  // Função para formatar data de YYYY-MM-DD para DD/MM/YYYY
  const formatDateLocal = (dateString) => {
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
      if (!data || Object.keys(data).length === 0 || !data.selectedEmployeeId) {
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
      // Debug: verificar os dados disponíveis
      console.log('Dados disponíveis no summary:', summaryData)
      
      // Criar a entrada usando os dados do funcionário selecionado
      const entryData = {
        selectedEmployeeId: summaryData.selectedEmployeeId,
        selectedProjectId: summaryData.selectedProjectId, // Campo obrigatório para o backend
        employeeIdHP: summaryData.employeeIdHP || summaryData.employeeHpId || '',
        complianceTraining: summaryData.complianceTraining,
        billable: summaryData.billable,
        role: summaryData.role,
        startDate: summaryData.startDate,
        // Campos opcionais
        machineType: summaryData.machineType || null,
        bundleAws: summaryData.bundleAws || null,
        // Campos de experiência HP
        has_previous_hp_experience: summaryData.has_previous_hp_experience || false,
        previous_hp_account_id: summaryData.previous_hp_account_id || null,
        previous_hp_period_start: summaryData.previous_hp_period_start || null,
        previous_hp_period_end: summaryData.previous_hp_period_end || null
      }
      
      console.log('Criando entrada:', entryData)
      
      const entryResult = await movements.createEntry(entryData)
      console.log('Resultado entrada:', entryResult)
      
      if (entryResult.success) {
        showToast(`Entrada registrada com sucesso para ${summaryData.employeeName}!`, 'success')
        navigate('/')
      } else {
        throw new Error(entryResult.message || 'Erro ao criar entrada')
      }
      
    } catch (error) {
      console.error('Erro:', error)
      showToast(`Erro: ${error.message}`, 'error')
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
                <h3>Dados Corporativos</h3>
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">ID:</span>
                    <span className="data-value">{summaryData.selectedEmployeeId || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Nome Completo:</span>
                    <span className="data-value">{summaryData.employeeName || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">E-mail:</span>
                    <span className="data-value">{summaryData.employeeEmail || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Nome do Instituto:</span>
                    <span className="data-value">{summaryData.employeeCompany || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Cargo:</span>
                    <span className="data-value">{summaryData.employeeRole || ''}</span>
                  </div>
                </div>

                <h3>Dados Pessoais</h3>
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">CPF:</span>
                    <span className="data-value">{summaryData.employeeCpf ? formatCPF(summaryData.employeeCpf) : 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">RG:</span>
                    <span className="data-value">{summaryData.employeeRg ? formatRG(summaryData.employeeRg) : 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Data de Nascimento:</span>
                    <span className="data-value">{summaryData.employeeDataNascimento ? formatDate(summaryData.employeeDataNascimento) : 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Escolaridade:</span>
                    <span className="data-value">{summaryData.employeeNivelEscolaridade || 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Formação:</span>
                    <span className="data-value">{summaryData.employeeFormacao || 'Não informado'}</span>
                  </div>
                </div>

                <h3>Dados HP Específicos</h3>
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">ID HP:</span>
                    <span className="data-value">{summaryData.employeeHpId || summaryData.employeeIdHP || 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Tipo de Projeto:</span>
                    <span className="data-value">{summaryData.projectType || ''}</span>
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
                    <span className="data-label">Papel do profissional:</span>
                    <span className="data-value">{summaryData.role || ''}</span>
                  </div>
                </div>
                
                <div className="data-group">
                  <div className="data-item">
                    <span className="data-label">Data de Início:</span>
                    <span className="data-value">{formatDateLocal(summaryData.startDate)}</span>
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
