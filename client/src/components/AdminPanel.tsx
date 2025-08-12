import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Admin Panel Component
 * Legacy LEGO blocks components removed - using Survey.js architecture
 */
export default function AdminPanel() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Panel</CardTitle>
          <CardDescription>
            System administration and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Legacy LEGO blocks components removed - migrated to Survey.js architecture</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}