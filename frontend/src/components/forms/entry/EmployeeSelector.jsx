import React from 'react'

/**
 * Employee Selector Component
 * Handles employee dropdown selection and displays readonly fields
 */
const EmployeeSelector = ({ 
  selectedEmployeeId, 
  onEmployeeSelect, 
  employees, 
  loading, 
  error,
  showReadonlyFields = true
}) => {
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId)

  /**
   * Generates display text for employee dropdown with fallbacks for missing data
   * @param {Object} employee - Employee object
   * @returns {string} Formatted display text
   */
  const getDisplayText = (employee) => {
    if (!employee) return ''
    
    const name = employee.name || 'Nome não informado'
    const company = employee.company || 'Empresa não informada'
    const formacao = employee.formacao || null
    
    let displayText = `${name} - ${company}`
    
    // Add education info if available
    if (formacao) {
      displayText += ` (${formacao})`
    } else {
      displayText += ' (Formação não informada)'
    }
    
    return displayText
  }

  return (
    <>
      {/* Error message display */}
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Employee dropdown selection */}
      <div className="form-group">
        <label htmlFor="employee-select" className="form-label">
          Selecionar Funcionário *
        </label>
        {loading ? (
          <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280' }}>
            Carregando funcionários...
          </div>
        ) : (
          <select
            id="employee-select"
            name="employee-select"
            required
            className="form-field"
            value={selectedEmployeeId}
            onChange={(e) => onEmployeeSelect(e.target.value)}
            disabled={loading || employees.length === 0}
          >
            <option value="">Selecione um funcionário</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {getDisplayText(employee)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Readonly fields - only show when employee is selected */}
      {selectedEmployee && showReadonlyFields && (
        <>
          <div className="form-group">
            <label htmlFor="employee-name" className="form-label">Nome Completo</label>
            <input 
              type="text" 
              id="employee-name" 
              name="employee-name" 
              className="form-field"
              value={selectedEmployee.name || 'Nome não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedEmployee.name ? '#6b7280' : '#dc2626',
                fontStyle: selectedEmployee.name ? 'normal' : 'italic'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-email" className="form-label">E-mail</label>
            <input 
              type="text" 
              id="employee-email" 
              name="employee-email" 
              className="form-field"
              value={selectedEmployee.email || 'E-mail não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedEmployee.email ? '#6b7280' : '#dc2626',
                fontStyle: selectedEmployee.email ? 'normal' : 'italic'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-company" className="form-label">Instituto/Empresa</label>
            <input 
              type="text" 
              id="employee-company" 
              name="employee-company" 
              className="form-field"
              value={selectedEmployee.company || 'Empresa não informada'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedEmployee.company ? '#6b7280' : '#dc2626',
                fontStyle: selectedEmployee.company ? 'normal' : 'italic'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="employee-education" className="form-label">Formação</label>
            <input 
              type="text" 
              id="employee-education" 
              name="employee-education" 
              className="form-field"
              value={selectedEmployee.formacao || 'Formação não informada'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedEmployee.formacao ? '#6b7280' : '#dc2626',
                fontStyle: selectedEmployee.formacao ? 'normal' : 'italic'
              }}
            />
          </div>
        </>
      )}
    </>
  )
}

export default EmployeeSelector
