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
  error 
}) => {
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId)

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
                {employee.name} - {employee.company || 'N/A'}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Readonly fields - only show when employee is selected */}
      {selectedEmployee && (
        <>
          <div className="form-group">
            <label htmlFor="employee-name" className="form-label">Nome Completo</label>
            <input 
              type="text" 
              id="employee-name" 
              name="employee-name" 
              className="form-field"
              value={selectedEmployee.name || ''}
              readOnly
              style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-email" className="form-label">E-mail</label>
            <input 
              type="text" 
              id="employee-email" 
              name="employee-email" 
              className="form-field"
              value={selectedEmployee.email || 'N/A'}
              readOnly
              style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-company" className="form-label">Instituto/Empresa</label>
            <input 
              type="text" 
              id="employee-company" 
              name="employee-company" 
              className="form-field"
              value={selectedEmployee.company || 'N/A'}
              readOnly
              style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
            />
          </div>
        </>
      )}
    </>
  )
}

export default EmployeeSelector
