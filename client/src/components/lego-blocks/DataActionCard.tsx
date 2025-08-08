import React from 'react';
import { type LucideIcon } from 'lucide-react';
import ReusableButton from './ReusableButton';

interface DataActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function DataActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = "",
}: DataActionCardProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          border: 'border-gray-200 hover:border-rsa-blue',
          background: 'hover:bg-blue-50',
          iconColor: 'text-rsa-blue'
        };
      case 'success':
        return {
          border: 'border-gray-200 hover:border-green-500',
          background: 'hover:bg-green-50',
          iconColor: 'text-green-500'
        };
      case 'warning':
        return {
          border: 'border-gray-200 hover:border-yellow-500',
          background: 'hover:bg-yellow-50',
          iconColor: 'text-yellow-500'
        };
      case 'danger':
        return {
          border: 'border-red-200 hover:border-red-500',
          background: 'hover:bg-red-50',
          iconColor: 'text-red-500'
        };
      default:
        return {
          border: 'border-gray-200',
          background: 'hover:bg-gray-50',
          iconColor: 'text-gray-500'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <ReusableButton
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      loading={loading}
      className={`p-6 h-auto flex-col space-y-3 ${styles.border} ${styles.background} ${className}`}
    >
      <Icon className={`h-8 w-8 ${styles.iconColor}`} />
      <div className="text-center">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </ReusableButton>
  );
}