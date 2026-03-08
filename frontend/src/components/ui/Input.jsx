import React, { forwardRef } from 'react';
import { cn } from '../../constants/theme';

/**
 * Input Component
 * Accessible form input with validation states
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
    const inputBaseStyles =
      'w-full px-3.5 py-2.5 text-sm text-secondary-900 border rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 disabled:bg-secondary-50 disabled:text-secondary-400 disabled:cursor-not-allowed placeholder:text-secondary-400 shadow-sm hover:border-secondary-300';

    const inputStateStyles = error
      ? 'border-danger-300 focus:ring-danger-100 focus:border-danger-500'
      : 'border-secondary-200 focus:ring-brand-500/10 focus:border-brand-500';

    const inputClasses = cn(
      inputBaseStyles,
      inputStateStyles,
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-secondary-400 w-4 h-4 flex items-center justify-center">{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <span className="text-secondary-400 w-4 h-4 flex items-center justify-center">{rightIcon}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger-600 flex items-center gap-1.5 font-medium" id={`${props.id}-error`} role="alert">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-secondary-500 leading-relaxed">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
