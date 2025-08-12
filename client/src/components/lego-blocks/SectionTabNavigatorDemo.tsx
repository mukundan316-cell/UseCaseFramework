import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionTabNavigatorLegoBlock from './SectionTabNavigatorLegoBlock';
import ReusableButton from './ReusableButton';
import { Navigation, RotateCcw, Settings, PlayCircle } from 'lucide-react';

/**
 * Demo component showcasing SectionTabNavigatorLegoBlock functionality
 * Demonstrates different configurations and interactive features
 */
export default function SectionTabNavigatorDemo() {
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [enforceOrder, setEnforceOrder] = useState(true);
  const [disabled, setDisabled] = useState(false);

  // Mock progress data
  const [sectionProgress] = useState(() => {
    const progressMap = new Map();
    progressMap.set(1, { completed: 17, total: 17 }); // Completed
    progressMap.set(2, { completed: 28, total: 35 }); // In progress
    progressMap.set(3, { completed: 0, total: 8 });   // Not started
    progressMap.set(4, { completed: 0, total: 20 });  // Not started
    progressMap.set(5, { completed: 0, total: 10 });  // Not started
    progressMap.set(6, { completed: 0, total: 10 });  // Not started
    return progressMap;
  });

  const handleSectionChange = (section: number) => {
    setCurrentSection(section);
  };

  const simulateProgress = () => {
    const progress = sectionProgress.get(currentSection);
    if (progress && progress.completed < progress.total) {
      const newCompleted = Math.min(progress.completed + 5, progress.total);
      sectionProgress.set(currentSection, { ...progress, completed: newCompleted });
      
      // Mark as completed if finished
      if (newCompleted === progress.total && !completedSections.includes(currentSection)) {
        setCompletedSections([...completedSections, currentSection]);
        
        // Auto-advance to next section if enforcing order
        if (enforceOrder && currentSection < 6) {
          setTimeout(() => setCurrentSection(currentSection + 1), 1000);
        }
      }
    }
  };

  const resetDemo = () => {
    setCurrentSection(1);
    setCompletedSections([]);
    
    // Reset progress
    sectionProgress.set(1, { completed: 0, total: 17 });
    sectionProgress.set(2, { completed: 0, total: 35 });
    sectionProgress.set(3, { completed: 0, total: 8 });
    sectionProgress.set(4, { completed: 0, total: 20 });
    sectionProgress.set(5, { completed: 0, total: 10 });
    sectionProgress.set(6, { completed: 0, total: 10 });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-[#005DAA]" />
            <span>SectionTabNavigatorLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Interactive section navigation with progress tracking and sequential completion
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
            <ReusableButton
              rsaStyle="primary"
              onClick={simulateProgress}
              icon={PlayCircle}
              size="sm"
            >
              Simulate Progress
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="reset"
              onClick={resetDemo}
              icon={RotateCcw}
              size="sm"
            >
              Reset Demo
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => setEnforceOrder(!enforceOrder)}
              icon={Settings}
              size="sm"
            >
              {enforceOrder ? 'Disable' : 'Enable'} Order
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="warning"
              onClick={() => setDisabled(!disabled)}
              size="sm"
            >
              {disabled ? 'Enable' : 'Disable'} Navigation
            </ReusableButton>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <Badge variant="outline" className="mb-2">Current Section</Badge>
              <p className="font-semibold">Section {currentSection}</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Completed</Badge>
              <p className="font-semibold">{completedSections.length} of 6 sections</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Settings</Badge>
              <p className="text-sm">
                Order: {enforceOrder ? 'Enforced' : 'Free'} | 
                Navigation: {disabled ? 'Disabled' : 'Enabled'}
              </p>
            </div>
          </div>

          {/* Main Component Demo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Interactive Section Navigator
            </h3>
            
            <SectionTabNavigatorLegoBlock
              currentSection={currentSection}
              completedSections={completedSections}
              onSectionChange={handleSectionChange}
              sectionProgress={sectionProgress}
              enforceOrder={enforceOrder}
              disabled={disabled}
            />
          </div>

          {/* Usage Instructions */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Demo Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Simulate Progress:</strong> Add progress to current section</p>
              <p><strong>Reset Demo:</strong> Return to initial state</p>
              <p><strong>Toggle Order:</strong> Enable/disable sequential completion</p>
              <p><strong>Toggle Navigation:</strong> Enable/disable all section clicks</p>
              <p><strong>Click Sections:</strong> Navigate between accessible sections</p>
            </CardContent>
          </Card>

          {/* Current Progress Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section Progress Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(sectionProgress.entries()).map(([sectionId, progress]) => {
                  const isCompleted = completedSections.includes(sectionId);
                  const isCurrent = currentSection === sectionId;
                  const progressPercent = Math.round((progress.completed / progress.total) * 100);
                  
                  return (
                    <div 
                      key={sectionId}
                      className={`p-3 rounded-lg border ${
                        isCompleted ? 'bg-green-50 border-green-200' :
                        isCurrent ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Section {sectionId}</span>
                        <Badge variant={isCompleted ? 'default' : 'outline'}>
                          {progressPercent}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {progress.completed} of {progress.total} questions
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}