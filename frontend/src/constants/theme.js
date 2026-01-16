/**
 * Design System Theme Constants
 * Central source of truth for colors, spacing, shadows, and component styles
 * @version 1.0
 */

export const theme = {
  // Color Palette
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    purple: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Spacing System
  spacing: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'space-y-6',
    card: 'p-6',
    cardSm: 'p-4',
    cardLg: 'p-8',
    grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
    grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    grid2: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
  },

  // Border Radius
  rounded: {
    sm: 'rounded-md',
    default: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    none: 'shadow-none',
  },

  // Typography
  typography: {
    h1: 'text-3xl sm:text-4xl font-bold text-gray-900',
    h2: 'text-2xl sm:text-3xl font-bold text-gray-900',
    h3: 'text-xl sm:text-2xl font-semibold text-gray-900',
    h4: 'text-lg sm:text-xl font-semibold text-gray-900',
    body: 'text-base text-gray-700',
    bodySm: 'text-sm text-gray-600',
    bodyXs: 'text-xs text-gray-500',
    label: 'text-sm font-medium text-gray-700',
    error: 'text-xs text-red-600',
    success: 'text-xs text-green-600',
  },

  // Transitions (GPU-accelerated only)
  transitions: {
    fast: 'transition-all duration-150 ease-in-out',
    default: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out',
    opacity: 'transition-opacity duration-200 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
  },

  // Component Styles
  components: {
    // Card Variants
    card: {
      default: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200',
      flat: 'bg-white rounded-lg border border-gray-200 p-6',
      elevated: 'bg-white rounded-xl shadow-lg border border-gray-100 p-6',
      interactive: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer',
      gradient: 'bg-gradient-to-br rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow duration-200',
    },

    // Button Variants
    button: {
      primary: 'px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      secondary: 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      success: 'px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      danger: 'px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      ghost: 'px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200',
      link: 'px-2 py-1 text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200',
      icon: 'p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200',
    },

    // Input Variants
    input: {
      default: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed',
      error: 'w-full px-4 py-2 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200',
      success: 'w-full px-4 py-2 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200',
      withIcon: 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
    },

    // Badge Variants
    badge: {
      primary: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',
      success: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700',
      warning: 'px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700',
      danger: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700',
      gray: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700',
    },

    // Table Styles
    table: {
      wrapper: 'overflow-x-auto rounded-lg border border-gray-200',
      base: 'min-w-full divide-y divide-gray-200',
      header: 'bg-gray-50',
      headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      body: 'bg-white divide-y divide-gray-200',
      row: 'hover:bg-gray-50 transition-colors duration-150',
      cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
    },

    // Modal Styles
    modal: {
      overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40',
      container: 'fixed inset-0 flex items-center justify-center p-4 z-50',
      content: 'bg-white rounded-2xl shadow-2xl max-w-md w-full p-6',
      header: 'flex items-center justify-between mb-4',
      title: 'text-xl font-semibold text-gray-900',
      body: 'text-gray-600 mb-6',
      footer: 'flex justify-end gap-3',
    },
  },

  // Animation Presets (GPU-accelerated only - transform & opacity)
  animations: {
    // Framer Motion variants
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.3 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 },
    },
    scaleSpring: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
  },

  // Gradients
  gradients: {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600',
    primaryPurple: 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },

  // Breakpoints (for reference)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Helper function to combine classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export default theme;
