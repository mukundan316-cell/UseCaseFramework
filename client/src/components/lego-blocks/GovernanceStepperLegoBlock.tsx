import { Check, Circle, Lock, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { GovernanceStatus, GovernanceGateStatus } from '@shared/calculations';

interface GovernanceStepperLegoBlockProps {
  governanceStatus: GovernanceStatus;
  compact?: boolean;
  className?: string;
}

function GateStep({ 
  gate, 
  isLast,
  stepNumber,
  isBlocked,
  blockedBy
}: { 
  gate: GovernanceGateStatus; 
  isLast: boolean;
  stepNumber: number;
  isBlocked?: boolean;
  blockedBy?: string;
}) {
  const getStepIcon = () => {
    if (gate.passed && !isBlocked) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
          <Check className="h-4 w-4" />
        </div>
      );
    } else if (isBlocked) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-500">
          <Lock className="h-4 w-4" />
        </div>
      );
    } else if (gate.progress > 0) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white relative">
          <span className="text-xs font-bold">{stepNumber}</span>
          <div 
            className="absolute inset-0 rounded-full border-2 border-amber-300"
            style={{
              background: `conic-gradient(transparent ${gate.progress}%, #fef3c7 ${gate.progress}%)`
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500">
          <Circle className="h-4 w-4" />
        </div>
      );
    }
  };

  const getStatusBadge = () => {
    if (gate.passed && !isBlocked) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Complete</Badge>;
    } else if (isBlocked) {
      // Show actual progress % even when blocked, with blocked indicator
      const readyText = gate.progress === 100 ? 'Ready' : `${gate.progress}%`;
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs flex items-center gap-1">
          <Lock className="h-2.5 w-2.5" />
          {readyText}
        </Badge>
      );
    } else if (gate.progress > 0) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">{gate.progress}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">Not Started</Badge>;
    }
  };

  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1 cursor-help">
            {getStepIcon()}
            <span className={`text-xs font-medium text-center max-w-[80px] ${
              gate.passed && !isBlocked ? 'text-green-700' : 
              isBlocked ? 'text-gray-400' :
              gate.progress > 0 ? 'text-amber-700' : 'text-gray-500'
            }`}>
              {gate.name}
            </span>
            {getStatusBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{gate.name} Gate</p>
            {isBlocked ? (
              <div className="text-gray-600 text-sm">
                <p className="flex items-center gap-1"><Lock className="h-3 w-3" /> Waiting for {blockedBy} gate to complete</p>
                {gate.missingFields.length === 0 && gate.progress === 100 && (
                  <p className="text-xs text-amber-600 mt-1">All fields filled - unlock by completing prior gate</p>
                )}
              </div>
            ) : gate.passed ? (
              <p className="text-green-600 text-sm">All requirements met</p>
            ) : (
              <>
                {gate.completedFields.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Completed:</p>
                    <ul className="text-xs text-green-600 list-disc ml-3">
                      {gate.completedFields.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                )}
                {gate.missingFields.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Missing:</p>
                    <ul className="text-xs text-red-600 list-disc ml-3">
                      {gate.missingFields.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
      
      {!isLast && (
        <div className={`w-12 h-0.5 mx-2 ${gate.passed && !isBlocked ? 'bg-green-500' : 'bg-gray-200'}`} />
      )}
    </div>
  );
}

export default function GovernanceStepperLegoBlock({
  governanceStatus,
  compact = false,
  className = ''
}: GovernanceStepperLegoBlockProps) {
  const gates = [
    governanceStatus.operatingModel,
    governanceStatus.intake,
    governanceStatus.rai
  ];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {gates.map((gate, idx) => {
            // Determine if this gate is blocked by a prerequisite
            let isBlocked = false;
            let blockedBy = '';
            if (idx === 1) {
              isBlocked = !governanceStatus.operatingModel.passed;
              blockedBy = 'Operating Model';
            } else if (idx === 2) {
              isBlocked = !governanceStatus.intake.passed || !governanceStatus.operatingModel.passed;
              blockedBy = !governanceStatus.operatingModel.passed ? 'Operating Model' : 'Intake';
            }
            
            return (
              <Tooltip key={gate.gate}>
                <TooltipTrigger asChild>
                  <div 
                    className={`w-3 h-3 rounded-full cursor-help ${
                      gate.passed && !isBlocked ? 'bg-green-500' : 
                      isBlocked ? 'bg-gray-300' :
                      gate.progress > 0 ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">
                    {gate.name}: {isBlocked ? `Waiting for ${blockedBy}` : gate.passed ? 'Complete' : `${gate.progress}%`}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        {governanceStatus.canActivate ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Ready to Activate
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
            <Lock className="h-3 w-3 mr-1" />
            {governanceStatus.overallProgress}% Complete
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border bg-gradient-to-r from-slate-50 to-blue-50 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Governance Gates</span>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              governanceStatus.canActivate 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            {governanceStatus.overallProgress}% Complete
          </Badge>
        </div>
        {governanceStatus.canActivate ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Ready for Activation</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-500">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Complete all gates to activate</span>
          </div>
        )}
      </div>
      
      <div className="flex items-start justify-center">
        {gates.map((gate, idx) => {
          // Determine if this gate is blocked by a prerequisite
          let isBlocked = false;
          let blockedBy = '';
          if (idx === 1) { // Intake gate - blocked if Operating Model not passed
            isBlocked = !governanceStatus.operatingModel.passed;
            blockedBy = 'Operating Model';
          } else if (idx === 2) { // RAI gate - blocked if Intake not passed
            isBlocked = !governanceStatus.intake.passed || !governanceStatus.operatingModel.passed;
            blockedBy = !governanceStatus.operatingModel.passed ? 'Operating Model' : 'Intake';
          }
          
          return (
            <GateStep 
              key={gate.gate} 
              gate={gate} 
              isLast={idx === gates.length - 1}
              stepNumber={idx + 1}
              isBlocked={isBlocked}
              blockedBy={blockedBy}
            />
          );
        })}
        
        <div className="flex items-center">
          <div className={`w-12 h-0.5 mx-2 ${governanceStatus.canActivate ? 'bg-green-500' : 'bg-gray-200'}`} />
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center gap-1 cursor-help">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  governanceStatus.canActivate 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {governanceStatus.canActivate ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-medium ${governanceStatus.canActivate ? 'text-green-700' : 'text-gray-500'}`}>
                  Activate
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    governanceStatus.canActivate 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {governanceStatus.canActivate ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {governanceStatus.canActivate ? (
                <p className="text-green-600">All governance gates passed. You can now activate this use case.</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-red-600 font-medium">Cannot activate yet</p>
                  <p className="text-xs text-muted-foreground">Complete all 3 governance gates first:</p>
                  <ul className="text-xs list-disc ml-3">
                    {!governanceStatus.operatingModel.passed && <li>Operating Model ({governanceStatus.operatingModel.progress}%)</li>}
                    {!governanceStatus.intake.passed && <li>Intake & Prioritization ({governanceStatus.intake.progress}%)</li>}
                    {!governanceStatus.rai.passed && <li>Responsible AI ({governanceStatus.rai.progress}%)</li>}
                  </ul>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}