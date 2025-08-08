import React from 'react';
import { Brain, PlusCircle, Sparkle, Search, Settings } from 'lucide-react';
import { useUseCases } from '../contexts/UseCaseContext';
import { TabType } from '../types';
import RSAHeader from './RSAHeader';
import TabButton from './lego-blocks/TabButton';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useUseCases();

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard View', icon: Sparkle },
    { id: 'explorer' as TabType, label: 'Explorer', icon: Search },
    { id: 'admin' as TabType, label: 'Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* RSA Header */}
      <RSAHeader />
      
      {/* Navigation Tabs - RSA Portal Style */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-4 py-6">
            {tabs.map(({ id, label, icon }) => (
              <TabButton
                key={id}
                id={id}
                label={label}
                icon={icon}
                isActive={activeTab === id}
                onClick={setActiveTab}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
