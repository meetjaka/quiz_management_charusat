import React, { forwardRef } from 'react';
import { theme, cn } from '../../constants/theme';

/**
 * Input Component
 * Accessible form input with validation states
 * GPU-accelerated focus transitions
 * 
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {node} leftIcon - Icon on left side
 * @param {node} rightIcon - Icon on right side
 * @param {boolean} required - Show required asterisk
 * @param {string} className - Additional custom classes
 */
const Input = forwardRef(
  (
    {
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      required = false,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Input styles based on state
    const inputBaseStyles =
      'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed';

    const inputStateStyles = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

    const inputClasses = cn(
      inputBaseStyles,
      inputStateStyles,
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            className="text-xs text-red-600 flex items-center gap-1"
            id={`${props.id}-error`}
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
