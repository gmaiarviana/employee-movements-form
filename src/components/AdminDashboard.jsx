import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../public/css/styles.css'

const AdminDashboard = () => {
  const [movements, setMovements] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Function to filter movements by date (identical to JS original)
  const filterMovementsByDate = (movements, startDate, endDate) => {
    return movements.filter(movement => {
      const movementDate = new Date(movement.date)
      
      // Se startDate estiver definida, verificar se a data da movimentação é >= startDate
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0) // Início do dia
        if (movementDate < start) {
          return false
        }
      }
      
      // Se endDate estiver definida, verificar se a data da movimentação é <= endDate
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Final do dia
        if (movementDate > end) {
          return false
        }
      }
      
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date)) // Manter ordenação cronológica (mais recente primeiro)
  }

  // Function to load movements with filters
  const loadMovements = async (filterStartDate = null, filterEndDate = null) => {
    try {
      setLoading(true)
      setError('')
      
      // Fazer requisição para a API
      const response = await fetch('/api/movements')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      let movementsData = await response.json()
      
      // Aplicar filtro por data no frontend
      if (filterStartDate || filterEndDate) {
        movementsData = filterMovementsByDate(movementsData, filterStartDate, filterEndDate)
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

  // Function to simulate data export (identical to JS original)
  const exportData = () => {
    const movementsCount = movements.length
    
    // Preparar informações sobre os filtros aplicados
    let filterInfo = ''
    if (startDate || endDate) {
      const startDateFormatted = startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'não definida'
      const endDateFormatted = endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'não definida'
      filterInfo = `\n\nFiltros aplicados:\n- Data início: ${startDateFormatted}\n- Data fim: ${endDateFormatted}`
    } else {
      filterInfo = '\n\nSem filtros aplicados (todos os dados).'
    }
    
    // Simular a exportação com uma mensagem detalhada
    const message = `⚠️ FUNCIONALIDADE EM DESENVOLVIMENTO ⚠️\n\nA exportação de dados não está implementada neste protótipo.\n\nSe estivesse implementada, seria exportado:\n- ${movementsCount} movimentação(ões) atualmente visível(is) na tabela${filterInfo}\n\nFormatos que seriam suportados: CSV, Excel, PDF.`
    
    alert(message)
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
              <button className="btn-secondary" id="export-btn" onClick={exportData}>
                Exportar Dados
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
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Funcionário</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody id="movements-table-body">
                {!loading && !error && movements.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-movements">
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                )}
                {!loading && !error && movements.map((movement, index) => {
                  const typeClass = movement.type === 'entrada' ? 'movement-entry' : 'movement-exit'
                  const typeText = movement.type === 'entrada' ? 'Entrada' : 'Saída'
                  const formattedDate = new Date(movement.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  return (
                    <tr key={index} className="movement-row">
                      <td className="movement-date">{formattedDate}</td>
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
