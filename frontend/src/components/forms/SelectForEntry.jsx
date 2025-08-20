import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeSelector from './entry/EmployeeSelector'
import ProjectSelector from './entry/ProjectSelector'
import { useEmployeeSelection } from './entry/hooks/useEmployeeSelection'
import { useProjectSelection } from './entry/hooks/useProjectSelection'
import { useToast } from '../../context/ToastContext'

const SelectForEntry = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Hooks para seleção de funcionário e projeto
  const { 
    employees,
    selectedEmployeeId, 
    selectedEmployee, 
    loading,
    error,
    handleEmployeeSelect 
  } = useEmployeeSelection()

  const { 
    projects,
    selectedProjectId,
    selectedProject, 
    loading: projectsLoading,
    error: projectsError,
    handleProjectSelect 
  } = useProjectSelection()

  // Função para lidar com o submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validação
    if (!selectedEmployee || !selectedProject) {
      showToast('Por favor, selecione um funcionário e um projeto antes de continuar.', 'error')
      return
    }

    // Construir URLSearchParams com os dados necessários
    const params = new URLSearchParams({
      selectedEmployeeId: selectedEmployeeId,
      selectedProjectId: selectedProjectId,
      employeeName: selectedEmployee.name || '',
      employeeEmail: selectedEmployee.email || '',
      employeeCompany: selectedEmployee.company || '',
      employeeRole: selectedEmployee.role || '',
      employeeFormacao: selectedEmployee.formacao || '',
      projectName: selectedProject.name || '',
      projectSowPt: selectedProject.sow_pt || '',
      projectManager: selectedProject.gerente_hp || '',
      projectDescription: selectedProject.description || ''
    })

    // Navegar para o formulário de entrada
    navigate(`/entry-form?${params.toString()}`)
  }

  // Função para voltar para a home
  const handleBack = () => {
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Sistema de Entrada de Funcionários</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <h2>Selecionar Funcionário e Projeto para Entrada</h2>
          <p>Primeiro, selecione o funcionário e o projeto:</p>
          
          <form onSubmit={handleSubmit}>
            {/* Seletor de Funcionário */}
            <EmployeeSelector 
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeSelect={handleEmployeeSelect}
              employees={employees}
              loading={loading}
              error={error}
              showReadonlyFields={false}
            />

            {/* Seletor de Projeto */}
            <ProjectSelector 
              selectedProjectId={selectedProjectId}
              onProjectSelect={handleProjectSelect}
              projects={projects}
              loading={projectsLoading}
              error={projectsError}
              showReadonlyFields={false}
            />

            {/* Botões de navegação */}
            <div className="nav-buttons">
              <button 
                type="button"
                className="btn btn--secondary"
                onClick={handleBack}
              >
                Voltar
              </button>
              <button 
                type="submit"
                className="btn btn--primary"
                disabled={!selectedEmployee || !selectedProject}
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

export default SelectForEntry
