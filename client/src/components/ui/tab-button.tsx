import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (id: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, isActive, onClick }) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 ${
        isActive ? "bg-[#005DAA] text-white" : "text-gray-700 hover:text-[#005DAA]"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Button>
  );
};

export default TabButton;