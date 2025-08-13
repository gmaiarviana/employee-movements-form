import { useState, useEffect } from 'react'
import { employees } from '../../../../services/api'

/**
 * Custom hook for managing employee selection logic
 * @returns {Object} Employee selection state and handlers
 */
export const useEmployeeSelection = () => {
  const [employeesList, setEmployeesList] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load employees list when component mounts
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await employees.getAll()
        
        if (response && response.data && response.data.teamMembers) {
          setEmployeesList(response.data.teamMembers)
        } else {
          setError('Formato de resposta inválido da API')
        }
      } catch (err) {
        console.error('Erro ao carregar funcionários:', err)
        setError('Erro ao carregar lista de funcionários. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [])

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId)
    
    if (employeeId) {
      const employee = employeesList.find(emp => emp.id === employeeId)
      setSelectedEmployee(employee)
    } else {
      setSelectedEmployee(null)
    }
  }

  return {
    employees: employeesList,
    selectedEmployeeId,
    selectedEmployee,
    loading,
    error,
    handleEmployeeSelect
  }
}
