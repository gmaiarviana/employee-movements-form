import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { movements as movementsApi } from '../../services/api'

const AdminDashboard = () => {
  const [movements, setMovements] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateFilterType, setDateFilterType] = useState('movement') // 'movement' ou 'registration'
  const [sortOrder, setSortOrder] = useState('recent') // 'recent' ou 'oldest'
  const navigate = useNavigate()

  // Function to filter movements by date with type selection and sorting
  const filterMovementsByDate = (movements, startDate, endDate, dateType = 'movement', sortOrder = 'recent') => {
    return movements.filter(movement => {
      // Função para criar Date local correto a partir de string do PostgreSQL
      const createLocalDate = (dateString) => {
        const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
        if (isDateOnly) {
          const [year, month, day] = dateString.split('-')
          return new Date(year, month - 1, day) // mês é 0-indexado
        } else {
          return new Date(dateString)
        }
      }
      
      // Selecionar a data baseada no tipo de filtro
      let targetDate
      if (dateType === 'registration') {
        targetDate = createLocalDate(movement.registrationDate)
      } else {
        targetDate = createLocalDate(movement.movementDate || movement.date)
      }
      
      // Se startDate estiver definida, verificar se a data selecionada é >= startDate
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0) // Início do dia
        if (targetDate < start) {
          return false
        }
      }
      
      // Se endDate estiver definida, verificar se a data selecionada é <= endDate
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Final do dia
        if (targetDate > end) {
          return false
        }
      }
      
      return true
    }).sort((a, b) => {
      // Usar a mesma lógica de createLocalDate para ordenação
      const createLocalDate = (dateString) => {
        const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
        if (isDateOnly) {
          const [year, month, day] = dateString.split('-')
          return new Date(year, month - 1, day)
        } else {
          return new Date(dateString)
        }
      }
      
      // Selecionar a data para ordenação baseada no tipo de filtro
      let dateA, dateB
      if (dateType === 'registration') {
        dateA = createLocalDate(a.registrationDate)
        dateB = createLocalDate(b.registrationDate)
      } else {
        dateA = createLocalDate(a.movementDate || a.date)
        dateB = createLocalDate(b.movementDate || b.date)
      }
      
      // Aplicar ordenação conforme seleção do usuário
      if (sortOrder === 'oldest') {
        return dateA - dateB // Mais antiga primeiro
      } else {
        return dateB - dateA // Mais recente primeiro (padrão)
      }
    })
  }

  // Function to load movements with filters
  const loadMovements = async (filterStartDate = null, filterEndDate = null) => {
    try {
      setLoading(true)
      setError('')
      
      let movementsData = await movementsApi.getAll()
      
      // Verificar se resposta tem estrutura correta
      if (movementsData.success && movementsData.data) {
        movementsData = movementsData.data
      }
      
      // Aplicar filtro por data no frontend
      if (filterStartDate || filterEndDate) {
        movementsData = filterMovementsByDate(movementsData, filterStartDate, filterEndDate, dateFilterType, sortOrder)
      } else {
        // Aplicar apenas ordenação quando não há filtros de data
        movementsData = filterMovementsByDate(movementsData, null, null, dateFilterType, sortOrder)
      }
      
      setMovements(movementsData)
      setLoading(false)
      
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error)
      setLoading(false)
      setError(`Erro ao carregar movimentações: ${error.message}`)
    }
  }

  // Function to handle filter button click
  const filterMovements = () => {
    const filterStartDate = startDate || null
    const filterEndDate = endDate || null
    
    // Carregar movimentações com os filtros aplicados
    loadMovements(filterStartDate, filterEndDate)
  }

  // Function to navigate home
  const goHome = () => {
    navigate('/')
  }

  // useEffect to load movements on component mount
  useEffect(() => {
    console.log('Admin Dashboard loaded successfully')
    loadMovements()
  }, [])

  // useEffect to reload movements when filter type or sort order changes
  useEffect(() => {
    if (movements.length > 0) {
      // Reaplica os filtros quando o tipo de data ou ordenação muda
      const filterStartDate = startDate || null
      const filterEndDate = endDate || null
      loadMovements(filterStartDate, filterEndDate)
    }
  }, [dateFilterType, sortOrder])

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <p>Painel de administração para gerenciar movimentações de funcionários</p>
      </div>

      <div className="content">
        {/* Seção de Movimentações Consolidadas */}
        <div className="movements-section">
          <h2>Movimentações Recentes</h2>
          
          {/* Filtros por Data */}
          <div className="date-filter-section">
            {/* Toggle para tipo de data */}
            <div className="filter-type-section">
              <label>Filtrar por:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="dateFilterType"
                    value="movement"
                    checked={dateFilterType === 'movement'}
                    onChange={(e) => setDateFilterType(e.target.value)}
                  />
                  Data da Movimentação
                </label>
                <label>
                  <input
                    type="radio"
                    name="dateFilterType"
                    value="registration"
                    checked={dateFilterType === 'registration'}
                    onChange={(e) => setDateFilterType(e.target.value)}
                  />
                  Data de Registro
                </label>
              </div>
            </div>

            {/* Dropdown de ordenação */}
            <div className="sort-section">
              <label htmlFor="sort-order">Ordenação:</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="recent">Mais recente primeiro</option>
                <option value="oldest">Mais antiga primeiro</option>
              </select>
            </div>

            <div className="date-filters">
              <div className="date-input-group">
                <label htmlFor="start-date">Data Início:</label>
                <input 
                  type="date" 
                  id="start-date" 
                  name="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">Data Fim:</label>
                <input 
                  type="date" 
                  id="end-date" 
                  name="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn-primary" id="filter-btn" onClick={filterMovements}>
                Filtrar
              </button>
            </div>
          </div>
          
          {loading && (
            <div id="movements-loading" className="loading-message">
              Carregando movimentações...
            </div>
          )}
          
          {error && (
            <div id="movements-error" className="error-message">
              {error}
            </div>
          )}
          
          <div className="movements-container">
            <table id="movements-table" className="movements-table">
              <thead>
                <tr>
                  <th>Data da Movimentação</th>
                  <th>Data de Registro</th>
                  <th>Tipo</th>
                  <th>Funcionário</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody id="movements-table-body">
                {!loading && !error && movements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-movements">
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                )}
                {!loading && !error && movements.map((movement, index) => {
                  const typeClass = movement.type === 'entrada' ? 'movement-entry' : 'movement-exit'
                  const typeText = movement.type === 'entrada' ? 'Entrada' : 'Saída'
                  
                  // Função para formatar data de movimentação (apenas data)
                  const formatMovementDate = (dateString) => {
                    if (!dateString) return '-'
                    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
                    
                    if (isDateOnly) {
                      const [year, month, day] = dateString.split('-')
                      const localDate = new Date(year, month - 1, day)
                      return localDate.toLocaleDateString('pt-BR')
                    } else {
                      return new Date(dateString).toLocaleDateString('pt-BR')
                    }
                  }
                  
                  // Função para formatar data de registro (data + hora)
                  const formatRegistrationDate = (dateString) => {
                    if (!dateString) return '-'
                    return new Date(dateString).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  }
                  
                  const formattedMovementDate = formatMovementDate(movement.movementDate || movement.date)
                  const formattedRegistrationDate = formatRegistrationDate(movement.registrationDate)
                  
                  return (
                    <tr key={index} className="movement-row">
                      <td className="movement-date">{formattedMovementDate}</td>
                      <td className="registration-date">{formattedRegistrationDate}</td>
                      <td className={`movement-type ${typeClass}`}>{typeText}</td>
                      <td className="movement-employee">{movement.employeeName}</td>
                      <td className="movement-details">{movement.details || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={goHome}>
          Voltar ao Menu Principal
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
