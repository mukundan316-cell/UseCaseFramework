import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Download, 
  Users, 
  Settings, 
  TrendingUp,
  HelpCircle,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  FileText,
  Gauge,
  ClipboardCheck
} from 'lucide-react';

type UserRole = 'business' | 'strategy' | 'admin';

interface GuideSection {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
}

const platformOverview = {
  problem: [
    "Which AI use cases should we invest in? (No objective prioritization)",
    "Are they ready to move forward? (No governance checkpoints)",
    "What's the plan to deliver? (No lifecycle management)",
    "What's the real value? (No validated ROI tracking)",
    "Is it safe and compliant? (No AI risk framework)",
    "What talent do we need? (No capability planning)"
  ],
  dimensions: [
    { name: "Inventory", description: "What AI use cases do we have?", detail: "Organized by Client → Engagement" },
    { name: "Prioritization", description: "Which ones matter most?", detail: "10-lever scoring framework" },
    { name: "Lifecycle (TOM)", description: "Where is each in its journey?", detail: "Foundation → Production phases" },
    { name: "Value", description: "What's the ROI?", detail: "KPI-linked, confidence-adjusted" },
    { name: "Risk & Compliance", description: "Is it safe?", detail: "Responsible AI, NIST aligned" },
    { name: "Capability", description: "What skills/staffing do we need?", detail: "Role transitions planning" }
  ]
};

const navigationGuide = [
  { tab: "Dashboard", purpose: "Executive overview, priority matrix, summary metrics", who: "Everyone" },
  { tab: "Explorer", purpose: "Find, filter, manage individual use cases", who: "Business Users, PMO" },
  { tab: "Insights", purpose: "Deep analytics (Value, TOM, Capability, RAI)", who: "Strategy, Leadership" },
  { tab: "AI Assessment", purpose: "Complete risk/readiness questionnaires", who: "Project Leads" },
  { tab: "Admin", purpose: "Configure framework (KPIs, phases, scoring)", who: "Admins" }
];

const keyRules = [
  { rule: "Reference Library → Active Portfolio", explanation: "Use cases live in Reference Library until governance gates are cleared" },
  { rule: "Auto-Derivation", explanation: "Many fields auto-populate (phase, value estimates, capabilities) — can be overridden" },
  { rule: "Validation Required", explanation: "Values must reach 'Fully Validated' before final phases (Steady State/Operate)" },
  { rule: "Everything is Audited", explanation: "All changes are logged with timestamps for compliance" },
  { rule: "Phase ≠ Approval", explanation: "Phases are assigned for categorization; activation requires passing governance gates" }
];

const tomPhases = [
  { phase: "Foundation", description: "Initial setup, data preparation, feasibility" },
  { phase: "Build", description: "Development, model training, integration" },
  { phase: "Pilot", description: "Limited deployment, testing, validation" },
  { phase: "Production", description: "Full deployment, monitoring, optimization" },
  { phase: "Steady State", description: "Mature operation, continuous improvement" }
];

const businessUserContent = {
  role: "You add and maintain AI use cases in the system",
  keyTasks: [
    "Create new AI use cases under the correct Client/Engagement",
    "Fill out the Details tab completely",
    "Link relevant KPIs for value tracking",
    "Review and adjust auto-calculated scores if needed"
  ],
  workflow: [
    { step: "1. Select Client & Engagement", detail: "Navigate to Explorer, choose or create the right hierarchy" },
    { step: "2. Add Use Case", detail: "Click 'Add Use Case' and fill the Details tab" },
    { step: "3. Link KPIs", detail: "In the Value section, select applicable KPIs from the library" },
    { step: "4. Review Scoring", detail: "Check the Scoring tab — adjust if auto-scores don't reflect reality" },
    { step: "5. Save & Monitor", detail: "Save changes, watch for 'Focus' badges showing what's needed next" }
  ],
  whereToGo: [
    { location: "Explorer", action: "Manage use cases, search, filter" },
    { location: "CRUD Modal → Details Tab", action: "Edit use case information" },
    { location: "CRUD Modal → Scoring Tab", action: "Review/override scores" }
  ],
  tips: [
    "'Focus' badges show what data is required for each TOM phase",
    "Use the Guide tab in the modal for phase-specific requirements",
    "Bulk import via Excel is available in Admin → Import/Export"
  ]
};

const strategyContent = {
  role: "You prioritize initiatives and track portfolio health",
  keyTasks: [
    "Review the priority matrix to identify top use cases",
    "Monitor phase progression across the portfolio",
    "Validate value estimates through the approval workflow",
    "Track governance gate completion"
  ],
  workflow: [
    { step: "1. Dashboard Overview", detail: "Start with Summary Metrics and Priority Matrix" },
    { step: "2. Identify Focus Areas", detail: "Click matrix quadrants to filter high-priority use cases" },
    { step: "3. Deep Dive via Insights", detail: "Use Insights tabs for Value, TOM, Capability, RAI analysis" },
    { step: "4. Validate Values", detail: "Move use cases through validation: Unvalidated → Finance → Actuarial → Validated" },
    { step: "5. Export Reports", detail: "Generate PDF reports for executive presentations" }
  ],
  whereToGo: [
    { location: "Dashboard", action: "Priority matrix, summary metrics" },
    { location: "Insights → Value Realization", action: "ROI tracking, validation status" },
    { location: "Insights → Operating Model", action: "Phase distribution, lifecycle tracking" },
    { location: "Insights → Capability Transition", action: "Staffing requirements, role evolution" },
    { location: "Insights → Responsible AI", action: "Risk tier distribution, compliance status" }
  ],
  tips: [
    "Use the validation workflow to increase value confidence before final phases",
    "Export PDF reports include confidence-adjusted values automatically",
    "Click any use case in Insights tables to open its detail drawer"
  ]
};

const adminContent = {
  role: "You configure how the platform works",
  keyTasks: [
    "Configure the KPI Library with relevant metrics",
    "Set up TOM phase presets (NIST, RSA, or custom)",
    "Manage scoring lever definitions",
    "Handle bulk import/export operations"
  ],
  workflow: [
    { step: "1. Access Admin Tab", detail: "Navigate to Admin from the main navigation" },
    { step: "2. Configure KPIs", detail: "Add, edit, or organize KPIs by category (Insurance/Enterprise)" },
    { step: "3. Set TOM Presets", detail: "Choose or customize lifecycle phase definitions" },
    { step: "4. Manage Scoring", detail: "Adjust scoring lever weights and options" },
    { step: "5. Bulk Operations", detail: "Use Import/Export for large-scale data updates" }
  ],
  whereToGo: [
    { location: "Admin → KPI Library", action: "Manage 169+ KPIs, add custom metrics" },
    { location: "Admin → TOM Configuration", action: "Phase presets, governance gates" },
    { location: "Admin → Scoring Model", action: "Lever weights, dropdown options" },
    { location: "Admin → Import/Export", action: "Excel bulk operations, backups" },
    { location: "Admin → Client Management", action: "Create/edit Clients and Engagements" }
  ],
  tips: [
    "Changes to metadata affect all use cases — test with a sample first",
    "TOM presets can align with NIST AI RMF or ISO 42001",
    "Excel export includes all fields for external analysis"
  ]
};

function PlatformOverviewSection() {
  return (
    <div className="space-y-6" data-testid="section-platform-overview">
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-blue-600" />
          The Problem This Platform Solves
        </h4>
        <ul className="space-y-2" data-testid="list-problems">
          {platformOverview.problem.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600" data-testid={`text-problem-${idx}`}>
              <span className="text-red-400 mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          The 6 Dimensions We Track
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="grid-dimensions">
          {platformOverview.dimensions.map((dim, idx) => (
            <div key={idx} className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-lg p-3" data-testid={`card-dimension-${idx}`}>
              <div className="font-medium text-gray-900">{dim.name}</div>
              <div className="text-sm text-gray-600">{dim.description}</div>
              <div className="text-xs text-indigo-600 mt-1">{dim.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavigationGuideSection() {
  return (
    <div className="space-y-4" data-testid="section-navigation-guide">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-600" />
        Where Everything Lives
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="table-navigation">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-900">Tab</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900">Purpose</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900">Who Uses It</th>
            </tr>
          </thead>
          <tbody>
            {navigationGuide.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100" data-testid={`row-nav-${idx}`}>
                <td className="py-2 px-3 font-medium text-indigo-600">{item.tab}</td>
                <td className="py-2 px-3 text-gray-600">{item.purpose}</td>
                <td className="py-2 px-3">
                  <Badge variant="outline" className="text-xs">{item.who}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TOMPhasesSection() {
  return (
    <div className="space-y-4" data-testid="section-tom-phases">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-purple-600" />
        Target Operating Model (TOM) Phases
      </h4>
      <div className="flex flex-wrap gap-2" data-testid="list-tom-phases">
        {tomPhases.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-lg px-3 py-2 text-center min-w-[100px]" data-testid={`card-phase-${idx}`}>
              <div className="font-medium text-gray-900 text-sm">{item.phase}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
            {idx < tomPhases.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyRulesSection() {
  return (
    <div className="space-y-4" data-testid="section-key-rules">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-green-600" />
        Key Rules to Remember
      </h4>
      <div className="space-y-3" data-testid="list-rules">
        {keyRules.map((item, idx) => (
          <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-lg p-3" data-testid={`card-rule-${idx}`}>
            <div className="font-medium text-gray-900 text-sm">{item.rule}</div>
            <div className="text-xs text-gray-600 mt-1">{item.explanation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleContentSection({ 
  roleData, 
  icon,
  colorClass,
  roleId
}: { 
  roleData: typeof businessUserContent;
  icon: ReactNode;
  colorClass: string;
  roleId: string;
}) {
  return (
    <div className="space-y-6" data-testid={`guide-section-${roleId}`}>
      <div className={`bg-gradient-to-r ${colorClass} rounded-lg p-4 border`} data-testid={`text-role-summary-${roleId}`}>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="font-semibold text-gray-900">Your Role</div>
            <div className="text-sm text-gray-600">{roleData.role}</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Key Tasks
        </h4>
        <ul className="space-y-2" data-testid={`list-tasks-${roleId}`}>
          {roleData.keyTasks.map((task, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600" data-testid={`text-task-${roleId}-${idx}`}>
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              {task}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-blue-600" />
          Typical Workflow
        </h4>
        <div className="space-y-2" data-testid={`list-workflow-${roleId}`}>
          {roleData.workflow.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100" data-testid={`card-workflow-step-${roleId}-${idx}`}>
              <div className="bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{item.step}</div>
                <div className="text-xs text-gray-500">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          Where to Go
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid={`table-where-${roleId}`}>
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-900">Location</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {roleData.whereToGo.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100" data-testid={`row-where-${roleId}-${idx}`}>
                  <td className="py-2 px-3 font-medium text-indigo-600">{item.location}</td>
                  <td className="py-2 px-3 text-gray-600">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Tips
        </h4>
        <ul className="space-y-2" data-testid={`list-tips-${roleId}`}>
          {roleData.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-amber-50/50 rounded-lg p-2 border border-amber-100" data-testid={`text-tip-${roleId}-${idx}`}>
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SharedContentSections() {
  return (
    <Accordion type="multiple" defaultValue={["overview"]} className="space-y-3">
      <AccordionItem value="overview" className="border border-gray-200 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-overview">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">Platform Overview</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <PlatformOverviewSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="navigation" className="border border-gray-200 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-navigation">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold">Navigation Guide</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <NavigationGuideSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tom" className="border border-gray-200 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-tom">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple-600" />
            <span className="font-semibold">TOM Lifecycle Phases</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <TOMPhasesSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rules" className="border border-gray-200 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-rules">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-green-600" />
            <span className="font-semibold">Key Rules</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <KeyRulesSection />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function HelpGuideLegoBlock() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('business');

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50" data-testid="help-guide-block">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl" data-testid="text-help-title">Help & Guidance</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5" data-testid="text-help-description">
                Learn how to use the AI Use Case Value Framework effectively
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            className="flex items-center gap-2"
            data-testid="button-download-guide"
            aria-disabled="true"
          >
            <Download className="h-4 w-4" />
            Download Guide (Coming Soon)
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger 
              value="business" 
              className="flex items-center gap-2"
              data-testid="tab-role-business"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Business User</span>
              <span className="sm:hidden">Business</span>
            </TabsTrigger>
            <TabsTrigger 
              value="strategy" 
              className="flex items-center gap-2"
              data-testid="tab-role-strategy"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Strategy/PMO</span>
              <span className="sm:hidden">Strategy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2"
              data-testid="tab-role-admin"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Quick Reference (All Users)
              </h3>
              <SharedContentSections />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <TabsContent value="business" className="mt-0" data-testid="content-role-business">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Business User Guide
                </h3>
                <RoleContentSection 
                  roleData={businessUserContent} 
                  icon={<Users className="h-6 w-6 text-blue-600" />}
                  colorClass="from-blue-50 to-indigo-50 border-blue-200"
                  roleId="business"
                />
              </TabsContent>

              <TabsContent value="strategy" className="mt-0" data-testid="content-role-strategy">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Strategy/PMO Guide
                </h3>
                <RoleContentSection 
                  roleData={strategyContent} 
                  icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
                  colorClass="from-purple-50 to-violet-50 border-purple-200"
                  roleId="strategy"
                />
              </TabsContent>

              <TabsContent value="admin" className="mt-0" data-testid="content-role-admin">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  Admin Guide
                </h3>
                <RoleContentSection 
                  roleData={adminContent} 
                  icon={<Settings className="h-6 w-6 text-green-600" />}
                  colorClass="from-green-50 to-emerald-50 border-green-200"
                  roleId="admin"
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
