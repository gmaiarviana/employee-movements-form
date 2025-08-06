import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home-container">
      <h1>Sistema de Movimentação de Funcionários</h1>
      <div className="navigation-options">
        <div className="option-card">
          <h3>Nova Entrada</h3>
          <p>Registrar a entrada de um novo funcionário</p>
          <Link to="/entry-form" className="btn btn-primary">
            Iniciar Nova Entrada
          </Link>
        </div>
        
        <div className="option-card">
          <h3>Nova Saída</h3>
          <p>Registrar a saída de um funcionário</p>
          <Link to="/select-employee" className="btn btn-primary">
            Iniciar Nova Saída
          </Link>
        </div>
        
        <div className="option-card">
          <h3>Área do Administrador</h3>
          <p>Visualizar todas as movimentações do sistema</p>
          <Link to="/admin-dashboard" className="btn btn-secondary">
            Acessar Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
