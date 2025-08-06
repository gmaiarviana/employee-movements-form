import React from 'react';
import './Header.css';

/**
 * Header Component
 * 
 * A clean and simple application header component
 * following the design system tokens.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The header title
 * @param {React.ReactNode} props.leftContent - Content to display on the left side (before title)
 * @param {React.ReactNode} props.rightContent - Content to display on the right side (actions)
 * @param {string} props.variant - Header variant: 'primary', 'secondary'
 * @param {boolean} props.sticky - Whether the header should stick to the top
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Optional children to render instead of title
 * @param {Object} props.rest - Additional props to pass to the header element
 */
const Header = ({ 
  title,
  leftContent,
  rightContent,
  variant = 'primary',
  sticky = false,
  className = '',
  children,
  ...rest 
}) => {
  const baseClass = 'header';
  const variantClass = `header--${variant}`;
  const stickyClass = sticky ? 'header--sticky' : '';

  const headerClasses = [
    baseClass,
    variantClass,
    stickyClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} {...rest}>
      <div className="header__content">
        <div className="header__left">
          {leftContent}
          {!children && title && <h1 className="header__title">{title}</h1>}
        </div>
        
        {children && <div className="header__center">{children}</div>}
        
        {rightContent && (
          <div className="header__right">
            <div className="header__actions">
              {rightContent}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
