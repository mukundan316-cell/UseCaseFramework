import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Target, Users, Shield, Database, Cog, TrendingUp, Building } from "lucide-react";
import { Link } from "wouter";

const AIRoadmapPage = () => {
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
      progress: 65
    },
    {
      id: 'value',
      title: 'Value & Outcomes',
      icon: TrendingUp,
      color: 'bg-teal-600',
      lightColor: 'bg-teal-50 border-teal-200',
      textColor: 'text-teal-800',
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
      progress: 45
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
      progress: 55
    },
    {
      id: 'people',
      title: 'People & Change',
      icon: Users,
      color: 'bg-yellow-600',
      lightColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
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
      progress: 40
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
      progress: 70
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
        'Set up a sandbox & reference architecta',
        'Gain buy-in to evolve metadata & access'
      ],
      scaleOptimize: [
        'Establish AI data quality framework',
        'Build an enterprise AI data platform',
        'Implement data observability for AI',
        'Deliver domain data products for AI'
      ],
      progress: 50
    },
    {
      id: 'data',
      title: 'Data',
      icon: Database,
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-800',
      foundations: [
        'Establish build-vs buy framework',
        'Select vendors/tools for initial use cases',
        'Set up a sandbox & reference architecta',
        'Gain buy-in to evolve metadata & access'
      ],
      scaleOptimize: [
        'Establish AI data quality framework',
        'Build an enterprise AI data platform',
        'Implement data observability for AI',
        'Deliver domain data products for AI'
      ],
      progress: 35
    }
  ];

  const overallProgress = Math.round(
    roadmapPillars.reduce((acc, pillar) => acc + pillar.progress, 0) / roadmapPillars.length
  );

  return (
    <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            RSA AI Strategy Assessment Framework
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive evaluation to unlock £10-50M in annual value
          </p>
          
          <Card className="p-6 bg-blue-50 border-blue-200">
            <p className="text-gray-700">
              This comprehensive assessment enables RSA to develop a tailored AI strategy that moves beyond current data 
              management focus to unlock £10-50M in annual value through targeted AI initiatives across Commercial and Specialty 
              insurance operations.
            </p>
          </Card>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Assessment completed. You can view your results or retake the assessment.</span>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Overall AI Readiness Progress</h2>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {overallProgress}% Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-gray-600">
              Strategic roadmap progress across seven foundational pillars
            </p>
          </div>
        </Card>

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
              <h3 className="text-xl font-bold text-gray-900 text-center p-4">
                Strategic Pillars
              </h3>
              {roadmapPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <Card key={pillar.id} className={`p-4 ${pillar.color} text-white`}>
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-6 h-6" />
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
                <Card key={`${pillar.id}-foundations`} className={`p-4 ${pillar.lightColor}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={pillar.textColor}>
                        {pillar.progress}% Complete
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {pillar.foundations.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                <Card key={`${pillar.id}-scale`} className={`p-4 ${pillar.lightColor}`}>
                  <ul className="space-y-1 text-sm">
                    {pillar.scaleOptimize.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Value Delivery */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Strategic Value Delivery
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Business Case Development</h3>
              </div>
              <p className="text-gray-700">
                Prioritize AI use cases with highest ROI potential
              </p>
            </Card>

            <Card className="p-6 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <ArrowRight className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Technology Roadmap</h3>
              </div>
              <p className="text-gray-700">
                Design implementation plans leveraging existing infrastructure
              </p>
            </Card>

            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Investment Strategy</h3>
              </div>
              <p className="text-gray-700">
                Recommend budget allocation (£500K-£10M+ annually)
              </p>
            </Card>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/assessment">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Assessment Results
            </Button>
          </Link>
          <Link href="/assessment/take">
            <Button variant="outline" size="lg">
              Retake Assessment
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Explore Use Cases
            </Button>
          </Link>
        </div>
    </div>
  );
};

export default AIRoadmapPage;