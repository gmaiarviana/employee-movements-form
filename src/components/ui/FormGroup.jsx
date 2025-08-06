import React, { useId } from 'react';
import './FormGroup.css';

/**
 * FormGroup Component
 * 
 * A wrapper component for form inputs with label and error message support
 * following the design system tokens.
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label text
 * @param {string} props.htmlFor - ID to associate label with input (auto-generated if not provided)
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.helperText - Helper text to display below the input
 * @param {boolean} props.inline - Whether to display label and input inline
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Form input
 * @param {Object} props.rest - Additional props to pass to the form group element
 */
const FormGroup = ({ 
  label,
  htmlFor: externalId,
  error,
  required = false,
  helperText,
  inline = false,
  className = '',
  children,
  ...rest 
}) => {
  const internalId = useId();
  const id = externalId || internalId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  
  const hasError = Boolean(error);
  const hasHelperText = Boolean(helperText);

  const baseClass = 'form-group';
  const inlineClass = inline ? 'form-group--inline' : '';
  const errorClass = hasError ? 'form-group--error' : '';

  const formGroupClasses = [
    baseClass,
    inlineClass,
    errorClass,
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'form-group__label',
    required && 'form-group__label--required'
  ].filter(Boolean).join(' ');

  // Clone child element and pass aria attributes
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id,
        'aria-invalid': hasError || undefined,
        'aria-describedby': [
          hasError && errorId,
          hasHelperText && helperId
        ].filter(Boolean).join(' ') || undefined
      });
    }
    return child;
  });

  return (
    <div className={formGroupClasses} {...rest}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="form-group__required-indicator" aria-hidden="true">*</span>}
        </label>
      )}
      
      <div className="form-group__control">
        {enhancedChildren}
        
        {hasHelperText && (
          <div id={helperId} className="form-group__helper">
            {helperText}
          </div>
        )}
        
        {hasError && (
          <div id={errorId} className="form-group__error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormGroup;
