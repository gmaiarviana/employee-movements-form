import React, { useState, useEffect } from 'react'
import { roles } from '../../../services/api'

/**
 * HP Specific Fields Component
 * Handles all HP-specific form fields (complianceTraining, billable, role, etc.)
 */
const HPSpecificFields = ({ selectedEmployee, formData, onChange }) => {
  const [rolesData, setRolesData] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState(null)

  // Fetch roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true)
      setRolesError(null)
      
      try {
        const response = await roles.getAll()
        // Sort roles by category and sort_order
        const sortedRoles = response.data?.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          return (a.sort_order || 0) - (b.sort_order || 0)
        }) || []
        
        setRolesData(sortedRoles)
      } catch (error) {
        setRolesError(error.message || 'Erro ao carregar papéis/funções')
        console.error('Error fetching roles:', error)
      } finally {
        setRolesLoading(false)
      }
    }

    fetchRoles()
  }, [])

  // Don't render if no employee is selected
  if (!selectedEmployee) {
    return null
  }

  const {
    complianceTraining,
    billable,
    role,
    startDate,
    machineType,
    bundleAws
  } = formData

  return (
    <>
      {/* Compliance Training */}
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
      
      {/* É faturável? */}
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
      
      {/* Papel/Função - Dropdown */}
      <div className="form-group">
        <label htmlFor="role" className="form-label">Papel/Função *</label>
        {rolesLoading ? (
          <div className="loading-message">Carregando papéis/funções...</div>
        ) : rolesError ? (
          <div className="error-message">{rolesError}</div>
        ) : (
          <select 
            id="role" 
            name="role" 
            required 
            className="form-field"
            value={role}
            onChange={(e) => onChange('role', e.target.value)}
          >
            <option value="">Selecione um papel/função</option>
            {rolesData.map((roleItem) => (
              <option key={roleItem.id} value={roleItem.name}>
                {roleItem.name}
                {roleItem.category && ` (${roleItem.category})`}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Data de Início */}
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
      
      {/* Tipo de infraestrutura */}
      <div className="form-group">
        <label className="form-label">Tipo de infraestrutura necessária *</label>
        <div className="radio-group">
          <div className="radio-item">
            <input 
              type="radio" 
              id="machine-send" 
              name="machine-type" 
              value="empresa" 
              required
              checked={machineType === 'empresa'}
              onChange={(e) => onChange('machineType', e.target.value)}
            />
            <label htmlFor="machine-send">Necessário o envio de máquina</label>
          </div>
          <div className="radio-item">
            <input 
              type="radio" 
              id="machine-aws" 
              name="machine-type" 
              value="aws" 
              required
              checked={machineType === 'aws'}
              onChange={(e) => onChange('machineType', e.target.value)}
            />
            <label htmlFor="machine-aws">Ambiente AWS</label>
          </div>
          <div className="radio-item">
            <input 
              type="radio" 
              id="machine-available" 
              name="machine-type" 
              value="disponivel" 
              required
              checked={machineType === 'disponivel'}
              onChange={(e) => onChange('machineType', e.target.value)}
            />
            <label htmlFor="machine-available">Máquina disponível</label>
          </div>
        </div>
      </div>
      
      {/* Bundle AWS - Condicional */}
      {machineType === 'aws' && (
        <div className="form-group">
          <label htmlFor="bundle-aws" className="form-label">Bundle necessário para o ambiente AWS *</label>
          <input 
            type="text" 
            id="bundle-aws" 
            name="bundle-aws" 
            required 
            className="form-field"
            value={bundleAws || ''}
            onChange={(e) => onChange('bundleAws', e.target.value)}
            placeholder="Ex: bundle-dev-001, bundle-prod-002"
          />
        </div>
      )}
    </>
  )
}

export default HPSpecificFields
