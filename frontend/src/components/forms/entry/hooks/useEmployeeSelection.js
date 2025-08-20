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
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState('')

  // Load employees list when component mounts (minimal data for dropdown)
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

  // Load employee detailed information when selected
  const loadEmployeeDetails = async (employeeId) => {
    try {
      setLoadingDetails(true)
      const response = await employees.getDetails(employeeId)
      
      if (response && response.data) {
        setSelectedEmployeeDetails(response.data.employee)
      } else {
        setError('Erro ao carregar detalhes do funcionário')
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do funcionário:', err)
      setError('Erro ao carregar detalhes do funcionário. Tente novamente.')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId)
    
    if (employeeId) {
      const employee = employeesList.find(emp => emp.id === employeeId)
      setSelectedEmployee(employee)
      // Load detailed information for the selected employee
      loadEmployeeDetails(employeeId)
    } else {
      setSelectedEmployee(null)
      setSelectedEmployeeDetails(null)
    }
  }

  return {
    employees: employeesList,
    selectedEmployeeId,
    selectedEmployee,
    selectedEmployeeDetails, // Detailed data from API
    loading,
    loadingDetails,
    error,
    handleEmployeeSelect
  }
}
