import React from 'react';
import { useLocation } from 'wouter';

/**
 * Assessment View Component
 * Redirects to the new RSA Assessment Landing Page 
 * Legacy LEGO blocks components removed - using Survey.js architecture
 */
export default function AssessmentView() {
  const [, setLocation] = useLocation();

  // Redirect to the new landing page immediately
  React.useEffect(() => {
    setLocation('/assessment');
  }, [setLocation]);

  // Return simple redirect message
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Redirecting to Assessment...</h2>
        <p className="text-gray-600 mt-2">Migrated to Survey.js architecture</p>
      </div>
    </div>
  );
}