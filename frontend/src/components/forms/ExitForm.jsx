import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { employees } from '../../services/api'

const ExitForm = () => {
  const [searchParams] = useSearchParams()
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exitDate, setExitDate] = useState('')
  const [exitReason, setExitReason] = useState('')
  const [hasReplacement, setHasReplacement] = useState('')
  const [machineType, setMachineType] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const navigate = useNavigate()

  const employeeId = searchParams.get('employeeId')

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
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
        
        // ✅ NOVO: Extrair data de entrada se existir
        if (data.data.project && data.data.project.startDate) {
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
    
    // Validar se todos os campos estão preenchidos
    if (!exitDate || !exitReason || !hasReplacement || !machineType) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    // Validação de data antes de enviar
    if (entryDate && exitDate && new Date(exitDate) <= new Date(entryDate)) {
      alert(`Data de saída deve ser posterior à data de entrada (${formatDate(entryDate)}).`)
      return
    }
    
    // Construir URL para a página de summary com os parâmetros
    const summaryUrl = `/summary?employeeId=${encodeURIComponent(employeeId)}&exitDate=${encodeURIComponent(exitDate)}&reason=${encodeURIComponent(exitReason)}&hasReplacement=${encodeURIComponent(hasReplacement)}&machineType=${encodeURIComponent(machineType)}`
    
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
            
            {/* Adicionar após as informações do funcionário */}
            {!loading && !error && employeeInfo && entryDate && (
              <div className="employee-display">
                <h4>Informações da Alocação</h4>
                <p><strong>Data de Entrada:</strong> {formatDate(entryDate)}</p>
                <p><em>A data de saída deve ser posterior à data de entrada.</em></p>
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
                min={entryDate} // ✅ Bloquear datas anteriores à entrada
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

            {/* Primeiro campo: Haverá Replacement? */}
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

            {/* Segundo campo: Máquina HP ou AWS? */}
            <div className="form-group">
              <label className="form-label">Máquina HP ou AWS? *</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="machine-hp" 
                    name="machine-type" 
                    value="Máquina HP" 
                    required
                    checked={machineType === 'Máquina HP'}
                    onChange={(e) => setMachineType(e.target.value)}
                  />
                  <label htmlFor="machine-hp">Máquina HP</label>
                </div>
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="machine-aws" 
                    name="machine-type" 
                    value="AWS" 
                    required
                    checked={machineType === 'AWS'}
                    onChange={(e) => setMachineType(e.target.value)}
                  />
                  <label htmlFor="machine-aws">AWS</label>
                </div>
              </div>
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
