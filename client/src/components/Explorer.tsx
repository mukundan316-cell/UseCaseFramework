import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUseCases } from '../contexts/UseCaseContext';
import ImprovedUseCaseExplorer from './lego-blocks/ImprovedUseCaseExplorer';

export default function ExplorerEnhanced() {
  const { 
    useCases,
    dashboardUseCases,
    referenceUseCases,
    deleteUseCase,
    activateUseCase,
    deactivateUseCase
  } = useUseCases();

  // Wrapper functions to match LEGO block interface
  const handleDelete = async (useCase: any) => {
    await deleteUseCase(useCase.id);
  };

  const handleActivate = async (id: string, reason?: string) => {
    await activateUseCase(id, reason);
  };

  const handleDeactivate = async (id: string, reason?: string) => {
    await deactivateUseCase(id, reason);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="active">RSA Active Portfolio</TabsTrigger>
            <TabsTrigger value="reference">Reference Library</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <ImprovedUseCaseExplorer
              useCases={dashboardUseCases || []}
              title="RSA Active Portfolio"
              description="Use cases selected for RSA implementation with completed scoring and prioritization"
              showQuadrantFilters={true}
              showRSASelection={true}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              showCreateButton={false}
              emptyStateMessage="No use cases in RSA Active Portfolio. Add use cases from the Reference Library to get started."
              context="active"
            />
          </TabsContent>

          <TabsContent value="reference" className="space-y-6">
            <ImprovedUseCaseExplorer
              useCases={referenceUseCases || []}
              title="Reference Library"
              description="Complete library of all available use cases for browsing and selection"
              showQuadrantFilters={false}
              showRSASelection={true}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              showCreateButton={true}
              emptyStateMessage="No use cases in library. Create your first use case to get started."
              context="reference"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}