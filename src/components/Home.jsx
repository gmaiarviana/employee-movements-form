import React from 'react'
import { Link } from 'react-router-dom'
import '../public/css/styles.css'

const Home = () => {
  return (
    <>
      <header>
        <h1>Sistema de Saída de Funcionários</h1>
      </header>
      
      <main>
        <div className="container">
          <h2>Bem-vindo ao Sistema de Gestão de Saída de Funcionários</h2>
          <p>Este sistema permite gerenciar o processo de saída de funcionários de forma eficiente e organizada.</p>
          <Link to="/entry-form" className="primary-button" style={{ marginRight: '1rem' }}>
            Entrada de Funcionário
          </Link>
          <Link to="/select-employee" className="primary-button" style={{ marginRight: '1rem' }}>
            Saída de Funcionário
          </Link>
          <Link to="/admin-dashboard" className="primary-button">
            Visão do Administrador
          </Link>
        </div>
      </main>
    </>
  )
}

export default Home
