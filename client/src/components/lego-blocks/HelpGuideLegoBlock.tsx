import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { TomConfig } from '@shared/tom';
import { useEngagement } from '@/contexts/EngagementContext';
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
  Gauge,
  ClipboardCheck,
  Search,
  BarChart3,
  FileCheck,
  Shield,
  Zap,
  MousePointer,
  FolderOpen,
  PlusCircle,
  Link2,
  Eye,
  Save,
  LayoutDashboard,
  Filter,
  FileText,
  Upload,
  Database,
  Sliders,
  Building2
} from 'lucide-react';

type UserRole = 'business' | 'strategy' | 'admin';

const businessTasks = [
  { icon: PlusCircle, label: "Create Use Cases", location: "Explorer" },
  { icon: FileText, label: "Fill Details", location: "CRUD Modal" },
  { icon: Link2, label: "Link KPIs", location: "Value Tab" },
  { icon: Eye, label: "Review Scores", location: "Scoring Tab" }
];

const businessWorkflow = [
  { icon: FolderOpen, label: "Select Client", color: "#3C2CDA" },
  { icon: PlusCircle, label: "Add Use Case", color: "#1D86FF" },
  { icon: Link2, label: "Link KPIs", color: "#14CBDE" },
  { icon: Eye, label: "Review", color: "#07125E" },
  { icon: Save, label: "Save", color: "#10B981" }
];

const strategyTasks = [
  { icon: Target, label: "Priority Matrix", location: "Dashboard" },
  { icon: Gauge, label: "Track Phases", location: "Insights" },
  { icon: CheckCircle2, label: "Validate Values", location: "Value Tab" },
  { icon: Shield, label: "Check Compliance", location: "RAI Tab" }
];

const strategyWorkflow = [
  { icon: LayoutDashboard, label: "Dashboard", color: "#3C2CDA" },
  { icon: Filter, label: "Identify Top", color: "#1D86FF" },
  { icon: BarChart3, label: "Deep Dive", color: "#14CBDE" },
  { icon: CheckCircle2, label: "Validate", color: "#07125E" },
  { icon: FileText, label: "Export", color: "#10B981" }
];

const adminTasks = [
  { icon: Building2, label: "Manage Clients", location: "Admin → Data" },
  { icon: Gauge, label: "Configure TOM", location: "Admin → TOM" },
  { icon: Database, label: "Configure KPIs", location: "Admin → Library" },
  { icon: Upload, label: "Import/Export", location: "Admin → Data" }
];

const adminWorkflow = [
  { icon: Settings, label: "Admin Tab", color: "#3C2CDA" },
  { icon: Building2, label: "Clients", color: "#1D86FF" },
  { icon: Gauge, label: "TOM Config", color: "#14CBDE" },
  { icon: Database, label: "Library", color: "#07125E" },
  { icon: Upload, label: "Import/Export", color: "#10B981" }
];

const businessStepGuides = [
  {
    id: 'create',
    title: 'Create a New Use Case',
    icon: PlusCircle,
    color: '#3C2CDA',
    steps: [
      { step: 1, action: 'Go to Explorer tab' },
      { step: 2, action: 'Click "+ Add Use Case" button' },
      { step: 3, action: 'Fill in Title, Description, and Business Function' },
      { step: 4, action: 'Assign a Primary Business Owner' },
      { step: 5, action: 'Save to create the use case' }
    ]
  },
  {
    id: 'details',
    title: 'Fill Out Details Tab',
    icon: FileText,
    color: '#10B981',
    steps: [
      { step: 1, action: 'Title: Clear, descriptive name for the AI initiative' },
      { step: 2, action: 'Description: Business problem and proposed AI solution' },
      { step: 3, action: 'Business Function: Primary department (Claims, UW, etc.)' },
      { step: 4, action: 'Primary Owner: Accountable business stakeholder' },
      { step: 5, action: 'Optional: Add Line of Business, Geography, Segment' }
    ]
  },
  {
    id: 'scoring',
    title: 'Complete 10-Lever Scoring',
    icon: BarChart3,
    color: '#1D86FF',
    steps: [
      { step: 1, action: 'Open Intake & Scoring tab in the use case modal' },
      { step: 2, action: 'Impact Levers: Rate Revenue, Cost, Risk, Experience, Strategy (1-5)' },
      { step: 3, action: 'Effort Levers: Rate Data, Technical, Change, Model Risk, Adoption (1-5)' },
      { step: 4, action: 'Each dropdown shows contextual descriptions for scores' },
      { step: 5, action: 'All 10 levers required for Gate 2 clearance' }
    ]
  },
  {
    id: 'scoring-guide',
    title: 'Understanding Score Values',
    icon: Sliders,
    color: '#F59E0B',
    steps: [
      { step: 1, action: 'Score 1: Lowest impact/readiness (e.g., "No revenue impact")' },
      { step: 2, action: 'Score 2: Minor benefits (e.g., "<5% cost savings")' },
      { step: 3, action: 'Score 3: Moderate impact (e.g., "5-15% improvement")' },
      { step: 4, action: 'Score 4: Significant value (e.g., "15-30% gains")' },
      { step: 5, action: 'Score 5: Transformational (e.g., ">30% or strategic priority")' }
    ]
  },
  {
    id: 'value',
    title: 'Link KPIs for Value Tracking',
    icon: Link2,
    color: '#8B5CF6',
    steps: [
      { step: 1, action: 'Open a use case and go to Value tab' },
      { step: 2, action: 'Select a Process that matches the use case' },
      { step: 3, action: 'Browse available KPIs for that process' },
      { step: 4, action: 'Click "Link" to associate KPIs' },
      { step: 5, action: 'Enter baseline and target values' }
    ]
  },
  {
    id: 'operating-model',
    title: 'Set Operating Model',
    icon: Building2,
    color: '#14CBDE',
    steps: [
      { step: 1, action: 'Open Operating Model tab in the use case modal' },
      { step: 2, action: 'Assign Primary Business Owner (required for Gate 1)' },
      { step: 3, action: 'Select Business Function for the initiative' },
      { step: 4, action: 'Optionally add sponsors and stakeholders' },
      { step: 5, action: 'Gate 1 clears when owner and function are set' }
    ]
  }
];

const strategyStepGuides = [
  {
    id: 'matrix',
    title: 'Use Priority Matrix',
    icon: Target,
    color: '#3C2CDA',
    steps: [
      { step: 1, action: 'Go to Dashboard View' },
      { step: 2, action: 'Review the 4-quadrant matrix' },
      { step: 3, action: 'Quick Win = High Value + Low Effort' },
      { step: 4, action: 'Strategic Bet = High Value + High Effort' },
      { step: 5, action: 'Click bubbles to open use case details' }
    ]
  },
  {
    id: 'insights',
    title: 'Analyze Portfolio Insights',
    icon: BarChart3,
    color: '#8B5CF6',
    steps: [
      { step: 1, action: 'Go to Insights tab' },
      { step: 2, action: 'Value Realization: ROI metrics and KPI tracking' },
      { step: 3, action: 'Operating Model: Phase distribution' },
      { step: 4, action: 'Capability Transition: Staffing and timeline' },
      { step: 5, action: 'Responsible AI: Risk tier breakdown' }
    ]
  },
  {
    id: 'validate',
    title: 'Validate Value Estimates',
    icon: CheckCircle2,
    color: '#10B981',
    steps: [
      { step: 1, action: 'Open use case → Value tab' },
      { step: 2, action: 'Review linked KPIs and estimates' },
      { step: 3, action: 'Set validation status (Unvalidated → Pending → Validated)' },
      { step: 4, action: 'Adjust conservative factor if needed' },
      { step: 5, action: 'Fully validated values unlock final TOM phases' }
    ]
  }
];

const adminStepGuides = [
  {
    id: 'client',
    title: 'Manage Clients',
    icon: Building2,
    color: '#3C2CDA',
    steps: [
      { step: 1, action: 'Go to Admin → Data Management' },
      { step: 2, action: 'Use the Client dropdown in the header' },
      { step: 3, action: 'Each client has its own TOM config and use cases' },
      { step: 4, action: 'Export data before switching clients' }
    ]
  },
  {
    id: 'tom',
    title: 'Configure TOM (Target Operating Model)',
    icon: Gauge,
    color: '#14CBDE',
    steps: [
      { step: 1, action: 'Go to Admin → TOM tab' },
      { step: 2, action: 'Select TOM Preset (NIST, Enterprise, or Custom)' },
      { step: 3, action: 'Review Gate Definitions (requirements for each gate)' },
      { step: 4, action: 'Configure Phase Transition Rules (which gate unlocks which phase)' },
      { step: 5, action: 'Use "Re-derive Phases" to recalculate all use cases' }
    ]
  },
  {
    id: 'gates',
    title: 'Configure Governance Gates',
    icon: Shield,
    color: '#F59E0B',
    steps: [
      { step: 1, action: 'Gates control when use cases can move to active status' },
      { step: 2, action: 'Gate 1 (Operating Model): Requires business owner assigned' },
      { step: 3, action: 'Gate 2 (Intake): Requires 10-lever scoring complete' },
      { step: 4, action: 'Gate 3 (RAI): Requires Responsible AI questionnaire complete' },
      { step: 5, action: 'Gates are enforced only when activating use cases' }
    ]
  },
  {
    id: 'kpi',
    title: 'Configure KPI Library',
    icon: Database,
    color: '#8B5CF6',
    steps: [
      { step: 1, action: 'Go to Admin → Library tab' },
      { step: 2, action: '169+ KPIs available across Insurance and Enterprise categories' },
      { step: 3, action: 'Toggle between Insurance and Enterprise value chains' },
      { step: 4, action: 'KPIs are linked to use cases in the Value tab' }
    ]
  },
  {
    id: 'import',
    title: 'Import/Export Data',
    icon: Upload,
    color: '#10B981',
    steps: [
      { step: 1, action: 'Go to Admin → Data Management tab' },
      { step: 2, action: 'Export Data: Download use cases and metadata as JSON' },
      { step: 3, action: 'Import Data: Upload JSON configuration file' },
      { step: 4, action: 'Always export before making major changes' }
    ]
  }
];

const defaultTomPhases = [
  { name: "Foundation", icon: Building2, color: "#6366F1", desc: "Setup & Feasibility" },
  { name: "Build", icon: Zap, color: "#8B5CF6", desc: "Development" },
  { name: "Pilot", icon: Target, color: "#A855F7", desc: "Testing" },
  { name: "Production", icon: Gauge, color: "#D946EF", desc: "Full Deploy" },
  { name: "Steady State", icon: CheckCircle2, color: "#10B981", desc: "Mature Ops" }
];

const phaseIconMap: Record<string, any> = {
  foundation: Building2,
  build: Zap,
  pilot: Target,
  scale: Gauge,
  production: Gauge,
  steady_state: CheckCircle2,
  operate: CheckCircle2,
  strategic: Target,
  transition: Zap,
  ideation: Lightbulb,
  default: Gauge
};

const dimensions = [
  { icon: FolderOpen, name: "Inventory", desc: "Track all use cases", color: "#3C2CDA" },
  { icon: Target, name: "Prioritization", desc: "10-lever scoring", color: "#1D86FF" },
  { icon: Gauge, name: "Lifecycle", desc: "TOM phases", color: "#14CBDE" },
  { icon: BarChart3, name: "Value", desc: "KPI-linked ROI", color: "#8B5CF6" },
  { icon: Shield, name: "Compliance", desc: "NIST AI RMF", color: "#F59E0B" },
  { icon: Users, name: "Capability", desc: "Staffing plans", color: "#10B981" }
];

const navGuide = [
  { icon: LayoutDashboard, tab: "Dashboard", purpose: "Priority matrix & metrics", who: "All" },
  { icon: Search, tab: "Explorer", purpose: "Search & manage use cases", who: "Business" },
  { icon: BarChart3, tab: "Insights", purpose: "Deep analytics", who: "Strategy" },
  { icon: FileCheck, tab: "Assessment", purpose: "Questionnaires", who: "Project Leads" },
  { icon: Settings, tab: "Admin", purpose: "Configure framework", who: "Admins" }
];

function TaskCard({ icon: Icon, label, location }: { icon: any; label: string; location: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center shadow-sm hover:shadow-md transition-shadow cursor-default"
      data-testid={`card-task-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-3 rounded-full">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>
      <span className="font-medium text-gray-900 text-sm">{label}</span>
      <Badge variant="outline" className="text-xs">{location}</Badge>
    </motion.div>
  );
}

function AdminStepGuide({ guide }: { guide: typeof adminStepGuides[0] }) {
  const Icon = guide.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
      data-testid={`admin-guide-${guide.id}`}
    >
      <div 
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: `${guide.color}10`, borderLeft: `4px solid ${guide.color}` }}
      >
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${guide.color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color: guide.color }} />
        </div>
        <span className="font-semibold text-gray-900 text-sm">{guide.title}</span>
      </div>
      <div className="p-3 space-y-2">
        {guide.steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2" data-testid={`step-${guide.id}-${step.step}`}>
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold mt-0.5"
              style={{ backgroundColor: guide.color }}
            >
              {step.step}
            </div>
            <span className="text-sm text-gray-700">{step.action}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DetailGuides({ guides, title }: { guides: typeof adminStepGuides; title: string }) {
  return (
    <div className="space-y-4" data-testid="detail-guides">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <AdminStepGuide key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}

function AdminDetailGuides() {
  return <DetailGuides guides={adminStepGuides} title="Step-by-Step Admin Guides" />;
}

function BusinessDetailGuides() {
  return <DetailGuides guides={businessStepGuides} title="Step-by-Step Business User Guides" />;
}

function StrategyDetailGuides() {
  return <DetailGuides guides={strategyStepGuides} title="Step-by-Step Strategy Guides" />;
}

function WorkflowStep({ step, isLast, index }: { step: { icon: any; label: string; color: string }; isLast: boolean; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div 
        className="flex flex-col items-center"
        data-testid={`workflow-step-${index}`}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: step.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium mt-1 text-gray-700">{step.label}</span>
      </div>
      {!isLast && (
        <ArrowRight className="h-4 w-4 text-gray-400 mx-1 flex-shrink-0" />
      )}
    </motion.div>
  );
}

interface DynamicPhase {
  name: string;
  color: string;
  desc: string;
  icon: any;
}

function TOMTimeline({ phases }: { phases: DynamicPhase[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-4" data-testid="tom-timeline">
      {phases.map((phase, idx) => {
        const PhaseIcon = phase.icon;
        return (
          <motion.div
            key={phase.name}
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex flex-col items-center" data-testid={`phase-${phase.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: phase.color }}
              >
                <PhaseIcon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold mt-2 text-gray-900">{phase.name}</span>
              <span className="text-[10px] text-gray-500">{phase.desc}</span>
            </div>
            {idx < phases.length - 1 && (
              <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 mx-1" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function DimensionGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="dimension-grid">
      {dimensions.map((dim, idx) => (
        <motion.div
          key={dim.name}
          className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          data-testid={`dimension-${dim.name.toLowerCase()}`}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${dim.color}15` }}
          >
            <dim.icon className="h-5 w-5" style={{ color: dim.color }} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{dim.name}</div>
            <div className="text-xs text-gray-500">{dim.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function NavGuideGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="nav-guide-grid">
      {navGuide.map((item, idx) => (
        <motion.div
          key={item.tab}
          className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          data-testid={`nav-${item.tab.toLowerCase()}`}
        >
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-2 rounded-lg">
            <item.icon className="h-5 w-5 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{item.tab}</div>
            <div className="text-xs text-gray-500 truncate">{item.purpose}</div>
          </div>
          <Badge variant="secondary" className="text-[10px] flex-shrink-0">{item.who}</Badge>
        </motion.div>
      ))}
    </div>
  );
}

function RoleGuide({ 
  title, 
  titleIcon: TitleIcon, 
  titleColor, 
  tasks, 
  workflow, 
  tips,
  roleId,
  detailGuideType
}: { 
  title: string;
  titleIcon: any;
  titleColor: string;
  tasks: { icon: any; label: string; location: string }[];
  workflow: { icon: any; label: string; color: string }[];
  tips: string[];
  roleId: string;
  detailGuideType?: 'business' | 'strategy' | 'admin';
}) {
  const renderDetailGuides = () => {
    switch (detailGuideType) {
      case 'business':
        return <BusinessDetailGuides />;
      case 'strategy':
        return <StrategyDetailGuides />;
      case 'admin':
        return <AdminDetailGuides />;
      default:
        return null;
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      data-testid={`guide-${roleId}`}
    >
      <div 
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ backgroundColor: `${titleColor}10`, borderLeft: `4px solid ${titleColor}` }}
      >
        <TitleIcon className="h-6 w-6" style={{ color: titleColor }} />
        <div>
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Your key tasks and workflow</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-indigo-600" />
          Key Actions
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid={`tasks-${roleId}`}>
          {tasks.map((task, idx) => (
            <TaskCard key={idx} {...task} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-indigo-600" />
          Your Workflow
        </h4>
        <div className="bg-gradient-to-r from-slate-50 to-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
          <div className="flex items-start gap-2 min-w-max" data-testid={`workflow-${roleId}`}>
            {workflow.map((step, idx) => (
              <WorkflowStep key={idx} step={step} isLast={idx === workflow.length - 1} index={idx} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Quick Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid={`tips-${roleId}`}>
          {tips.map((tip, idx) => (
            <motion.div
              key={idx}
              className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              data-testid={`tip-${roleId}-${idx}`}
            >
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{tip}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {renderDetailGuides()}
    </motion.div>
  );
}

const roleConfigs = {
  business: {
    title: "Business User Guide",
    titleIcon: Users,
    titleColor: "#3C2CDA",
    tasks: businessTasks,
    workflow: businessWorkflow,
    tips: [
      "Focus badges show required data for each phase",
      "Guide tab shows phase-specific requirements",
      "Auto-derivation populates fields automatically"
    ],
    detailGuideType: 'business' as const
  },
  strategy: {
    title: "Strategy/PMO Guide",
    titleIcon: TrendingUp,
    titleColor: "#8B5CF6",
    tasks: strategyTasks,
    workflow: strategyWorkflow,
    tips: [
      "Validate value estimates before final phases",
      "PDF exports include adjusted values with validation status",
      "Click bubbles/rows to open use case details"
    ],
    detailGuideType: 'strategy' as const
  },
  admin: {
    title: "Admin Guide",
    titleIcon: Settings,
    titleColor: "#14CBDE",
    tasks: adminTasks,
    workflow: adminWorkflow,
    tips: [
      "169+ KPIs available across Insurance and Enterprise categories",
      "Choose from standard or client-specific TOM presets",
      "Always export data before making major configuration changes"
    ],
    detailGuideType: 'admin' as const
  }
};

export default function HelpGuideLegoBlock() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('business');
  const { selectedClientId } = useEngagement();
  
  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', selectedClientId],
  });

  const dynamicPhases: DynamicPhase[] = tomConfig?.phases?.length 
    ? tomConfig.phases.map(p => ({
        name: p.name,
        color: p.color,
        desc: p.description,
        icon: phaseIconMap[p.id] || phaseIconMap.default
      }))
    : defaultTomPhases;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50" data-testid="help-guide-block">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <HelpCircle className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-xl" data-testid="text-help-title">Help & Guidance</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5" data-testid="text-help-description">
                Quick visual guide to the AI Use Case Value Framework
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
            Download (Coming Soon)
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

          <div className="mt-6">
            <AnimatePresence mode="wait">
              <TabsContent value="business" className="mt-0">
                <RoleGuide {...roleConfigs.business} roleId="business" />
              </TabsContent>
              <TabsContent value="strategy" className="mt-0">
                <RoleGuide {...roleConfigs.strategy} roleId="strategy" />
              </TabsContent>
              <TabsContent value="admin" className="mt-0">
                <RoleGuide {...roleConfigs.admin} roleId="admin" />
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>

        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="dimensions" className="border border-gray-200 rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-dimensions">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold">6 Dimensions We Track</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <DimensionGrid />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tom" className="border border-gray-200 rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-tom">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-purple-600" />
                <span className="font-semibold">TOM Lifecycle Phases</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <TOMTimeline phases={dynamicPhases} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="navigation" className="border border-gray-200 rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-navigation">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Where to Go</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <NavGuideGrid />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rules" className="border border-gray-200 rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-slate-50 to-white" data-testid="accordion-rules">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Key Rules</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="rules-grid">
                {[
                  { rule: "Reference → Active", detail: "Clear governance gates first" },
                  { rule: "Auto-Derivation", detail: "Fields auto-populate, override allowed" },
                  { rule: "Validation Required", detail: "Values must be validated for final phases" },
                  { rule: "Full Audit Trail", detail: "All changes logged for compliance" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-green-50 border border-green-200 rounded-xl p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    data-testid={`rule-${idx}`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{item.rule}</div>
                    <div className="text-xs text-gray-600">{item.detail}</div>
                  </motion.div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
