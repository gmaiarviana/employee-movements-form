import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HPExperienceFields from './entry/HPExperienceFields'
import HPSpecificFields from './entry/HPSpecificFields'
import { useToast } from '../../context/ToastContext'

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

const EntryForm = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  
  // Extract data from URL parameters (including all personal data)
  const selectedEmployeeId = searchParams.get('selectedEmployeeId')
  const selectedProjectId = searchParams.get('selectedProjectId')
  const employeeName = searchParams.get('employeeName')
  const employeeEmail = searchParams.get('employeeEmail')
  const employeeCompany = searchParams.get('employeeCompany')
  const employeeRole = searchParams.get('employeeRole')
  const employeeFormacao = searchParams.get('employeeFormacao')
  const employeeCpf = searchParams.get('employeeCpf')
  const employeeRg = searchParams.get('employeeRg')
  const employeeDataNascimento = searchParams.get('employeeDataNascimento')
  const employeeNivelEscolaridade = searchParams.get('employeeNivelEscolaridade')
  const employeeHpId = searchParams.get('employeeHpId')
  const projectName = searchParams.get('projectName')
  const projectSowPt = searchParams.get('projectSowPt')
  const projectManager = searchParams.get('projectManager')
  const projectDescription = searchParams.get('projectDescription')
  
  // Create selectedEmployee and selectedProject objects from URL parameters
  const selectedEmployee = selectedEmployeeId ? {
    id: selectedEmployeeId,
    name: employeeName,
    email: employeeEmail,
    company: employeeCompany,
    role: employeeRole,
    formacao: employeeFormacao,
    cpf: employeeCpf,
    rg: employeeRg,
    data_nascimento: employeeDataNascimento,
    nivel_escolaridade: employeeNivelEscolaridade,
    hp_employee_id: employeeHpId
  } : null
  
  const selectedProject = selectedProjectId ? {
    id: selectedProjectId,
    name: projectName,
    sow_pt: projectSowPt,
    gerente_hp: projectManager,
    description: projectDescription
  } : null

  // Função para retornar valor seguro com fallback
  const getFieldValue = (value, fallback = 'Não informado') => {
    if (value === null || value === undefined || value === '') {
      return fallback
    }
    return value
  }

  // HP-specific form data state
  const [formData, setFormData] = useState({
    has_previous_hp_experience: '',
    previous_hp_account_id: '',
    previous_hp_period_start: '',
    previous_hp_period_end: '',
    complianceTraining: '',
    billable: '',
    role: '',
    startDate: '',
    machineType: '',
    bundleAws: ''
  })

  // Handle form data changes
  const handleFormDataChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Clear bundleAws when machineType is not 'aws'
      if (field === 'machineType' && value !== 'aws') {
        newData.bundleAws = ''
      }
      
      return newData
    })
  }

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault()
    
    // Validation for URL parameters - if no data, show error
    if (!selectedEmployeeId || !selectedProjectId) {
      showToast('Dados de funcionário e projeto não encontrados. Redirecionando para seleção.', 'error')
      navigate('/select-for-entry')
      return
    }
    
    // Validation - check if all required fields are filled
    const { 
      has_previous_hp_experience, 
      previous_hp_account_id, 
      complianceTraining, 
      billable, 
      role, 
      startDate, 
      machineType, 
      bundleAws 
    } = formData
    
    if (!has_previous_hp_experience || !complianceTraining || !billable || 
        !role.trim() || !startDate || !machineType) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'warning')
      return
    }
    
    // Validation for HP previous experience - if yes, account ID is required
    if (has_previous_hp_experience === 'sim' && !previous_hp_account_id.trim()) {
      showToast('Por favor, informe o ID da conta HP anterior quando o profissional já atuou em projetos HP.', 'warning')
      return
    }
    
    // Validation for AWS bundle when machine type is AWS
    if (machineType === 'aws' && !bundleAws.trim()) {
      showToast('Por favor, selecione o bundle AWS quando o tipo de máquina for AWS.', 'warning')
      return
    }
    
    // Create form data object for submission using URL parameters
    const submissionData = {
      selectedEmployeeId: selectedEmployeeId,
      employeeName: employeeName || '',
      employeeEmail: employeeEmail || 'N/A',
      employeeCompany: employeeCompany || 'N/A',
      employeeRole: employeeRole || 'N/A',
      employeeFormacao: employeeFormacao || 'N/A',
      // Include personal data for summary
      employeeCpf: employeeCpf || '',
      employeeRg: employeeRg || '',
      employeeDataNascimento: employeeDataNascimento || '',
      employeeNivelEscolaridade: employeeNivelEscolaridade || '',
      employeeHpId: employeeHpId || '',
      selectedProjectId: selectedProjectId,
      projectName: projectName || '',
      projectSowPt: projectSowPt || 'N/A',
      projectManager: projectManager || 'N/A',
      projectDescription: projectDescription || 'N/A',
      ...formData,
      // employeeIdHP: only if has previous HP experience, use the previous account ID
      employeeIdHP: has_previous_hp_experience === 'sim' ? previous_hp_account_id : ''
    }
    
    // Build URL with query parameters
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(submissionData)) {
      params.append(key, encodeURIComponent(value))
    }
    
    // Navigate to summary page with data
    navigate(`/summary-entry?${params.toString()}`)
  }

  // Handle back button click
  const handleBack = () => {
    navigate('/select-for-entry')
  }

  return (
    <>
      <header style={headerStyle}>
        <div className="container">
          <h1 style={titleStyle}>Sistema de Movimentação de Contratos</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <h2>Formulário de Entrada de Funcionários</h2>
          
          {/* Validation for missing URL parameters */}
          {(!selectedEmployeeId || !selectedProjectId) && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '0.375rem', 
              padding: '1rem', 
              marginBottom: '1rem' 
            }}>
              <p style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                Dados de funcionário e projeto não encontrados.
              </p>
              <button 
                type="button" 
                className="btn btn--primary"
                onClick={() => navigate('/select-for-entry')}
              >
                Voltar para Seleção
              </button>
            </div>
          )}
          
          {/* Show form only if we have the required data */}
          {selectedEmployeeId && selectedProjectId && (
            <form id="entry-form" onSubmit={handleSubmit} className="form">
              {/* Display selected employee and project info */}
              <div className="form-cards-container">
                <div className="form-card">
                  <div className="form-card-header employee-card">
                    <span className="icon">👤</span>
                    <h3>Dados Corporativos</h3>
                  </div>
                  <div className="form-card-body">
                    <p><strong>ID:</strong> {getFieldValue(selectedEmployee?.id)}</p>
                    <p><strong>Nome Completo:</strong> {getFieldValue(selectedEmployee?.name)}</p>
                    <p><strong>E-mail:</strong> {getFieldValue(selectedEmployee?.email)}</p>
                    <p><strong>Nome do Instituto:</strong> {getFieldValue(selectedEmployee?.company)}</p>
                    <p><strong>Cargo:</strong> {getFieldValue(selectedEmployee?.role)}</p>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-card-header employee-card">
                    <span className="icon">👥</span>
                    <h3>Dados Pessoais</h3>
                  </div>
                  <div className="form-card-body">
                    <p><strong>CPF:</strong> {getFieldValue(selectedEmployee?.cpf)}</p>
                    <p><strong>RG:</strong> {getFieldValue(selectedEmployee?.rg)}</p>
                    <p><strong>Data de Nascimento:</strong> {selectedEmployee?.data_nascimento ? new Date(selectedEmployee.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                    <p><strong>Escolaridade:</strong> {getFieldValue(selectedEmployee?.nivel_escolaridade)}</p>
                    <p><strong>Formação:</strong> {getFieldValue(selectedEmployee?.formacao)}</p>
                  </div>
                </div>

                {selectedEmployee?.hp_employee_id && (
                  <div className="form-card">
                    <div className="form-card-header company-card">
                      <span className="icon">🏢</span>
                      <h3>Dados HP</h3>
                    </div>
                    <div className="form-card-body">
                      <p><strong>Employee ID HP:</strong> {selectedEmployee.hp_employee_id}</p>
                    </div>
                  </div>
                )}

                <div className="form-card">
                  <div className="form-card-header project-card">
                    <span className="icon">📋</span>
                    <h3>Dados do Projeto</h3>
                  </div>
                  <div className="form-card-body">
                    <p><strong>Nome do projeto:</strong> {getFieldValue(selectedProject?.name)}</p>
                    <p><strong>SOW ou PT do projeto:</strong> {getFieldValue(selectedProject?.sow_pt)}</p>
                    <p><strong>Gerente HP:</strong> {getFieldValue(selectedProject?.gerente_hp)}</p>
                    <p><strong>Descrição:</strong> {getFieldValue(selectedProject?.description)}</p>
                  </div>
                </div>
              </div>

              {/* HP Experience Fields Component */}
              <HPExperienceFields
                selectedEmployee={selectedEmployee}
                formData={formData}
                onChange={handleFormDataChange}
              />

              {/* HP Specific Fields Component */}
              <HPSpecificFields
                selectedEmployee={selectedEmployee}
                formData={formData}
                onChange={handleFormDataChange}
              />
              
              {/* Navigation Buttons */}
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
          )}
        </div>
      </main>
    </>
  )
}

export default EntryForm
