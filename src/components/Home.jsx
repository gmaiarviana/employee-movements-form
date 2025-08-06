import React from 'react'
import { Link } from 'react-router-dom'
import '../design-system.css'

const Home = () => {
  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Sistema de Gestão de Funcionários</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <div className="text-center mb-lg">
            <h2>Bem-vindo ao Sistema de Gestão de Funcionários</h2>
            <p>Este sistema permite gerenciar o processo de entrada e saída de funcionários de forma eficiente e organizada.</p>
          </div>
          
          <div className="home-buttons">
            <Link to="/entry-form" className="btn btn--primary btn--large">
              <span>📋</span>
              Entrada de Funcionário
            </Link>
            <Link to="/select-employee" className="btn btn--primary btn--large">
              <span>👋</span>
              Saída de Funcionário
            </Link>
            <Link to="/admin-dashboard" className="btn btn--secondary btn--large">
              <span>📊</span>
              Visão do Administrador
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default Home
