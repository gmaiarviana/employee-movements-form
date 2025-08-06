import React from 'react';
import './Card.css';

/**
 * Card Component
 * 
 * A flexible card component with multiple variants and subcomponents
 * following the design system tokens.
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant: 'default', 'elevated', 'outlined'
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 * @param {Object} props.rest - Additional props to pass to the card element
 */
const Card = ({ 
  variant = 'default', 
  className = '', 
  children, 
  ...rest 
}) => {
  const baseClass = 'card';
  const variantClass = `card--${variant}`;

  const cardClasses = [
    baseClass,
    variantClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...rest}>
      {children}
    </div>
  );
};

/**
 * CardHeader Component
 * 
 * Header section of a card, typically contains titles and actions
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Header content
 * @param {Object} props.rest - Additional props to pass to the header element
 */
const CardHeader = ({ 
  className = '', 
  children, 
  ...rest 
}) => {
  const headerClasses = [
    'card__header',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses} {...rest}>
      {children}
    </div>
  );
};

/**
 * CardContent Component
 * 
 * Main content area of a card
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Content
 * @param {Object} props.rest - Additional props to pass to the content element
 */
const CardContent = ({ 
  className = '', 
  children, 
  ...rest 
}) => {
  const contentClasses = [
    'card__content',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={contentClasses} {...rest}>
      {children}
    </div>
  );
};

/**
 * CardFooter Component
 * 
 * Footer section of a card, typically contains actions or additional info
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Footer content
 * @param {Object} props.rest - Additional props to pass to the footer element
 */
const CardFooter = ({ 
  className = '', 
  children, 
  ...rest 
}) => {
  const footerClasses = [
    'card__footer',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={footerClasses} {...rest}>
      {children}
    </div>
  );
};

// Export all components
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
export { CardHeader, CardContent, CardFooter };
