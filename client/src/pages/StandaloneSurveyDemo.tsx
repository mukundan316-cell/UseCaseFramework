import { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * Standalone Survey.js demonstration 
 * Works independently of database connections
 */
export default function StandaloneSurveyDemo() {
  const [, setLocation] = useLocation();
  const [survey, setSurvey] = useState<Model | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Enhanced RSA AI Assessment Survey Configuration
    const surveyJson = {
      title: "RSA AI Strategy Assessment (Survey.js Integration)",
      description: "Comprehensive AI readiness evaluation powered by Survey.js",
      showProgressBar: "top",
      progressBarType: "questions",
      questionTitleLocation: "top", 
      showQuestionNumbers: "on",
      completeText: "Complete Assessment",
      pageNextText: "Next Section →",
      pagePrevText: "← Previous Section",
      pages: [
        {
          name: "companyProfile",
          title: "1. Company Profile & Business Context",
          elements: [
            {
              type: "panel",
              name: "companyInfo",
              title: "Company Information",
              elements: [
                {
                  type: "text",
                  name: "companyName",
                  title: "Company Name",
                  isRequired: true,
                  placeholder: "Enter your company name"
                },
                {
                  type: "text",
                  name: "gwp",
                  title: "Gross Written Premium (GWP) in millions USD",
                  inputType: "number",
                  isRequired: true,
                  placeholder: "e.g., 2500"
                },
                {
                  type: "radiogroup",
                  name: "companyTier",
                  title: "Company Tier Classification",
                  isRequired: true,
                  choices: [
                    { value: "small", text: "Small Insurer (Under $100M GWP)" },
                    { value: "mid", text: "Mid-tier Insurer ($100M-$3B GWP)" },
                    { value: "large", text: "Large Insurer (Over $3B GWP)" }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "businessLines",
          title: "2. Business Lines & Market Focus",
          elements: [
            {
              type: "checkbox",
              name: "primaryMarkets",
              title: "Primary Insurance Markets (Select all that apply)",
              isRequired: true,
              choices: [
                { value: "personal", text: "Personal Lines" },
                { value: "commercial", text: "Commercial Lines" },
                { value: "specialty", text: "Specialty Insurance" },
                { value: "reinsurance", text: "Reinsurance" },
                { value: "life", text: "Life Insurance" },
                { value: "health", text: "Health Insurance" }
              ]
            },
            {
              type: "rating",
              name: "digitalMaturity",
              title: "Current Digital Maturity Level",
              description: "Rate your organization's current digital transformation maturity",
              isRequired: true,
              rateMin: 1,
              rateMax: 5,
              minRateDescription: "1 - Traditional/Manual",
              maxRateDescription: "5 - Fully Digital/Automated"
            }
          ]
        },
        {
          name: "aiReadiness", 
          title: "3. AI Strategy & Technology Readiness",
          elements: [
            {
              type: "checkbox",
              name: "aiInterests",
              title: "AI Capabilities of Greatest Interest",
              description: "Select the AI capabilities most relevant to your strategic priorities",
              choices: [
                { value: "underwriting", text: "Automated Underwriting & Risk Assessment" },
                { value: "claims", text: "Claims Processing & Fraud Detection" },
                { value: "pricing", text: "Dynamic Pricing & Product Optimization" },
                { value: "customer", text: "Customer Experience & Personalization" },
                { value: "operations", text: "Operational Efficiency & Process Automation" },
                { value: "analytics", text: "Predictive Analytics & Business Intelligence" },
                { value: "compliance", text: "Regulatory Compliance & Risk Management" }
              ]
            },
            {
              type: "matrix",
              name: "dataReadiness",
              title: "Data Infrastructure Assessment",
              description: "Evaluate your current data capabilities across key areas",
              columns: [
                { value: 1, text: "Poor" },
                { value: 2, text: "Fair" },
                { value: 3, text: "Good" },
                { value: 4, text: "Very Good" },
                { value: 5, text: "Excellent" }
              ],
              rows: [
                { value: "quality", text: "Data Quality & Consistency" },
                { value: "integration", text: "Data Integration & Accessibility" },
                { value: "governance", text: "Data Governance & Security" },
                { value: "analytics", text: "Analytics Infrastructure" }
              ],
              isRequired: true
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

    // Custom styling for better integration
    model.applyTheme({
      "colorPalette": "light",
      "isPanelless": false
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
                className="flex items-center gap-2"
              >
                <Home size={16} />
                Home
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/assessment')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Assessment Options
              </Button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Survey.js Integration Demo
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Survey.js Integration Demonstration
            </CardTitle>
            <p className="text-center text-gray-600">
              This demonstrates Survey.js library integrated with the RSA AI Assessment framework, 
              showcasing advanced question types and responsive design.
            </p>
          </CardHeader>
          <CardContent>
            {!results ? (
              <div className="space-y-6">
                {survey && (
                  <div className="survey-container">
                    <Survey model={survey} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-600 mb-4">
                    🎉 Assessment Completed Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your responses have been captured. In a production environment, 
                    these would be saved to the database and used for AI readiness scoring.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4 text-lg">Captured Response Data:</h4>
                  <div className="bg-white p-4 rounded border overflow-auto max-h-96">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button onClick={resetSurvey} variant="outline">
                    Take Assessment Again
                  </Button>
                  <Button onClick={() => setLocation('/assessment')}>
                    Back to Assessment Options
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Survey.js Integration Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Enhanced Question Types</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Matrix questions for complex evaluations</li>
                  <li>• Rating scales with custom descriptions</li>
                  <li>• Multi-select checkboxes with validation</li>
                  <li>• Responsive design across devices</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Built-in Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Progress tracking and navigation</li>
                  <li>• Form validation and error handling</li>
                  <li>• Conditional logic and branching</li>
                  <li>• Professional styling and themes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}