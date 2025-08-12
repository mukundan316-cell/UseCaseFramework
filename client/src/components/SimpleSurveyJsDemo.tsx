import { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Simple Survey.js demonstration component
 * Shows basic integration without complex styling
 */
export function SimpleSurveyJsDemo() {
  const [survey, setSurvey] = useState<Model | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Create a simple survey configuration
    const surveyJson = {
      title: "RSA AI Strategy Assessment (Survey.js Demo)",
      showProgressBar: "top",
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "text",
              name: "companyName",
              title: "Company Name",
              isRequired: true
            },
            {
              type: "radiogroup",
              name: "companySize",
              title: "Company Size",
              choices: [
                "Small (1-50 employees)",
                "Medium (51-500 employees)", 
                "Large (500+ employees)"
              ]
            },
            {
              type: "checkbox",
              name: "interests",
              title: "Areas of Interest",
              choices: [
                "Artificial Intelligence",
                "Machine Learning",
                "Data Analytics",
                "Process Automation"
              ]
            }
          ]
        }
      ]
    };

    const model = new Model(surveyJson);
    
    // Handle completion
    model.onComplete.add((sender) => {
      setResults(sender.data);
      console.log('Survey completed:', sender.data);
    });

    setSurvey(model);
  }, []);

  const resetSurvey = () => {
    setResults(null);
    if (survey) {
      survey.clear();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Survey.js Integration Demo</CardTitle>
          <p className="text-sm text-gray-600">
            This demonstrates the Survey.js library integrated with our React application.
          </p>
        </CardHeader>
        <CardContent>
          {!results ? (
            <div className="space-y-4">
              {survey && <Survey model={survey} />}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">Assessment Completed!</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Results:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
              <Button onClick={resetSurvey} variant="outline">
                Take Assessment Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}