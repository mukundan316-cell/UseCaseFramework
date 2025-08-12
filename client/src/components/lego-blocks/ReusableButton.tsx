import React from 'react';
import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReusableButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'rsa-primary' | 'rsa-secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  fullWidth?: boolean;
  rsaStyle?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'reset';
}

export function ReusableButton({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  fullWidth = false,
  rsaStyle,
  ...props
}: ReusableButtonProps) {
  
  // RSA-specific styling
  const getRSAStyles = () => {
    const baseStyles = "font-medium rounded-lg transition-all duration-200 shadow-sm";
    
    switch (rsaStyle) {
      case 'primary':
        return `${baseStyles} bg-rsa-blue hover:bg-rsa-dark-blue text-white border-rsa-blue`;
      case 'secondary':
        return `${baseStyles} bg-white hover:bg-gray-50 text-rsa-blue border border-rsa-blue`;
      case 'success':
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white border-green-600`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500`;
      case 'danger':
        return `${baseStyles} bg-red-600 hover:bg-red-700 text-white border-red-600`;
      case 'reset':
        return `${baseStyles} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
      default:
        return '';
    }
  };

  const buttonClassName = cn(
    rsaStyle && getRSAStyles(),
    fullWidth && 'w-full',
    loading && 'opacity-50 cursor-not-allowed',
    className
  );

  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon className={cn(
      "h-4 w-4",
      iconPosition === 'right' ? 'ml-2' : 'mr-2'
    )} />;
  };

  return (
    <Button
      type={type}
      variant={rsaStyle ? 'default' : variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClassName}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      
      {iconPosition === 'right' && renderIcon()}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        </div>
      )}
    </Button>
  );
}

export default ReusableButton;