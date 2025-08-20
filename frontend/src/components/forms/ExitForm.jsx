import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { employees } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const ExitForm = () => {
  const [searchParams] = useSearchParams()
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exitDate, setExitDate] = useState('')
  const [exitReason, setExitReason] = useState('')
  const [hasReplacement, setHasReplacement] = useState('')
  const [machineType, setMachineType] = useState('')
  const [machineReuse, setMachineReuse] = useState('') // Novo estado
  const [entryDate, setEntryDate] = useState('')
  const navigate = useNavigate()
  const { showToast } = useToast()

  const employeeId = searchParams.get('employeeId')

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Função para retornar valor seguro com fallback
  const getFieldValue = (value, fallback = 'Não informado') => {
    if (value === null || value === undefined || value === '') {
      return fallback
    }
    return value
  }

  // Função para carregar informações do funcionário
  const loadEmployeeInfo = async () => {
    if (!employeeId) {
      setError('ID do funcionário não encontrado.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await employees.getDetails(employeeId)
      
      // Verificar se resposta tem estrutura correta
      if (data.success && data.data) {
        setEmployeeInfo(data.data)
        
        // Extrair data de entrada se existir com safe access
        if (data.data?.project?.startDate) {
          setEntryDate(data.data.project.startDate)
        }
      } else {
        setEmployeeInfo(data)
      }
      setError(null)
    } catch (error) {
      console.error('Erro ao carregar informações do funcionário:', error)
      setError(error.message || 'Não foi possível carregar as informações do funcionário. Tente novamente.')
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
    
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!exitDate || !exitReason || !hasReplacement || !machineType) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'warning')
      return
    }
    
    // Validação condicional: se máquina da empresa, machineReuse é obrigatório
    if (machineType === 'Máquina da empresa' && !machineReuse) {
      showToast('Por favor, informe se a máquina da empresa será reutilizada.', 'warning')
      return
    }
    
    // Validação de data antes de enviar
    if (entryDate && exitDate && new Date(exitDate) <= new Date(entryDate)) {
      showToast(`Data de saída deve ser posterior à data de entrada (${formatDate(entryDate)}).`, 'warning')
      return
    }
    
    // Construir URL para a página de summary com os parâmetros
    const summaryUrl = `/summary?employeeId=${encodeURIComponent(employeeId)}&exitDate=${encodeURIComponent(exitDate)}&reason=${encodeURIComponent(exitReason)}&hasReplacement=${encodeURIComponent(hasReplacement)}&machineType=${encodeURIComponent(machineType)}&machineReuse=${encodeURIComponent(machineReuse)}`
    
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
              <>
                {/* Seção de Dados Corporativos */}
                <div className="employee-display">
                  <h3>Dados Corporativos</h3>
                  <p><strong>ID:</strong> {getFieldValue(employeeInfo.employee?.id)}</p>
                  <p><strong>Nome Completo:</strong> {getFieldValue(employeeInfo.employee?.name)}</p>
                  <p><strong>E-mail:</strong> {getFieldValue(employeeInfo.employee?.email)}</p>
                  <p><strong>Nome do Instituto:</strong> {getFieldValue(employeeInfo.employee?.company)}</p>
                  <p><strong>Cargo:</strong> {getFieldValue(employeeInfo.employee?.role)}</p>
                </div>

                {/* Seção de Dados do Projeto */}
                <div className="employee-display">
                  <h3>Dados do Projeto</h3>
                  <p><strong>Nome do projeto:</strong> {getFieldValue(employeeInfo.project?.name)}</p>
                  <p><strong>Tipo de projeto:</strong> {getFieldValue(employeeInfo.project?.type)}</p>
                  <p><strong>SOW ou PT do projeto:</strong> {getFieldValue(employeeInfo.project?.sow)}</p>
                  <p><strong>Papel do profissional:</strong> {getFieldValue(employeeInfo.employee?.currentRole || 'Não informado')}</p>
                </div>

                {/* Seção de Dados HP */}
                <div className="employee-display">
                  <h3>Dados HP</h3>
                  <p><strong>Employee ID HP:</strong> {getFieldValue(employeeInfo.employee?.hp_employee_id)}</p>
                </div>
                
                {/* Seção de Dados Pessoais */}
                <div className="employee-display">
                  <h4>Dados Pessoais</h4>
                  <p><strong>CPF:</strong> {getFieldValue(employeeInfo.employee?.cpf)}</p>
                  <p><strong>RG:</strong> {getFieldValue(employeeInfo.employee?.rg)}</p>
                  <p><strong>Data de Nascimento:</strong> {getFieldValue(employeeInfo.employee?.data_nascimento ? formatDate(employeeInfo.employee.data_nascimento) : null)}</p>
                  <p><strong>Escolaridade:</strong> {getFieldValue(employeeInfo.employee?.nivel_escolaridade)}</p>
                  <p><strong>Formação:</strong> {getFieldValue(employeeInfo.employee?.formacao)}</p>
                </div>
                
                {/* Informações da Alocação */}
                {entryDate && (
                  <div className="employee-display">
                    <h4>Informações da Alocação</h4>
                    <p><strong>Data de Entrada:</strong> {formatDate(entryDate)}</p>
                    <p><em>A data de saída deve ser posterior à data de entrada.</em></p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <form id="exit-form" className="form" onSubmit={handleSubmit}>
            {/* 1. Data de Saída */}
            <div className="form-group">
              <label htmlFor="exit-date" className="form-label">Data de Saída *</label>
              <input 
                type="date" 
                id="exit-date" 
                name="exit-date" 
                required 
                className="form-field"
                value={exitDate}
                min={entryDate}
                onChange={(e) => setExitDate(e.target.value)}
              />
            </div>

            {/* 2. Haverá Replacement? */}
            <div className="form-group">
              <label className="form-label">Haverá Replacement? *</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="replacement-yes" 
                    name="replacement" 
                    value="sim" 
                    required
                    checked={hasReplacement === 'sim'}
                    onChange={(e) => setHasReplacement(e.target.value)}
                  />
                  <label htmlFor="replacement-yes">Sim</label>
                </div>
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="replacement-no" 
                    name="replacement" 
                    value="nao" 
                    required
                    checked={hasReplacement === 'nao'}
                    onChange={(e) => setHasReplacement(e.target.value)}
                  />
                  <label htmlFor="replacement-no">Não</label>
                </div>
              </div>
            </div>

            {/* 3. Máquina da empresa ou Ambiente AWS? */}
            <div className="form-group">
              <label className="form-label">O Profissional utilizava máquina da empresa ou Ambiente AWS? *</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="machine-company" 
                    name="machine-type" 
                    value="Máquina da empresa" 
                    required
                    checked={machineType === 'Máquina da empresa'}
                    onChange={(e) => {
                      setMachineType(e.target.value)
                      // Limpar machineReuse quando não for máquina da empresa
                      if (e.target.value !== 'Máquina da empresa') {
                        setMachineReuse('')
                      }
                    }}
                  />
                  <label htmlFor="machine-company">Máquina da empresa</label>
                </div>
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="machine-aws" 
                    name="machine-type" 
                    value="Ambiente AWS" 
                    required
                    checked={machineType === 'Ambiente AWS'}
                    onChange={(e) => {
                      setMachineType(e.target.value)
                      // Limpar machineReuse quando não for máquina da empresa
                      if (e.target.value !== 'Máquina da empresa') {
                        setMachineReuse('')
                      }
                    }}
                  />
                  <label htmlFor="machine-aws">Ambiente AWS</label>
                </div>
              </div>
            </div>

            {/* 3.1. Campo condicional: A Máquina da empresa será reutilizada? */}
            {machineType === 'Máquina da empresa' && (
              <div className="form-group">
                <label className="form-label">A Máquina da empresa será reutilizada? *</label>
                <div className="radio-group">
                  <div className="radio-item">
                    <input 
                      type="radio" 
                      id="machine-reuse-yes" 
                      name="machine-reuse" 
                      value="sim" 
                      required
                      checked={machineReuse === 'sim'}
                      onChange={(e) => setMachineReuse(e.target.value)}
                    />
                    <label htmlFor="machine-reuse-yes">Sim</label>
                  </div>
                  <div className="radio-item">
                    <input 
                      type="radio" 
                      id="machine-reuse-no" 
                      name="machine-reuse" 
                      value="nao" 
                      required
                      checked={machineReuse === 'nao'}
                      onChange={(e) => setMachineReuse(e.target.value)}
                    />
                    <label htmlFor="machine-reuse-no">Não</label>
                  </div>
                </div>
              </div>
            )}
            
            {/* 4. Motivo da Saída */}
            <div className="form-group">
              <label htmlFor="exit-reason" className="form-label">Qual o Motivo da Saída? *</label>
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
