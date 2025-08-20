import React from 'react'

/**
 * Project Selector Component
 * Handles project dropdown selection and displays readonly fields
 */
const ProjectSelector = ({ 
  selectedProjectId, 
  onProjectSelect, 
  projects, 
  loading, 
  error,
  showReadonlyFields = true
}) => {
  const selectedProject = projects.find(project => project.id === selectedProjectId)

  /**
   * Generates display text for project dropdown with fallbacks for missing data
   * @param {Object} project - Project object
   * @returns {string} Formatted display text
   */
  const getDisplayText = (project) => {
    if (!project) return ''
    
    const name = project.name || 'Nome não informado'
    const sowPt = project.sow_pt || 'SOW/PT não informado'
    
    return `${name} - ${sowPt}`
  }

  return (
    <>
      {/* Error message display */}
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Project dropdown selection */}
      <div className="form-group">
        <label htmlFor="project-select" className="form-label">
          Selecionar Projeto *
        </label>
        {loading ? (
          <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280' }}>
            Carregando projetos...
          </div>
        ) : (
          <select
            id="project-select"
            name="project-select"
            required
            className="form-field"
            value={selectedProjectId}
            onChange={(e) => onProjectSelect(e.target.value)}
            disabled={loading || projects.length === 0}
          >
            <option value="">Selecione um projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {getDisplayText(project)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Readonly fields - only show when project is selected */}
      {selectedProject && showReadonlyFields && (
        <>
          <div className="form-group">
            <label htmlFor="project-name" className="form-label">Nome do Projeto</label>
            <input 
              type="text" 
              id="project-name" 
              name="project-name" 
              className="form-field"
              value={selectedProject.name || 'Nome não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedProject.name ? '#6b7280' : '#dc2626',
                fontStyle: selectedProject.name ? 'normal' : 'italic'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="project-sow" className="form-label">SOW/PT</label>
            <input 
              type="text" 
              id="project-sow" 
              name="project-sow" 
              className="form-field"
              value={selectedProject.sow_pt || 'SOW/PT não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedProject.sow_pt ? '#6b7280' : '#dc2626',
                fontStyle: selectedProject.sow_pt ? 'normal' : 'italic'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="project-manager" className="form-label">Gerente HP</label>
            <input 
              type="text" 
              id="project-manager" 
              name="project-manager" 
              className="form-field"
              value={selectedProject.gerente_hp || 'Gerente não informado'}
              readOnly
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedProject.gerente_hp ? '#6b7280' : '#dc2626',
                fontStyle: selectedProject.gerente_hp ? 'normal' : 'italic'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="project-description" className="form-label">Descrição</label>
            <textarea 
              id="project-description" 
              name="project-description" 
              className="form-field"
              value={selectedProject.description || 'Descrição não informada'}
              readOnly
              rows="3"
              style={{ 
                backgroundColor: '#f9fafb', 
                color: selectedProject.description ? '#6b7280' : '#dc2626',
                fontStyle: selectedProject.description ? 'normal' : 'italic',
                resize: 'vertical'
              }}
            />
          </div>
        </>
      )}
    </>
  )
}

export default ProjectSelector
