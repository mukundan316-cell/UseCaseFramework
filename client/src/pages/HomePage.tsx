import React from 'react';
import { useUseCases } from '../contexts/UseCaseContext';
import Layout from '../components/Layout';
import DashboardView from '../components/DashboardView';
import Explorer from '../components/Explorer';
import AdminPanel from '../components/AdminPanel';
import AssessmentView from '../components/AssessmentView';

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
