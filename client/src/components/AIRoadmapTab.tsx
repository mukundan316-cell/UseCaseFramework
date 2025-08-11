import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Target, Users, Shield, Database, Cog, TrendingUp, Building } from "lucide-react";

const AIRoadmapTab = () => {
  const roadmapPillars = [
    {
      id: 'strategy',
      title: 'Strategy & Vision',
      icon: Target,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      foundations: [
        'Define AI vision - initial use cases',
        'Size value vs. effort & risk',
        'Run initial pilots/experiments',
        'Track early benefits'
      ],
      scaleOptimize: [
        'Introduce product management practices',
        'Implement value management/FinOps for AI',
        'Launch first AI product',
        'Establish AI product portfolio and value monitoring'
      ],
    },
    {
      id: 'value',
      title: 'Value & Outcomes',
      icon: TrendingUp,
      color: 'bg-teal-600',
      lightColor: 'bg-teal-50 border-teal-200',
      textColor: 'text-teal-800',
      foundations: [
        'Identify value opportunities and business cases',
        'Establish success metrics and measurement frameworks',
        'Run initial pilot programs with clear ROI tracking',
        'Develop business case templates for AI initiatives'
      ],
      scaleOptimize: [
        'Implement comprehensive value tracking systems',
        'Scale successful pilots to production',
        'Establish portfolio-level value management',
        'Create continuous improvement feedback loops'
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: Building,
      color: 'bg-orange-600',
      lightColor: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800',
      foundations: [
        'Identify and rank initiative-cas',
        'Appoint an AI leader/operating owner',
        'Set up an initial AI team or center of excellence',
        'Form initial external partnerships'
      ],
      scaleOptimize: [
        'Define AI operating model & ways of working',
        'Set process to manage AI partnerships & vendors-IP',
        'Establish AI operating target & architecture',
        'Clarify roles & handoffs across functions',
        'Pilot governance tooling'
      ],
    },
    {
      id: 'people',
      title: 'People & Change',
      icon: Users,
      color: 'bg-yellow-600',
      lightColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      foundations: [
        'Identify AI talent needs and skill gaps',
        'Define initial training and upskilling programs',
        'Create change management communication plan',
        'Establish AI learning and development pathways'
      ],
      scaleOptimize: [
        'Deploy comprehensive AI literacy programs',
        'Implement role-specific AI competency frameworks',
        'Scale cross-functional AI collaboration',
        'Establish centers of excellence and communities of practice'
      ]
    },
    {
      id: 'risk',
      title: 'Risk & Governance',
      icon: Shield,
      color: 'bg-red-600',
      lightColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      foundations: [
        'Identify top AI risks & mitigations',
        'Define initial AI policies & ethics principles',
        'Secure buy-in for governance approach',
        'Stand up decision forums'
      ],
      scaleOptimize: [
        'Enforcement & control processes',
        'Define decision rights & RACI for AI',
        'Set cross-functional governance board',
        'Pilot governance tooling for AI'
      ],
    },
    {
      id: 'engineering',
      title: 'Engineering',
      icon: Cog,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
      foundations: [
        'Establish build-vs buy framework',
        'Select vendors/tools for initial use cases',
        'Set up a sandbox & reference architecture',
        'Design AI development & deployment pipelines'
      ],
      scaleOptimize: [
        'Implement MLOps & model lifecycle management',
        'Build enterprise AI platform & infrastructure',
        'Establish AI security & monitoring frameworks',
        'Scale automated AI testing & validation'
      ]
    },
    {
      id: 'data',
      title: 'Data',
      icon: Database,
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-800',
      foundations: [
        'Assess data quality & availability for AI',
        'Establish data access & permissions framework',
        'Create initial data pipelines for AI use cases',
        'Define data governance policies for AI'
      ],
      scaleOptimize: [
        'Establish AI data quality framework',
        'Build an enterprise AI data platform',
        'Implement data observability for AI',
        'Deliver domain data products for AI'
      ]
    }
  ];

  return (
    <div className="space-y-8">

      {/* CIO AI Roadmap */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CIO AI Roadmap — Foundations to Scale
          </h2>
          <p className="text-lg text-gray-600">
            Practical view across seven pillars
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pillars Column */}
          <div className="space-y-3">
            <Card className="p-4 bg-gray-100">
              <h3 className="text-xl font-bold text-gray-900 text-center">
                Strategic Pillars
              </h3>
            </Card>
            {roadmapPillars.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <Card key={pillar.id} className={`p-4 ${pillar.color} text-white min-h-[120px] flex items-center`}>
                  <div className="flex items-center gap-3 w-full">
                    <IconComponent className="w-6 h-6 flex-shrink-0" />
                    <span className="font-semibold text-lg">{pillar.title}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Foundations Column */}
          <div className="space-y-3">
            <Card className="p-4 bg-gray-100">
              <h3 className="text-xl font-bold text-gray-900 text-center">
                Start here
              </h3>
            </Card>
            {roadmapPillars.map((pillar) => (
              <Card key={`${pillar.id}-foundations`} className={`p-4 ${pillar.lightColor} min-h-[120px]`}>
                <ul className="space-y-2 text-sm">
                  {pillar.foundations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Scale & Optimize Column */}
          <div className="space-y-3">
            <Card className="p-4 bg-gray-600 text-white">
              <h3 className="text-xl font-bold text-center">
                Scale & optimize (advanced)
              </h3>
            </Card>
            {roadmapPillars.map((pillar) => (
              <Card key={`${pillar.id}-scale`} className={`p-4 ${pillar.lightColor} min-h-[120px]`}>
                <ul className="space-y-2 text-sm">
                  {pillar.scaleOptimize.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRoadmapTab;