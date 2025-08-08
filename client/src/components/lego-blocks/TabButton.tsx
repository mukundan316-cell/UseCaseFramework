import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (id: any) => void;
  disabled?: boolean;
  className?: string;
}

export default function TabButton({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
  disabled = false,
  className,
}: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      disabled={disabled}
      className={cn(
        'flex items-center space-x-3 px-6 py-4 rounded-full transition-all duration-200',
        'min-w-[180px] justify-start shadow-sm font-medium text-sm',
        'focus:outline-none focus:ring-2 focus:ring-rsa-purple focus:ring-opacity-50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'bg-rsa-purple text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-102 border border-gray-200',
        className
      )}
    >
      <div className={cn(
        'p-2 rounded-full',
        isActive 
          ? 'bg-white bg-opacity-20' 
          : 'bg-gray-100'
      )}>
        <Icon 
          size={20} 
          className={isActive ? 'text-white' : 'text-rsa-purple'} 
        />
      </div>
      <span>{label}</span>
    </button>
  );
}