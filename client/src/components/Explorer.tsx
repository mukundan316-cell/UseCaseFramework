import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUseCases } from '../contexts/UseCaseContext';
// Legacy LEGO blocks component removed - using Survey.js architecture

export default function ExplorerEnhanced() {
  const { 
    useCases,
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
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900">RSA Active Portfolio</h3>
              <p className="text-gray-600 mt-2">Legacy LEGO blocks components removed - migrated to Survey.js</p>
            </div>
          </TabsContent>

          <TabsContent value="reference" className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900">Reference Library</h3>
              <p className="text-gray-600 mt-2">Legacy LEGO blocks components removed - migrated to Survey.js</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}