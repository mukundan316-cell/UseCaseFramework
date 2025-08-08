import { useState } from 'react';
import { useProcessActivityManager, ContextualProcessActivityField } from './ProcessActivityManager';

/**
 * Test component to debug Process Activity functionality
 */
export default function ProcessActivityTest() {
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const { getActivitiesForProcess, getAllProcesses, isLoading } = useProcessActivityManager();

  if (isLoading) return <div>Loading...</div>;

  const processes = getAllProcesses();
  const activitiesForProcess = getActivitiesForProcess(selectedProcess);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Process Activity Test</h2>
      
      {/* Process Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Process
        </label>
        <select 
          value={selectedProcess}
          onChange={(e) => {
            setSelectedProcess(e.target.value);
            setSelectedActivities([]); // Reset activities when process changes
          }}
          className="w-full p-2 border rounded-md"
        >
          <option value="">-- Select Process --</option>
          {processes.map(process => (
            <option key={process} value={process}>{process}</option>
          ))}
        </select>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
        <strong>Debug Info:</strong><br/>
        Selected Process: "{selectedProcess}"<br/>
        Available Activities: {activitiesForProcess.length} items<br/>
        Activities: [{activitiesForProcess.join(', ')}]<br/>
        Selected Activities: [{selectedActivities.join(', ')}]
      </div>

      {/* Contextual Process Activity Field */}
      <ContextualProcessActivityField
        selectedProcess={selectedProcess}
        selectedActivities={selectedActivities}
        onActivitiesChange={setSelectedActivities}
        helpText="This should show activities when a process is selected"
      />

      {/* Selected Activities Display */}
      {selectedActivities.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <strong>Selected Activities:</strong>
          <ul className="list-disc list-inside mt-2">
            {selectedActivities.map(activity => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}