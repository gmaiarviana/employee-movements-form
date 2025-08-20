import React from 'react'

/**
 * Employee Selector Component
 * Handles employee dropdown selection and displays readonly fields
 */
const EmployeeSelector = ({ 
  selectedEmployeeId, 
  onEmployeeSelect, 
  employees, 
  selectedEmployeeDetails, // Detailed data from API
  loading, 
  loadingDetails,
  error,
  showReadonlyFields = true
}) => {
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId)
  const detailsToShow = selectedEmployeeDetails || selectedEmployee // Use detailed data when available

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

      {/* Readonly fields - only show when employee is selected AND showReadonlyFields is true */}
      {selectedEmployee && showReadonlyFields && (
        <>
          {loadingDetails && (
            <div style={{ 
              padding: '0.75rem', 
              textAlign: 'center', 
              color: '#6b7280',
              fontStyle: 'italic' 
            }}>
              Carregando dados detalhados...
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="employee-name" className="form-label">Nome Completo</label>
            <input 
              type="text" 
              id="employee-name" 
              name="employee-name" 
              className="form-field"
              value={detailsToShow?.name || 'Nome não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: detailsToShow?.name ? '#6b7280' : '#dc2626',
                fontStyle: detailsToShow?.name ? 'normal' : 'italic'
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
              value={detailsToShow?.email || 'E-mail não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: detailsToShow?.email ? '#6b7280' : '#dc2626',
                fontStyle: detailsToShow?.email ? 'normal' : 'italic'
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
              value={detailsToShow?.company || 'Empresa não informada'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: detailsToShow?.company ? '#6b7280' : '#dc2626',
                fontStyle: detailsToShow?.company ? 'normal' : 'italic'
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
              value={detailsToShow?.formacao || 'Formação não informada'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: detailsToShow?.formacao ? '#6b7280' : '#dc2626',
                fontStyle: detailsToShow?.formacao ? 'normal' : 'italic'
              }}
            />
          </div>

          {/* Dados Pessoais - só mostrar se temos dados detalhados */}
          {selectedEmployeeDetails && (
            <>
              <div className="form-group">
                <label htmlFor="employee-cpf" className="form-label">CPF</label>
                <input 
                  type="text" 
                  id="employee-cpf" 
                  name="employee-cpf" 
                  className="form-field"
                  value={selectedEmployeeDetails.cpf || 'CPF não informado'}
                  readOnly
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    color: selectedEmployeeDetails.cpf ? '#6b7280' : '#dc2626',
                    fontStyle: selectedEmployeeDetails.cpf ? 'normal' : 'italic'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="employee-rg" className="form-label">RG</label>
                <input 
                  type="text" 
                  id="employee-rg" 
                  name="employee-rg" 
                  className="form-field"
                  value={selectedEmployeeDetails.rg || 'RG não informado'}
                  readOnly
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    color: selectedEmployeeDetails.rg ? '#6b7280' : '#dc2626',
                    fontStyle: selectedEmployeeDetails.rg ? 'normal' : 'italic'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="employee-birth-date" className="form-label">Data de Nascimento</label>
                <input 
                  type="text" 
                  id="employee-birth-date" 
                  name="employee-birth-date" 
                  className="form-field"
                  value={selectedEmployeeDetails.data_nascimento ? new Date(selectedEmployeeDetails.data_nascimento).toLocaleDateString('pt-BR') : 'Data não informada'}
                  readOnly
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    color: selectedEmployeeDetails.data_nascimento ? '#6b7280' : '#dc2626',
                    fontStyle: selectedEmployeeDetails.data_nascimento ? 'normal' : 'italic'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="employee-education-level" className="form-label">Escolaridade</label>
                <input 
                  type="text" 
                  id="employee-education-level" 
                  name="employee-education-level" 
                  className="form-field"
                  value={selectedEmployeeDetails.nivel_escolaridade || 'Escolaridade não informada'}
                  readOnly
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    color: selectedEmployeeDetails.nivel_escolaridade ? '#6b7280' : '#dc2626',
                    fontStyle: selectedEmployeeDetails.nivel_escolaridade ? 'normal' : 'italic'
                  }}
                />
              </div>

              {/* HP Employee ID se disponível */}
              {selectedEmployeeDetails.hp_employee_id && (
                <div className="form-group">
                  <label htmlFor="employee-hp-id" className="form-label">Employee ID HP</label>
                  <input 
                    type="text" 
                    id="employee-hp-id" 
                    name="employee-hp-id" 
                    className="form-field"
                    value={selectedEmployeeDetails.hp_employee_id}
                    readOnly
                    style={{ 
                      backgroundColor: '#f9fafb', 
                      color: '#6b7280'
                    }}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Indicador discreto quando dados estão sendo carregados em background */}
      {selectedEmployee && !showReadonlyFields && loadingDetails && (
        <div style={{ 
          padding: '0.5rem', 
          fontSize: '0.875rem',
          color: '#6b7280',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          Carregando dados do funcionário em segundo plano...
        </div>
      )}
    </>
  )
}

export default EmployeeSelector
