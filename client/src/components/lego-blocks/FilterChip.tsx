import React from 'react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function FilterChip({
  label,
  active,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: FilterChipProps) {
  
  const getVariantStyles = () => {
    if (active) {
      switch (variant) {
        case 'primary':
          return 'bg-rsa-blue text-white border-rsa-blue';
        case 'secondary':
          return 'bg-rsa-purple text-white border-rsa-purple';
        default:
          return 'bg-rsa-blue text-white border-rsa-blue';
      }
    } else {
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-xl font-medium transition-all duration-200 border',
        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rsa-blue focus:ring-opacity-50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
    >
      {label}
    </button>
  );
}