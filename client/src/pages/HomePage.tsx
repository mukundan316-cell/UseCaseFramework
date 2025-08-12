import React from 'react';
import { useUseCases } from '../contexts/UseCaseContext';
import Layout from '../components/Layout';
import DashboardView from '../components/DashboardView';
import Explorer from '../components/Explorer';
import AdminPanel from '../components/AdminPanel';
import RSAAssessmentLandingPage from '../components/RSAAssessmentLandingPage';

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
        return <RSAAssessmentLandingPage />;
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
