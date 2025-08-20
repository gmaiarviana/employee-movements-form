import React from 'react'

/**
 * HP Experience Fields Component
 * Handles HP previous experience form fields with conditional rendering
 */
const HPExperienceFields = ({ selectedEmployee, formData, onChange }) => {
  // Don't render if no employee is selected
  if (!selectedEmployee) {
    return null
  }

  const {
    has_previous_hp_experience,
    previous_hp_account_id,
    previous_hp_period_start,
    previous_hp_period_end
  } = formData

  return (
    <>
      <div className="form-group">
        <label className="form-label">Esse profissional já atuou anteriormente em projetos HP? *</label>
        <div className="radio-group">
          <div className="radio-item">
            <input 
              type="radio" 
              id="hp-experience-yes" 
              name="hp-experience" 
              value="sim" 
              required
              checked={has_previous_hp_experience === 'sim'}
              onChange={(e) => onChange('has_previous_hp_experience', e.target.value)}
            />
            <label htmlFor="hp-experience-yes" className="radio-label">Sim</label>
          </div>
          <div className="radio-item">
            <input 
              type="radio" 
              id="hp-experience-no" 
              name="hp-experience" 
              value="nao" 
              required
              checked={has_previous_hp_experience === 'nao'}
              onChange={(e) => onChange('has_previous_hp_experience', e.target.value)}
            />
            <label htmlFor="hp-experience-no" className="radio-label">Não</label>
          </div>
        </div>
      </div>

      {/* Conditional fields - only show if has previous HP experience */}
      {has_previous_hp_experience === 'sim' && (
        <>
          <div className="form-group">
            <label htmlFor="previous-hp-account-id" className="form-label">
              Employee ID HP *
            </label>
            <input 
              type="text" 
              id="previous-hp-account-id" 
              name="previous-hp-account-id" 
              required 
              className="form-field"
              value={previous_hp_account_id}
              onChange={(e) => onChange('previous_hp_account_id', e.target.value)}
              placeholder="Ex: HP987654"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Favor Informar o período que o profissional atuou</label>
            <div className="period-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="previous-hp-period-start" className="form-label-small">Início (MM/AAAA)</label>
                <input 
                  type="text" 
                  id="previous-hp-period-start" 
                  name="previous-hp-period-start" 
                  className="form-field"
                  value={previous_hp_period_start}
                  onChange={(e) => onChange('previous_hp_period_start', e.target.value)}
                  placeholder="Ex: 01/2024"
                  pattern="^(0[1-9]|1[0-2])\/\d{4}$"
                  title="Formato: MM/AAAA (ex: 01/2024)"
                />
              </div>
              <span style={{ margin: '0 0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>até</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="previous-hp-period-end" className="form-label-small">Fim (MM/AAAA)</label>
                <input 
                  type="text" 
                  id="previous-hp-period-end" 
                  name="previous-hp-period-end" 
                  className="form-field"
                  value={previous_hp_period_end}
                  onChange={(e) => onChange('previous_hp_period_end', e.target.value)}
                  placeholder="Ex: 12/2024"
                  pattern="^(0[1-9]|1[0-2])\/\d{4}$"
                  title="Formato: MM/AAAA (ex: 12/2024)"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default HPExperienceFields
