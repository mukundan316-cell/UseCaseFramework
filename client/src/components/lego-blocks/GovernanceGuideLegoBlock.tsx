import { User, BarChart3, Shield, Rocket, CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import type { ElementType } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TomConfig, GateDefinition, PhaseTransitionRule, TomPhase } from '@shared/tom';
import { useEngagement } from '@/contexts/EngagementContext';
import { Badge } from '@/components/ui/badge';

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

function buildGates(gateDefinitions?: GateDefinition[]): GateStep[] {
  if (!gateDefinitions || gateDefinitions.length === 0) {
    return [];
  }
  
  return [...gateDefinitions]
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
    if (!currentGates || gates.length === 0) return 'pending';
    
    const gate = gates[index];
    if (!gate) return 'pending';
    const passed = currentGates[gate.id];
    
    if (passed) return 'passed';
    
    const previousPassed = index === 0 || gates.slice(0, index).every(g => currentGates[g.id]);
    if (previousPassed) return 'current';
    
    return 'pending';
  };
  
  // Show empty state if no gates configured
  if (gates.length === 0) {
    return (
      <div className="space-y-6" data-testid="governance-guide">
        <div className="text-center pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900" data-testid="text-guide-title">Governance Flow</h3>
          <p className="text-sm text-gray-500 mt-1" data-testid="text-guide-subtitle">
            Following NIST AI RMF & ISO 42001 best practices
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No governance gates configured for this client.</p>
          <p className="text-xs text-gray-400 mt-1">Configure gates in Admin → TOM Configuration.</p>
        </div>
        
        {/* Still show phase flow if transitions exist */}
        <GateToPhaseFlowDiagram 
          phases={tomConfig?.phases || []}
          phaseTransitions={tomConfig?.phaseTransitions || []}
          gateDefinitions={[]}
        />
      </div>
    );
  }

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
      
      {/* Gate-to-Phase Flow Diagram */}
      <GateToPhaseFlowDiagram 
        phases={tomConfig?.phases || []}
        phaseTransitions={tomConfig?.phaseTransitions || []}
        gateDefinitions={gates}
      />
    </div>
  );
}

function GateToPhaseFlowDiagram({ 
  phases, 
  phaseTransitions, 
  gateDefinitions 
}: { 
  phases: TomPhase[];
  phaseTransitions: PhaseTransitionRule[];
  gateDefinitions: GateStep[];
}) {
  const getPhaseById = (id: string) => phases.find(p => p.id === id);
  const getGateById = (id: string) => gateDefinitions.find(g => g.id === id);
  
  // Show empty state if no transitions configured
  if (phaseTransitions.length === 0) {
    return (
      <div className="pt-6 border-t border-gray-100" data-testid="gate-phase-flow">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-gray-900">Phase Transition Flow</h4>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <ArrowRight className="h-6 w-6 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No phase transition rules configured.</p>
          <p className="text-xs text-gray-400 mt-1">Configure rules in Admin → Phase Management.</p>
        </div>
      </div>
    );
  }
  
  // Sort transitions by fromPhase order for better visualization
  const sortedTransitions = [...phaseTransitions].sort((a, b) => {
    const fromA = getPhaseById(a.fromPhase);
    const fromB = getPhaseById(b.fromPhase);
    return (fromA?.order || 0) - (fromB?.order || 0);
  });
  
  return (
    <div className="pt-6 border-t border-gray-100" data-testid="gate-phase-flow">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-gray-900">Phase Transition Flow</h4>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Each arrow shows which gate must be passed to move between phases
      </p>
      
      <div className="space-y-2">
        {sortedTransitions.map((transition) => {
          const fromPhase = getPhaseById(transition.fromPhase);
          const toPhase = getPhaseById(transition.toPhase);
          const gate = transition.requiredGate !== 'none' ? getGateById(transition.requiredGate) : null;
          
          // Skip if phases don't exist (graceful handling)
          if (!fromPhase || !toPhase) return null;
          
          return (
            <div 
              key={`${transition.fromPhase}-${transition.toPhase}`}
              className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100"
              data-testid={`flow-${transition.fromPhase}-${transition.toPhase}`}
            >
              <Badge 
                variant="outline" 
                className="text-xs flex-shrink-0"
                style={{ borderColor: fromPhase.color, color: fromPhase.color }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1.5" 
                  style={{ backgroundColor: fromPhase.color }} 
                />
                {fromPhase.name}
              </Badge>
              
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                <div className="h-px flex-1 bg-gray-300" />
                {gate ? (
                  <div 
                    className="px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1"
                    style={{ backgroundColor: gate.color }}
                  >
                    <Shield className="h-3 w-3" />
                    {gate.title}
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded text-xs text-gray-400 bg-gray-100">
                    No Gate
                  </div>
                )}
                <div className="h-px flex-1 bg-gray-300" />
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
              
              <Badge 
                variant="outline" 
                className="text-xs flex-shrink-0"
                style={{ borderColor: toPhase.color, color: toPhase.color }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1.5" 
                  style={{ backgroundColor: toPhase.color }} 
                />
                {toPhase.name}
              </Badge>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>How it works:</strong> Use cases must pass the required gate before transitioning to the next phase. 
          Gates are evaluated automatically when use case data is updated.
        </p>
      </div>
    </div>
  );
}
