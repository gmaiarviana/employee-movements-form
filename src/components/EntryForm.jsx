import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../design-system.css'

const EntryForm = () => {
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [complianceTraining, setComplianceTraining] = useState('')
  const [billable, setBillable] = useState('')
  const [startDate, setStartDate] = useState('')
  const [role, setRole] = useState('')
  const [projectName, setProjectName] = useState('')
  const navigate = useNavigate()

  // Função para lidar com o envio do formulário
  const handleSubmit = (event) => {
    // Previne o envio padrão do formulário
    event.preventDefault()
    
    // Validação básica - verifica se todos os campos obrigatórios estão preenchidos
    if (!fullName.trim() || !cpf.trim() || !email.trim() || !instituteName.trim() || !complianceTraining || 
        !billable || !startDate || !role.trim() || !projectName.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    // Cria o objeto com os dados do formulário
    const formData = {
      fullName: fullName.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      instituteName: instituteName.trim(),
      complianceTraining: complianceTraining,
      billable: billable,
      startDate: startDate,
      role: role.trim(),
      projectName: projectName.trim()
    }
    
    // Constrói a URL com os parâmetros de consulta
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(formData)) {
      params.append(key, encodeURIComponent(value))
    }
    
    // Redireciona para a página de resumo com os dados
    navigate(`/summary-entry?${params.toString()}`)
  }

  // Função para lidar com o clique do botão voltar
  const handleBack = () => {
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Sistema de Movimentação de Contratos</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <h2>Formulário de Entrada de Funcionários</h2>
          
          <form id="entry-form" onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="full-name" className="form-label">Nome Completo</label>
              <input 
                type="text" 
                id="full-name" 
                name="full-name" 
                required 
                className="form-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cpf" className="form-label">CPF</label>
              <input 
                type="text" 
                id="cpf" 
                name="cpf" 
                required 
                className="form-field"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input 
                type="text" 
                id="email" 
                name="email" 
                required 
                className="form-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="institute-name" className="form-label">Nome do Instituto</label>
              <input 
                type="text" 
                id="institute-name" 
                name="institute-name" 
                required 
                className="form-field"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Realizou o treinamento de compliance da HP?</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="compliance-yes" 
                    name="compliance-training" 
                    value="sim" 
                    required
                    checked={complianceTraining === 'sim'}
                    onChange={(e) => setComplianceTraining(e.target.value)}
                  />
                  <label htmlFor="compliance-yes">Sim</label>
                </div>
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="compliance-no" 
                    name="compliance-training" 
                    value="nao" 
                    required
                    checked={complianceTraining === 'nao'}
                    onChange={(e) => setComplianceTraining(e.target.value)}
                  />
                  <label htmlFor="compliance-no">Não</label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">É faturável?</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="billable-yes" 
                    name="billable" 
                    value="sim" 
                    required
                    checked={billable === 'sim'}
                    onChange={(e) => setBillable(e.target.value)}
                  />
                  <label htmlFor="billable-yes">Sim</label>
                </div>
                <div className="radio-item">
                  <input 
                    type="radio" 
                    id="billable-no" 
                    name="billable" 
                    value="nao" 
                    required
                    checked={billable === 'nao'}
                    onChange={(e) => setBillable(e.target.value)}
                  />
                  <label htmlFor="billable-no">Não</label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="start-date" className="form-label">Data de Início</label>
              <input 
                type="date" 
                id="start-date" 
                name="start-date" 
                required 
                className="form-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">Papel do profissional</label>
              <input 
                type="text" 
                id="role" 
                name="role" 
                required 
                className="form-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="project-name" className="form-label">Nome do projeto HP em que o profissional atuará</label>
              <input 
                type="text" 
                id="project-name" 
                name="project-name" 
                required 
                className="form-field"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            
            <div className="nav-buttons">
              <button 
                type="button" 
                id="back-button" 
                className="btn btn--secondary"
                onClick={handleBack}
              >
                Voltar
              </button>
              <button 
                type="submit" 
                id="continue-button" 
                className="btn btn--primary"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default EntryForm
