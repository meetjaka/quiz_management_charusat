import React from 'react';
import { cn } from '../../constants/theme';

/**
 * Card Component
 * High-performance card container with multiple variants
 * GPU-accelerated hover effects using transform
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
    default: 'bg-white rounded-xl shadow-card border border-secondary-200',
    flat: 'bg-white rounded-xl border border-secondary-200',
    elevated: 'bg-white rounded-xl shadow-card-hover border border-secondary-100',
    interactive: 'bg-white rounded-xl shadow-card border border-secondary-200 cursor-pointer',
    gradient: 'bg-gradient-to-br from-brand-600 to-primary-700 rounded-xl text-white shadow-card',
  };

  // Hover effects
  const hoverStyles = hover && variant === 'interactive'
    ? 'hover:shadow-card-hover hover:border-brand-300 hover:-translate-y-0.5 transition-all duration-300'
    : hover && variant !== 'gradient'
      ? 'hover:shadow-card-hover transition-shadow duration-300'
      : '';

  const cardClasses = cn(variantStyles[variant], hoverStyles, className);

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
