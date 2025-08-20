import { useState, useEffect } from 'react'
import { projects } from '../../../../services/api'

/**
 * Custom hook for managing project selection logic
 * @returns {Object} Project selection state and handlers
 */
export const useProjectSelection = () => {
  const [projectsList, setProjectsList] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load projects list when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await projects.getAll()
        
        if (response && response.data) {
          setProjectsList(response.data)
        } else {
          setError('Formato de resposta inválido da API')
        }
      } catch (err) {
        console.error('Erro ao carregar projetos:', err)
        setError('Erro ao carregar lista de projetos. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId)
    
    if (projectId) {
      const project = projectsList.find(proj => proj.id === projectId)
      setSelectedProject(project)
    } else {
      setSelectedProject(null)
    }
  }

  return {
    projects: projectsList,
    selectedProjectId,
    selectedProject,
    loading,
    error,
    handleProjectSelect
  }
}
