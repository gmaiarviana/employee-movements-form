import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeSelector from './entry/EmployeeSelector'
import HPSpecificFields from './entry/HPSpecificFields'
import { useEmployeeSelection } from './entry/hooks/useEmployeeSelection'

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
  
  // Employee selection logic using custom hook
  const {
    employees,
    selectedEmployeeId,
    selectedEmployee,
    loading,
    error,
    handleEmployeeSelect
  } = useEmployeeSelection()

  // HP-specific form data state
  const [formData, setFormData] = useState({
    employeeIdHP: '',
    projectType: '',
    complianceTraining: '',
    billable: '',
    role: '',
    startDate: ''
  })

  // Handle form data changes
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault()
    
    // Validation - check if all required fields are filled
    const { employeeIdHP, projectType, complianceTraining, billable, role, startDate } = formData
    
    if (!selectedEmployeeId || !employeeIdHP.trim() || !projectType.trim() || 
        !complianceTraining || !billable || !role.trim() || !startDate) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    // Create form data object for submission
    const submissionData = {
      selectedEmployeeId: selectedEmployeeId,
      employeeName: selectedEmployee?.name || '',
      employeeEmail: selectedEmployee?.email || 'N/A',
      employeeCompany: selectedEmployee?.company || 'N/A',
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
                disabled={!selectedEmployee}
                style={!selectedEmployee ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
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
