import React from 'react';
import { Brain, PlusCircle, Sparkle, Search, Settings, ClipboardCheck } from 'lucide-react';
import { useLocation } from 'wouter';
import { useUseCases } from '../contexts/UseCaseContext';
import { useEngagement } from '../contexts/EngagementContext';
import { TabType } from '../types';
import RSAHeader from './RSAHeader';
import TabButton from './lego-blocks/TabButton';
import EngagementContextLegoBlock from './lego-blocks/EngagementContextLegoBlock';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { activeTab, setActiveTab } = useUseCases();
  const [, setLocation] = useLocation();
  const { 
    selectedClientId, 
    selectedEngagementId, 
    setSelectedClientId, 
    setSelectedEngagementId 
  } = useEngagement();

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    const routes: Record<TabType, string> = {
      'dashboard': '/',
      'explorer': '/explorer',
      'insights': '/insights',
      'assessment': '/assessment',
      'admin': '/admin',
      'both': '/'
    };
    setLocation(routes[tabId] || '/');
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard View', icon: Sparkle },
    { id: 'explorer' as TabType, label: 'Explorer', icon: Search },
    { id: 'insights' as TabType, label: 'Insights', icon: Brain },
    { id: 'assessment' as TabType, label: 'AI Assessment', icon: ClipboardCheck },
    { id: 'admin' as TabType, label: 'Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* RSA Header */}
      <RSAHeader />
      
      {/* Navigation Tabs - Enhanced Futuristic Style */}
      <div className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-6 py-8">
            {tabs.map(({ id, label, icon }) => (
              <TabButton
                key={id}
                id={id}
                label={label}
                icon={icon}
                isActive={activeTab === id}
                onClick={handleTabClick}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Engagement Context Bar */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EngagementContextLegoBlock
            selectedClientId={selectedClientId}
            selectedEngagementId={selectedEngagementId}
            onClientChange={setSelectedClientId}
            onEngagementChange={setSelectedEngagementId}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
