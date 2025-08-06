import React, { forwardRef, useId } from 'react';
import './Input.css';

/**
 * Input Component
 * 
 * A reusable input component with multiple types, states, and full accessibility support
 * following the design system tokens.
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Input type: 'text', 'email', 'password', 'date', 'select', 'textarea'
 * @param {string} props.label - Label text for the input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.className - Additional CSS classes
 * @param {Array} props.options - Options array for select type (objects with value and label)
 * @param {number} props.rows - Number of rows for textarea type
 * @param {Object} props.rest - Additional props to pass to the input element
 */
const Input = forwardRef(({ 
  type = 'text', 
  label,
  placeholder,
  error,
  disabled = false,
  value,
  onChange,
  required = false,
  className = '',
  options = [],
  rows = 3,
  ...rest 
}, ref) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const baseClass = 'input';
  const typeClass = `input--${type}`;
  const stateClasses = [
    hasError && 'input--error',
    disabled && 'input--disabled'
  ].filter(Boolean);

  const inputClasses = [
    baseClass,
    typeClass,
    ...stateClasses,
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'input__label',
    required && 'input__label--required',
    disabled && 'input__label--disabled'
  ].filter(Boolean).join(' ');

  // Common input props
  const commonProps = {
    id: inputId,
    value,
    onChange,
    disabled,
    required,
    placeholder,
    className: inputClasses,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
    ref,
    ...rest
  };

  // Render different input types
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={`${inputClasses} input__textarea`}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            className={`${inputClasses} input__select`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option key={option.value || index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            className={`${inputClasses} input__field`}
          />
        );
    }
  };

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="input__required-indicator" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="input__wrapper">
        {renderInput()}
      </div>
      
      {hasError && (
        <div id={errorId} className="input__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
