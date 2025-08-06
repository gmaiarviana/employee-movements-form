import React from 'react';
import './Container.css';

/**
 * Container Component
 * 
 * A responsive wrapper component with max-width constraints
 * following the design system tokens.
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Container size: 'sm', 'md', 'lg', 'xl', '2xl' or 'full'
 * @param {boolean} props.fluid - Whether the container should have padding or not
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Container content
 * @param {Object} props.rest - Additional props to pass to the container element
 */
const Container = ({ 
  size = 'lg', 
  fluid = false,
  className = '', 
  children, 
  ...rest 
}) => {
  const baseClass = 'container';
  const sizeClass = `container--${size}`;
  const fluidClass = fluid ? 'container--fluid' : '';

  const containerClasses = [
    baseClass,
    sizeClass,
    fluidClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...rest}>
      {children}
    </div>
  );
};

export default Container;
