import { User, BarChart3, Shield, Rocket, CheckCircle2 } from 'lucide-react';
import type { ElementType } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TomConfig, GateDefinition } from '@shared/tom';
import { useEngagement } from '@/contexts/EngagementContext';

interface GovernanceGuideProps {
  currentGates?: Record<string, boolean>;
}

interface GateStep extends GateDefinition {
  icon: ElementType;
  bgClass: string;
  borderClass: string;
}

const gateIconMap: Record<string, ElementType> = {
  operatingModel: User,
  intake: BarChart3,
  rai: Shield
};

const DEFAULT_GATE_DEFINITIONS: GateDefinition[] = [
  {
    id: 'operatingModel',
    title: 'Operating Model',
    subtitle: 'Accountability',
    principle: 'Accountability and organizational alignment must be established before AI work begins',
    requirements: ['Primary Business Owner', 'Business Function assigned', 'Status beyond Discovery'],
    color: '#3C2CDA',
    order: 1
  },
  {
    id: 'intake',
    title: 'Intake & Prioritization',
    subtitle: 'Assessment',
    principle: 'Must be properly assessed before building',
    requirements: ['Complete 10-lever scoring (Impact & Effort)'],
    color: '#1D86FF',
    order: 2
  },
  {
    id: 'rai',
    title: 'Responsible AI',
    subtitle: 'Compliance',
    principle: 'Must clear ethical/compliance review',
    requirements: ['Complete RAI questionnaire (5 fields)'],
    color: '#14CBDE',
    order: 3
  }
];

function buildGates(gateDefinitions?: GateDefinition[]): GateStep[] {
  const defs = gateDefinitions && gateDefinitions.length > 0 
    ? gateDefinitions 
    : DEFAULT_GATE_DEFINITIONS;
  
  return defs
    .sort((a, b) => a.order - b.order)
    .map(gate => ({
      ...gate,
      icon: gateIconMap[gate.id] || User,
      bgClass: `bg-[${gate.color}]`,
      borderClass: `border-[${gate.color}]`
    }));
}

export default function GovernanceGuideLegoBlock({ currentGates }: GovernanceGuideProps) {
  const { selectedClientId } = useEngagement();
  
  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', selectedClientId],
  });
  
  const gates = buildGates(tomConfig?.gateDefinitions);
  
  const getGateStatus = (index: number): 'passed' | 'current' | 'pending' => {
    if (!currentGates) return 'pending';
    
    const gate = gates[index];
    const passed = currentGates[gate.id];
    
    if (passed) return 'passed';
    
    const previousPassed = index === 0 || gates.slice(0, index).every(g => currentGates[g.id]);
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
                    ? 'bg-white border-2 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
                style={status === 'current' ? { borderColor: gate.color } : undefined}
              >
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'passed' ? 'bg-green-500' : status === 'pending' ? 'bg-gray-300' : ''
                  }`}
                  style={status === 'current' ? { backgroundColor: gate.color } : undefined}
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
                      {(gate.requirements?.length ?? 0) === 1 ? (
                        <span className={`ml-2 ${status === 'pending' ? 'text-gray-500' : 'text-gray-700'}`}>
                          {gate.requirements?.[0]}
                        </span>
                      ) : (
                        <ul className={`list-disc list-inside mt-1 ${status === 'pending' ? 'text-gray-500' : 'text-gray-700'}`}>
                          {(gate.requirements || []).map((req, i) => (
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
