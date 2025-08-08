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
        'group flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden',
        'min-w-[200px] justify-start font-semibold text-sm shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform scale-105'
          : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 hover:text-blue-600 hover:scale-102 border border-white/30',
        className
      )}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 animate-pulse"></div>
      )}
      <div className={cn(
        'p-2 rounded-xl relative z-10 transition-all duration-300',
        isActive 
          ? 'bg-white/20' 
          : 'bg-blue-50 group-hover:bg-blue-100'
      )}>
        <Icon 
          size={20} 
          className={cn(
            'transition-transform duration-300',
            isActive 
              ? 'text-white scale-110' 
              : 'text-blue-600 group-hover:scale-110'
          )} 
        />
      </div>
      <span className="relative z-10">{label}</span>
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </button>
  );
}