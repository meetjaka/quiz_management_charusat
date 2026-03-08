import React from 'react';
import { cn } from '../../constants/theme';

/**
 * Button Component
 * High-performance button with GPU-accelerated animations
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  children,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200';

  const variantStyles = {
    primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus:ring-brand-500 hover:shadow active:scale-[0.98]',
    secondary: 'bg-white border border-secondary-200 text-secondary-700 shadow-sm hover:bg-secondary-50 hover:text-secondary-900 focus:ring-secondary-200 active:scale-[0.98]',
    success: 'bg-success-600 text-white shadow-sm hover:bg-success-700 focus:ring-success-500 active:scale-[0.98]',
    danger: 'bg-danger-600 text-white shadow-sm hover:bg-danger-700 focus:ring-danger-500 active:scale-[0.98]',
    warning: 'bg-warning-500 text-white shadow-sm hover:bg-warning-600 focus:ring-warning-500 active:scale-[0.98]',
    ghost: 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 focus:ring-secondary-200',
    link: 'text-brand-600 hover:text-brand-700 hover:underline focus:ring-brand-500',
    icon: 'text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 focus:ring-secondary-200',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-2.5 text-base rounded-lg',
    xl: 'px-8 py-3.5 text-lg rounded-xl',
  };

  const iconSizes = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-lg',
    lg: 'p-2.5 rounded-lg',
    xl: 'p-3 rounded-xl',
  };

  const isIconOnly = variant === 'icon' || (!children && (leftIcon || rightIcon));

  const buttonClasses = cn(
    baseStyles,
    variantStyles[variant],
    isIconOnly ? iconSizes[size] : sizeStyles[size],
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {leftIcon && !loading && <span className={cn("flex-shrink-0", children && "mr-2")}>{leftIcon}</span>}
      {children}
      {rightIcon && !loading && <span className={cn("flex-shrink-0", children && "ml-2")}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
