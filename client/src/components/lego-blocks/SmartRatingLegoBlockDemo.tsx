import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SmartRatingLegoBlock, { SmartRatingVariant } from './SmartRatingLegoBlock';
import { cn } from '@/lib/utils';

/**
 * SmartRatingLegoBlockDemo - Showcase component for the new SmartRatingLegoBlock
 * 
 * Demonstrates all 4 variants with different configurations to showcase
 * the improved UX over ScoreSliderLegoBlock
 */
export default function SmartRatingLegoBlockDemo() {
  const [values, setValues] = useState<Record<string, number | null>>({
    descriptive: null,
    stars: null,
    maturity: null,
    capability: null,
    descriptive_small: null,
    stars_large: null,
    maturity_no_score: null,
    capability_disabled: 3
  });

  const handleChange = (key: string, value: number) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const demoQuestions = [
    {
      id: 'descriptive',
      variant: 'descriptive' as SmartRatingVariant,
      question: {
        id: 'descriptive',
        questionText: 'How would you rate your overall AI strategy alignment?',
        helpText: 'Consider both short-term tactical goals and long-term strategic vision',
        isRequired: true
      },
      size: 'md' as const,
      showScore: true,
      description: 'Descriptive variant with clear qualitative labels'
    },
    {
      id: 'stars',
      variant: 'stars' as SmartRatingVariant,
      question: {
        id: 'stars',
        questionText: 'Rate the quality of your current data infrastructure',
        helpText: 'Think about data quality, accessibility, and governance',
        isRequired: false
      },
      size: 'md' as const,
      showScore: true,
      description: 'Star rating variant for quality assessments'
    },
    {
      id: 'maturity',
      variant: 'maturity' as SmartRatingVariant,
      question: {
        id: 'maturity',
        questionText: 'What is your organization\'s AI governance maturity level?',
        helpText: 'Assess your policies, processes, and oversight mechanisms',
        isRequired: true
      },
      size: 'md' as const,
      showScore: true,
      description: 'Maturity variant for process and capability assessment'
    },
    {
      id: 'capability',
      variant: 'capability' as SmartRatingVariant,
      question: {
        id: 'capability',
        questionText: 'How advanced is your technical AI implementation capability?',
        helpText: 'Consider your team skills, tools, and infrastructure readiness',
        isRequired: true
      },
      size: 'md' as const,
      showScore: true,
      description: 'Capability variant for skill and readiness assessment'
    }
  ];

  const sizeDemos = [
    {
      id: 'descriptive_small',
      variant: 'descriptive' as SmartRatingVariant,
      question: {
        id: 'descriptive_small',
        questionText: 'Small size variant',
        helpText: 'Compact form for limited space',
        isRequired: false
      },
      size: 'sm' as const,
      showScore: true,
      description: 'Small size (sm) for compact layouts'
    },
    {
      id: 'stars_large',
      variant: 'stars' as SmartRatingVariant,
      question: {
        id: 'stars_large',
        questionText: 'Large size variant with star rating',
        helpText: 'Prominent display for important questions',
        isRequired: false
      },
      size: 'lg' as const,
      showScore: true,
      description: 'Large size (lg) for prominent display'
    }
  ];

  const configDemos = [
    {
      id: 'maturity_no_score',
      variant: 'maturity' as SmartRatingVariant,
      question: {
        id: 'maturity_no_score',
        questionText: 'Rating without score display',
        helpText: 'Focus on qualitative assessment without numerical scores',
        isRequired: false
      },
      size: 'md' as const,
      showScore: false,
      description: 'Hidden score values for qualitative focus'
    },
    {
      id: 'capability_disabled',
      variant: 'capability' as SmartRatingVariant,
      question: {
        id: 'capability_disabled',
        questionText: 'Disabled state demonstration',
        helpText: 'Shows read-only display for completed assessments',
        isRequired: false
      },
      size: 'md' as const,
      showScore: true,
      disabled: true,
      description: 'Disabled state for read-only display'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">SmartRatingLegoBlock Demo</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enhanced dropdown-style rating component with improved UX, replacing ScoreSliderLegoBlock.
          Features 4 variants, mobile-friendly design, and full accessibility support.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">Dropdown Selector</Badge>
          <Badge variant="outline">4 Variants</Badge>
          <Badge variant="outline">Mobile Friendly</Badge>
          <Badge variant="outline">Keyboard Navigation</Badge>
          <Badge variant="outline">Accessibility</Badge>
        </div>
      </div>

      {/* Main Variants */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Rating Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoQuestions.map((demo) => (
            <Card key={demo.id} className="border-2 hover:border-[#3C2CDA] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">{demo.variant}</CardTitle>
                  <Badge variant="secondary">{demo.variant}</Badge>
                </div>
                <p className="text-sm text-gray-600">{demo.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <SmartRatingLegoBlock
                  question={demo.question}
                  value={values[demo.id]}
                  onChange={(value) => handleChange(demo.id, value)}
                  variant={demo.variant}
                  size={demo.size}
                  showScore={demo.showScore}
                />
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Selected value: {values[demo.id] || 'None'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Size Variants */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Size Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sizeDemos.map((demo) => (
            <Card key={demo.id} className="border-2 hover:border-[#3C2CDA] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{demo.size.toUpperCase()} Size</CardTitle>
                  <Badge variant="outline">{demo.size}</Badge>
                </div>
                <p className="text-sm text-gray-600">{demo.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <SmartRatingLegoBlock
                  question={demo.question}
                  value={values[demo.id]}
                  onChange={(value) => handleChange(demo.id, value)}
                  variant={demo.variant}
                  size={demo.size}
                  showScore={demo.showScore}
                />
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Selected value: {values[demo.id] || 'None'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Configuration Options */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configDemos.map((demo) => (
            <Card key={demo.id} className="border-2 hover:border-[#3C2CDA] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {demo.showScore ? 'Score Hidden' : demo.disabled ? 'Disabled' : 'Configuration'}
                  </CardTitle>
                  <Badge variant={demo.disabled ? "destructive" : "secondary"}>
                    {demo.disabled ? 'disabled' : demo.showScore ? 'no-score' : 'config'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{demo.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <SmartRatingLegoBlock
                  question={demo.question}
                  value={values[demo.id]}
                  onChange={(value) => handleChange(demo.id, value)}
                  variant={demo.variant}
                  size={demo.size}
                  showScore={demo.showScore}
                  disabled={demo.disabled}
                />
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Selected value: {values[demo.id] || 'None'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Benefits Summary */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Improvements over ScoreSliderLegoBlock</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-2">Better UX</h3>
              <p className="text-sm text-green-700">
                Dropdown selector with descriptive labels is more intuitive than abstract slider values
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Mobile Friendly</h3>
              <p className="text-sm text-blue-700">
                Touch-friendly dropdown interface works better on mobile devices than sliders
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Accessibility</h3>
              <p className="text-sm text-purple-700">
                Full keyboard navigation and screen reader support with semantic HTML
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-orange-800 mb-2">4 Variants</h3>
              <p className="text-sm text-orange-700">
                Contextual variants (descriptive, stars, maturity, capability) for different use cases
              </p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Clear Feedback</h3>
              <p className="text-sm text-yellow-700">
                Icons, labels, and descriptions provide clear understanding of each rating level
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Flexible</h3>
              <p className="text-sm text-gray-700">
                Configurable sizes, score display, and disabled states for various contexts
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Current Values Summary */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Current Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(values).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium">{value || 'null'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}