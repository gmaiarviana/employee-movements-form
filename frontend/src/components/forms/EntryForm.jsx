import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeSelector from './entry/EmployeeSelector'
import ProjectSelector from './entry/ProjectSelector'
import HPExperienceFields from './entry/HPExperienceFields'
import HPSpecificFields from './entry/HPSpecificFields'
import { useEmployeeSelection } from './entry/hooks/useEmployeeSelection'
import { useProjectSelection } from './entry/hooks/useProjectSelection'
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
  
  // Employee selection logic using custom hook
  const {
    employees,
    selectedEmployeeId,
    selectedEmployee,
    loading,
    error,
    handleEmployeeSelect
  } = useEmployeeSelection()

  // Project selection logic using custom hook
  const {
    projects,
    selectedProjectId,
    selectedProject,
    loading: projectsLoading,
    error: projectsError,
    handleProjectSelect
  } = useProjectSelection()

  // HP-specific form data state
  const [formData, setFormData] = useState({
    has_previous_hp_experience: '',
    previous_hp_account_id: '',
    previous_hp_period_start: '',
    previous_hp_period_end: '',
    employeeIdHP: '',
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
    
    // Validation - check if all required fields are filled
    const { 
      has_previous_hp_experience, 
      previous_hp_account_id, 
      employeeIdHP, 
      complianceTraining, 
      billable, 
      role, 
      startDate, 
      machineType, 
      bundleAws 
    } = formData
    
    if (!selectedEmployeeId || !selectedProjectId || !has_previous_hp_experience || 
        !employeeIdHP.trim() || !complianceTraining || !billable || !role.trim() || 
        !startDate || !machineType) {
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
    
    // Create form data object for submission
    const submissionData = {
      selectedEmployeeId: selectedEmployeeId,
      employeeName: selectedEmployee?.name || '',
      employeeEmail: selectedEmployee?.email || 'N/A',
      employeeCompany: selectedEmployee?.company || 'N/A',
      selectedProjectId: selectedProjectId,
      projectName: selectedProject?.name || '',
      projectSowPt: selectedProject?.sow_pt || 'N/A',
      projectManager: selectedProject?.gerente_hp || 'N/A',
      projectDescription: selectedProject?.description || 'N/A',
      ...formData
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
    navigate('/')
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
          
          <form id="entry-form" onSubmit={handleSubmit} className="form">
            {/* Employee Selection Component */}
            <EmployeeSelector
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeSelect={handleEmployeeSelect}
              employees={employees}
              loading={loading}
              error={error}
            />

            {/* Project Selection Component */}
            <ProjectSelector
              selectedProjectId={selectedProjectId}
              onProjectSelect={handleProjectSelect}
              projects={projects}
              loading={projectsLoading}
              error={projectsError}
            />

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
                disabled={!selectedEmployee || !selectedProject}
                style={(!selectedEmployee || !selectedProject) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
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

export default EntryForm
