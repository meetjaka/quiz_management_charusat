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
    default: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
    flat: 'bg-white rounded-lg border border-gray-200 p-6',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-100 p-6',
    interactive: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer',
    gradient: 'bg-gradient-to-br rounded-xl p-6 text-white shadow-md',
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
