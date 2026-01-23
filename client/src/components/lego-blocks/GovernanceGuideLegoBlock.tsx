import { User, BarChart3, Shield, Rocket, CheckCircle2 } from 'lucide-react';
import type { ElementType } from 'react';

interface GovernanceGuideProps {
  currentGates?: {
    operatingModel: boolean;
    intake: boolean;
    rai: boolean;
    activation: boolean;
  };
}

interface GateStep {
  id: string;
  title: string;
  subtitle: string;
  icon: ElementType;
  requirements: string[];
  principle: string;
  color: string;
  bgClass: string;
  borderClass: string;
}

const gates: GateStep[] = [
  {
    id: 'operating-model',
    title: 'Operating Model',
    subtitle: 'Accountability',
    icon: User,
    requirements: [
      'Primary Business Owner',
      'Business Function assigned',
      'Status beyond Discovery'
    ],
    principle: 'Accountability and organizational alignment must be established before AI work begins',
    color: '#3C2CDA',
    bgClass: 'bg-[#3C2CDA]',
    borderClass: 'border-[#3C2CDA]'
  },
  {
    id: 'intake',
    title: 'Intake & Prioritization',
    subtitle: 'Assessment',
    icon: BarChart3,
    requirements: ['Complete 10-lever scoring (Impact & Effort)'],
    principle: 'Must be properly assessed before building',
    color: '#1D86FF',
    bgClass: 'bg-[#1D86FF]',
    borderClass: 'border-[#1D86FF]'
  },
  {
    id: 'rai',
    title: 'Responsible AI',
    subtitle: 'Compliance',
    icon: Shield,
    requirements: ['Complete RAI questionnaire (5 fields)'],
    principle: 'Must clear ethical/compliance review',
    color: '#14CBDE',
    bgClass: 'bg-[#14CBDE]',
    borderClass: 'border-[#14CBDE]'
  },
  {
    id: 'activation',
    title: 'Activation',
    subtitle: 'Enter Portfolio',
    icon: Rocket,
    requirements: ['All gates passed'],
    principle: 'Ready for TOM lifecycle tracking',
    color: '#07125E',
    bgClass: 'bg-[#07125E]',
    borderClass: 'border-[#07125E]'
  }
];

export default function GovernanceGuideLegoBlock({ currentGates }: GovernanceGuideProps) {
  const getGateStatus = (index: number): 'passed' | 'current' | 'pending' => {
    if (!currentGates) return 'pending';
    
    const gateKeys = ['operatingModel', 'intake', 'rai', 'activation'] as const;
    const passed = currentGates[gateKeys[index]];
    
    if (passed) return 'passed';
    
    const previousPassed = index === 0 || currentGates[gateKeys[index - 1]];
    if (previousPassed) return 'current';
    
    return 'pending';
  };

  return (
    <div className="space-y-6" data-testid="governance-guide">
      <div className="text-center pb-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="text-guide-title">Governance Flow</h3>
        <p className="text-sm text-gray-500 mt-1" data-testid="text-guide-subtitle">
          Following NIST AI RMF & ISO 42001 best practices
        </p>
      </div>

      <div className="bg-[#3C2CDA]/10 rounded-lg p-4 border border-[#3C2CDA]/20" data-testid="text-guide-rationale">
        <p className="text-sm text-[#07125E] leading-relaxed">
          <strong>Why this order?</strong> Accountability must be established before any AI work begins. 
          Each gate ensures proper oversight at every stage.
        </p>
      </div>

      <div className="space-y-3">
        {gates.map((gate, index) => {
          const status = getGateStatus(index);
          const Icon = gate.icon;
          
          return (
            <div key={gate.id} className="relative" data-testid={`gate-step-${gate.id}`}>
              <div 
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  status === 'passed' 
                    ? 'bg-green-50 border-green-200' 
                    : status === 'current'
                    ? `bg-white border-2 ${gate.borderClass} shadow-sm`
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'passed' 
                      ? 'bg-green-500' 
                      : status === 'current'
                      ? gate.bgClass
                      : 'bg-gray-300'
                  }`}
                >
                  {status === 'passed' ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className="h-5 w-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">GATE {index + 1}</span>
                    {status === 'current' && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: gate.color }}
                        data-testid={`badge-current-${gate.id}`}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <h4 
                    className={`font-semibold ${status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}
                    data-testid={`text-gate-title-${gate.id}`}
                  >
                    {gate.title}
                  </h4>
                  <p className="text-xs text-gray-500" data-testid={`text-gate-subtitle-${gate.id}`}>{gate.subtitle}</p>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-sm" data-testid={`text-gate-requirement-${gate.id}`}>
                      <span className="text-gray-400">Requires:</span>
                      {gate.requirements.length === 1 ? (
                        <span className={`ml-2 ${status === 'pending' ? 'text-gray-500' : 'text-gray-700'}`}>
                          {gate.requirements[0]}
                        </span>
                      ) : (
                        <ul className={`list-disc list-inside mt-1 ${status === 'pending' ? 'text-gray-500' : 'text-gray-700'}`}>
                          {gate.requirements.map((req, i) => (
                            <li key={i} className="text-sm">{req}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 italic" data-testid={`text-gate-principle-${gate.id}`}>
                      "{gate.principle}"
                    </p>
                  </div>
                </div>
              </div>
              
              {index < gates.length - 1 && (
                <div 
                  className="absolute left-7 top-full h-3 w-0.5 z-0"
                  style={{ backgroundColor: status === 'passed' ? '#22c55e' : gate.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-100" data-testid="legend-status">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5" data-testid="legend-passed">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Passed</span>
          </div>
          <div className="flex items-center gap-1.5" data-testid="legend-current">
            <div className="w-3 h-3 rounded-full bg-[#3C2CDA]" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5" data-testid="legend-pending">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
