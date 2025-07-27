// A shared Card component that can be used across different frameworks
// This provides styling and structure for card-like UI elements

export interface CardProps {
  title?: string;
  subtitle?: string;
  bordered?: boolean;
  elevated?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
}

export function getCardClasses(props: CardProps): string {
  const {
    bordered = true,
    elevated = false,
    padding = 'medium',
    className = '',
  } = props;
  
  // Base classes
  let classes = 'bg-white rounded-lg overflow-hidden';
  
  // Border
  if (bordered) {
    classes += ' border border-gray-200';
  }
  
  // Elevation (shadow)
  if (elevated) {
    classes += ' shadow-md';
  }
  
  // Padding
  if (padding === 'small') {
    classes += ' p-3';
  } else if (padding === 'medium') {
    classes += ' p-5';
  } else if (padding === 'large') {
    classes += ' p-8';
  }
  
  // Add custom classes
  if (className) {
    classes += ` ${className}`;
  }
  
  return classes;
}

export function getCardTitleClasses(): string {
  return 'text-xl font-semibold text-gray-900 mb-2';
}

export function getCardSubtitleClasses(): string {
  return 'text-sm text-gray-500 mb-4';
}

export function Card(props: CardProps): {
  className: string;
  titleClassName: string;
  subtitleClassName: string;
} {
  return {
    className: getCardClasses(props),
    titleClassName: getCardTitleClasses(),
    subtitleClassName: getCardSubtitleClasses(),
  };
}
