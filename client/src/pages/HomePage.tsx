import React from 'react';
import { useUseCases } from '../contexts/UseCaseContext';
import Layout from '../components/Layout';
import UseCaseForm from '../components/UseCaseForm';
import MatrixPlot from '../components/MatrixPlot';
import Explorer from '../components/Explorer';
import AdminPanel from '../components/AdminPanel';

export default function HomePage() {
  const { activeTab } = useUseCases();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'submit':
        return <UseCaseForm />;
      case 'matrix':
        return <MatrixPlot />;
      case 'explorer':
        return <Explorer />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <UseCaseForm />;
    }
  };

  return (
    <Layout>
      {renderActiveTab()}
    </Layout>
  );
}
