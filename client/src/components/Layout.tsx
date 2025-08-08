import React from 'react';
import { Brain, PlusCircle, Sparkle, Search, Settings } from 'lucide-react';
import { useUseCases } from '../contexts/UseCaseContext';
import { TabType } from '../types';
import RSAHeader from './RSAHeader';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useUseCases();

  const tabs = [
    { id: 'submit' as TabType, label: 'Submit Use Case', icon: PlusCircle },
    { id: 'matrix' as TabType, label: 'Matrix View', icon: Sparkle },
    { id: 'explorer' as TabType, label: 'Explorer', icon: Search },
    { id: 'admin' as TabType, label: 'Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* RSA Header */}
      <RSAHeader />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-rsa-blue text-white shadow-md'
                    : 'text-gray-600 hover:text-rsa-blue hover:bg-blue-50'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
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
