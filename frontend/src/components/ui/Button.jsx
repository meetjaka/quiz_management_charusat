import React from 'react';
import { theme, cn } from '../../constants/theme';

/**
 * Button Component
 * High-performance button with GPU-accelerated animations
 * Uses only transform and opacity for smooth 60fps animations
 * 
 * @param {string} variant - primary | secondary | success | danger | ghost | link | icon
 * @param {string} size - sm | md | lg | xl
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {string} className - Additional custom classes
 * @param {function} onClick - Click handler
 * @param {node} children - Button content
 * @param {node} leftIcon - Icon to display on left
 * @param {node} rightIcon - Icon to display on right
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
  // Base button styles
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles (GPU-accelerated transitions only)
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:scale-95 transition-all duration-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 active:scale-95 transition-all duration-200',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:scale-95 transition-all duration-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:scale-95 transition-all duration-200',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 active:scale-95 transition-all duration-200',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 transition-colors duration-200',
    link: 'text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500 transition-colors duration-200',
    icon: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-gray-500 transition-colors duration-200',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
    xl: 'px-8 py-4 text-xl rounded-xl',
  };

  // Icon size styles
  const iconSizes = {
    sm: 'p-1.5 rounded-md',
    md: 'p-2 rounded-lg',
    lg: 'p-3 rounded-lg',
    xl: 'p-4 rounded-xl',
  };

  // Determine if this is an icon-only button
  const isIconOnly = variant === 'icon' || (!children && (leftIcon || rightIcon));

  // Combine all styles
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
      {/* Loading Spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left Icon */}
      {leftIcon && !loading && (
        <span className="mr-2 flex-shrink-0">{leftIcon}</span>
      )}

      {/* Button Text */}
      {children}

      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className="ml-2 flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
