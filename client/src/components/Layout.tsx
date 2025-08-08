import React from 'react';
import { Brain, PlusCircle, Sparkle, Search, Settings } from 'lucide-react';
import { useUseCases } from '../contexts/UseCaseContext';
import { TabType } from '../types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useUseCases();

  const tabs = [
    { id: 'submit' as TabType, label: 'Submit Use Case', icon: PlusCircle },
    { id: 'matrix' as TabType, label: 'Matrix View', icon: Sparkle },
    { id: 'explorer' as TabType, label: 'Explorer', icon: Search },
    { id: 'admin' as TabType, label: 'Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-rsa-bg">
      {/* Sticky Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-rsa-blue rounded-lg flex items-center justify-center">
                  <Brain className="text-white" size={16} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">RSA AI Framework</h1>
                  <p className="text-xs text-gray-500">Use Case Prioritization</p>
                </div>
              </div>
            </div>
            <nav className="flex space-x-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                    activeTab === id
                      ? 'bg-rsa-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
