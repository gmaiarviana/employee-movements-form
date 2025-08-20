import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const headerStyle = {
  backgroundColor: '#374151',
  color: '#ffffff',
  padding: '1rem 0',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
}

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  margin: '0',
  color: '#ffffff'
}

const Home = () => {
  const { isAuthenticated, currentUser, logout } = useAuth()

  return (
    <>
      <header style={headerStyle}>
        <div className="container">
          <h1 style={titleStyle}>Sistema de Gestão de Funcionários</h1>
          
          {/* User welcome section */}
          {isAuthenticated && currentUser ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{ color: '#e5e7eb' }}>
                Bem-vindo, {currentUser.username}!
              </span>
              <button 
                className="btn btn--secondary" 
                onClick={logout}
                style={{ 
                  backgroundColor: '#6b7280',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            !isAuthenticated && (
              <div style={{ 
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Link to="/login" style={{ color: '#e5e7eb', marginRight: '1rem' }}>
                  Entrar
                </Link>
                <Link to="/register" style={{ color: '#e5e7eb' }}>
                  Cadastrar
                </Link>
              </div>
            )
          )}
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <div className="text-center mb-lg">
            <h2>Bem-vindo ao Sistema de Gestão de Funcionários</h2>
            <p>Este sistema permite gerenciar o processo de entrada e saída de funcionários de forma eficiente e organizada.</p>
          </div>
          
          <div className="home-buttons">
            <Link to="/select-for-entry" className="btn btn--primary btn--large">
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
