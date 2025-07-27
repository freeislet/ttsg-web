// A simple button component that can be shared across different frameworks
// When used with a framework-specific adapter, this can be rendered in React, Vue, or Astro

export interface ButtonProps {
  text: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export function getButtonClasses(props: ButtonProps): string {
  const { variant = 'primary', size = 'medium', disabled = false, className = '' } = props

  // Base classes
  let classes =
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Size classes
  if (size === 'small') {
    classes += ' px-3 py-1.5 text-sm'
  } else if (size === 'medium') {
    classes += ' px-4 py-2 text-base'
  } else if (size === 'large') {
    classes += ' px-6 py-3 text-lg'
  }

  // Variant classes
  if (variant === 'primary') {
    classes += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
  } else if (variant === 'secondary') {
    classes += ' bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
  } else if (variant === 'outline') {
    classes +=
      ' bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  }

  // Disabled state
  if (disabled) {
    classes += ' opacity-50 cursor-not-allowed'
  } else {
    classes += ' cursor-pointer'
  }

  // Add custom classes
  if (className) {
    classes += ` ${className}`
  }

  return classes
}

// This function generates button attributes for different frameworks
export function Button(props: ButtonProps): {
  type: string
  className: string
  disabled: boolean
  onClick?: () => void
} {
  return {
    type: props.type || 'button',
    className: getButtonClasses(props),
    disabled: props.disabled || false,
    onClick: props.onClick,
  }
}
