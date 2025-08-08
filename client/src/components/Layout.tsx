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
      
      {/* Navigation Tabs - RSA Portal Style */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-4 py-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-full transition-all duration-200 min-w-[180px] justify-start shadow-sm ${
                  activeTab === id
                    ? 'bg-rsa-purple text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-102 border border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  activeTab === id 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-gray-100'
                }`}>
                  <Icon size={20} className={activeTab === id ? 'text-white' : 'text-rsa-purple'} />
                </div>
                <span className="font-medium text-sm">{label}</span>
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
