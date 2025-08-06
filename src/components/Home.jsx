import React from 'react'
import { Link } from 'react-router-dom'
import { Header, Container, Button } from '../components/ui'
import './Home.css' // We'll create this file for custom styling

const Home = () => {
  return (
    <>
      <Header 
        title="Sistema de Saída de Funcionários" 
        variant="secondary"
        className="home-header"
      />
      
      <main>
        <Container className="home-container">
          <h2>Bem-vindo ao Sistema de Gestão de Saída de Funcionários</h2>
          <p>Este sistema permite gerenciar o processo de saída de funcionários de forma eficiente e organizada.</p>
          
          <div className="home-buttons">
            <Link to="/entry-form" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Entrada de Funcionário</Button>
            </Link>
            <Link to="/select-employee" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Saída de Funcionário</Button>
            </Link>
            <Link to="/admin-dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Visão do Administrador</Button>
            </Link>
          </div>
        </Container>
      </main>
    </>
  )
}

export default Home