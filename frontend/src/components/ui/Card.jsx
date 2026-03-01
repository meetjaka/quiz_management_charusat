import React from 'react';
import { theme, cn } from '../../constants/theme';

/**
 * Card Component
 * High-performance card container with multiple variants
 * GPU-accelerated hover effects using transform
 * 
 * @param {string} variant - default | flat | elevated | interactive | gradient
 * @param {string} className - Additional custom classes
 * @param {function} onClick - Click handler (for interactive cards)
 * @param {node} children - Card content
 * @param {boolean} hover - Enable hover effect
 */
const Card = ({
  variant = 'default',
  className = '',
  onClick,
  children,
  hover = true,
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-card rounded-md subtle-shadow border border-border p-6',
    flat: 'bg-card rounded-lg border border-border p-6',
    elevated: 'bg-card rounded-md shadow-lg border border-border/50 p-6',
    interactive: 'bg-card rounded-md subtle-shadow border border-border p-6 cursor-pointer',
    gradient: 'bg-gradient-to-br rounded-md p-6 text-white shadow-md',
  };

  // Hover effects (GPU-accelerated)
  const hoverStyles = hover
    ? variant === 'interactive'
      ? 'hover:shadow-md hover:border-blue-300 hover:scale-[1.02] transition-all duration-200'
      : 'hover:shadow-md transition-shadow duration-200'
    : '';

  // Combine all styles
  const cardClasses = cn(variantStyles[variant], hoverStyles, className);

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
