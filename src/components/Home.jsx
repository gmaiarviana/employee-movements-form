import React from 'react'
import { Link } from 'react-router-dom'
import { Header, Container, Button } from '../components/ui'
import './Home.css' // We'll create this file for custom styling

const Home = () => {
  return (
    <>
      <Header 
        title="Sistema de Gestão de Funcionários" 
        variant="primary"
        className="home-header"
        sticky={false}
      />
      
      <main>
        <Container className="home-container">
          <div className="header">
            <h2>Bem-vindo ao Sistema de Gestão de Funcionários</h2>
            <p>Este sistema permite gerenciar o processo de entrada e saída de funcionários de forma eficiente e organizada.</p>
          </div>
          
          <div className="content">
            <div className="home-buttons">
              <Link to="/entry-form" style={{ textDecoration: 'none' }}>
                <Button variant="primary">
                  <span>📋</span>
                  Entrada de Funcionário
                </Button>
              </Link>
              <Link to="/select-employee" style={{ textDecoration: 'none' }}>
                <Button variant="primary">
                  <span>👋</span>
                  Saída de Funcionário
                </Button>
              </Link>
              <Link to="/admin-dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="secondary">
                  <span>📊</span>
                  Visão do Administrador
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}

export default Home
