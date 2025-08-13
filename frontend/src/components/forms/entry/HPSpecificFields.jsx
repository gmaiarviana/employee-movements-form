import React from 'react'

/**
 * HP Specific Fields Component
 * Handles all HP-specific form fields (employeeIdHP, projectType, etc.)
 */
const HPSpecificFields = ({ selectedEmployee, formData, onChange }) => {
  // Don't render if no employee is selected
  if (!selectedEmployee) {
    return null
  }

  const {
    employeeIdHP,
    projectType,
    complianceTraining,
    billable,
    role,
    startDate
  } = formData

  return (
    <>
      <div className="form-group">
        <label htmlFor="employee-id-hp" className="form-label">Employee ID HP *</label>
        <input 
          type="text" 
          id="employee-id-hp" 
          name="employee-id-hp" 
          required 
          className="form-field"
          value={employeeIdHP}
          onChange={(e) => onChange('employeeIdHP', e.target.value)}
          placeholder="Ex: HP123456"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="project-type" className="form-label">Tipo de projeto *</label>
        <input 
          type="text" 
          id="project-type" 
          name="project-type" 
          required 
          className="form-field"
          value={projectType}
          onChange={(e) => onChange('projectType', e.target.value)}
          placeholder="Ex: Desenvolvimento, Suporte, Consultoria"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Realizou o treinamento de compliance da HP? *</label>
        <div className="radio-group">
          <div className="radio-item">
            <input 
              type="radio" 
              id="compliance-yes" 
              name="compliance-training" 
              value="sim" 
              required
              checked={complianceTraining === 'sim'}
              onChange={(e) => onChange('complianceTraining', e.target.value)}
            />
            <label htmlFor="compliance-yes">Sim</label>
          </div>
          <div className="radio-item">
            <input 
              type="radio" 
              id="compliance-no" 
              name="compliance-training" 
              value="nao" 
              required
              checked={complianceTraining === 'nao'}
              onChange={(e) => onChange('complianceTraining', e.target.value)}
            />
            <label htmlFor="compliance-no">Não</label>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">É faturável? *</label>
        <div className="radio-group">
          <div className="radio-item">
            <input 
              type="radio" 
              id="billable-yes" 
              name="billable" 
              value="sim" 
              required
              checked={billable === 'sim'}
              onChange={(e) => onChange('billable', e.target.value)}
            />
            <label htmlFor="billable-yes">Sim</label>
          </div>
          <div className="radio-item">
            <input 
              type="radio" 
              id="billable-no" 
              name="billable" 
              value="nao" 
              required
              checked={billable === 'nao'}
              onChange={(e) => onChange('billable', e.target.value)}
            />
            <label htmlFor="billable-no">Não</label>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="role" className="form-label">Papel/Função *</label>
        <input 
          type="text" 
          id="role" 
          name="role" 
          required 
          className="form-field"
          value={role}
          onChange={(e) => onChange('role', e.target.value)}
          placeholder="Ex: Desenvolvedor Senior, Analista, Arquiteto"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="start-date" className="form-label">Data de Início *</label>
        <input 
          type="date" 
          id="start-date" 
          name="start-date" 
          required 
          className="form-field"
          value={startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
        />
      </div>
    </>
  )
}

export default HPSpecificFields
