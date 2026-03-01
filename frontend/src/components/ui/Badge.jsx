import React from 'react';
import { cn } from '../../constants/theme';

/**
 * Badge Component
 * Small status indicators with multiple variants
 * 
 * @param {string} variant - primary | success | warning | danger | gray
 * @param {string} size - sm | md | lg
 * @param {node} children - Badge content
 * @param {string} className - Additional custom classes
 */
const Badge = ({ variant = 'primary', size = 'md', children, className = '' }) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const badgeClasses = cn(
    'inline-flex items-center font-medium rounded-full',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;
