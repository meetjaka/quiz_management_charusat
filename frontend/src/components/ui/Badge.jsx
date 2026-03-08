import React from 'react';
import { cn } from '../../constants/theme';

/**
 * Badge Component
 * Small status indicators with multiple variants
 */
const Badge = ({ variant = 'primary', size = 'md', children, className = '' }) => {
  const variantStyles = {
    primary: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
    success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-200',
    warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-200',
    danger: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-200',
    gray: 'bg-secondary-50 text-secondary-600 ring-1 ring-inset ring-secondary-200',
    purple: 'bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  const badgeClasses = cn(
    'inline-flex items-center font-medium rounded-md',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;
