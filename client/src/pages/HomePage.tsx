import React from 'react';
import { useUseCases } from '../contexts/UseCaseContext';
import Layout from '../components/Layout';
import DashboardView from '../components/DashboardView';
import Explorer from '../components/Explorer';
import AdminPanel from '../components/AdminPanel';
import AssessmentView from '../components/AssessmentView';
import AIRoadmapPage from './AIRoadmapPage';

export default function HomePage() {
  const { activeTab } = useUseCases();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'explorer':
        return <Explorer />;
      case 'admin':
        return <AdminPanel />;
      case 'assessment':
        return <AssessmentView />;
      case 'roadmap':
        return <div className="px-0 -mx-4 sm:-mx-6 lg:-mx-8"><AIRoadmapPage /></div>;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout>
      {renderActiveTab()}
    </Layout>
  );
}
