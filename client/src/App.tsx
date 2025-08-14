import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UseCaseProvider } from "./contexts/UseCaseContext";
import HomePage from "./pages/HomePage";
import ProcessActivityTest from "./components/lego-blocks/ProcessActivityTest";
import QuestionLegoBlockDemo from "./components/lego-blocks/QuestionLegoBlockDemo";
import SectionLegoBlockDemo from "./components/lego-blocks/SectionLegoBlockDemo";
import SmartRatingLegoBlockDemo from "./components/lego-blocks/SmartRatingLegoBlockDemo";
import RankingLegoBlockDemo from "./components/lego-blocks/RankingLegoBlockDemo";
import CurrencyInputLegoBlockDemo from "./components/lego-blocks/CurrencyInputLegoBlockDemo";
import PercentageAllocationLegoBlockDemo from "./components/lego-blocks/PercentageAllocationLegoBlockDemo";
import ScoringDashboardDemo from "./components/lego-blocks/ScoringDashboardDemo";
import AssessmentResultsDashboard from "./components/lego-blocks/AssessmentResultsDashboard";
import ResponseExportDemo from "./components/lego-blocks/ResponseExportDemo";
import RSAAssessmentLandingPage from "./components/RSAAssessmentLandingPage";
import SurveyJsAssessment from "./pages/SurveyJsAssessment";
import StandaloneSurveyDemo from "./pages/StandaloneSurveyDemo";
import AIRoadmapPage from "./pages/AIRoadmapPage";
import { AssessmentSessionStart } from "./components/AssessmentSessionStart";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/test" component={ProcessActivityTest} />
      <Route path="/question-demo" component={QuestionLegoBlockDemo} />
      <Route path="/section-demo" component={SectionLegoBlockDemo} />
      <Route path="/smart-rating-demo" component={SmartRatingLegoBlockDemo} />
      <Route path="/ranking-demo" component={RankingLegoBlockDemo} />
      <Route path="/currency-demo" component={CurrencyInputLegoBlockDemo} />
      <Route path="/allocation-demo" component={PercentageAllocationLegoBlockDemo} />

      <Route path="/roadmap" component={AIRoadmapPage} />
      <Route path="/assessment" component={() => <RSAAssessmentLandingPage />} />
      <Route path="/assessment/start" component={() => 
        <AssessmentSessionStart 
          onSessionStarted={(sessionId) => {
            // Navigate to the actual assessment with the session
            window.location.href = '/assessment/take';
          }}
        />
      } />
      <Route path="/assessment/take" component={() => 
        <SurveyJsAssessment />
      } />
      <Route path="/assessment/surveyjs" component={() => 
        <SurveyJsAssessment />
      } />

      <Route path="/surveyjs-standalone" component={StandaloneSurveyDemo} />

      <Route path="/scoring-demo" component={ScoringDashboardDemo} />
      <Route path="/export-demo" component={ResponseExportDemo} />
      <Route path="/results/:responseId" component={({ params: { responseId } }) => 
        <AssessmentResultsDashboard 
          responseId={responseId}
        />
      } />
      <Route path="/results-demo" component={() => 
        <AssessmentResultsDashboard 
          assessmentState={{ 
            isCompleted: true, 
            responseId: "demo-123",
            totalScore: 85,
            completedAt: new Date().toISOString(),
            maturityScores: {
              overallAverage: 4.2,
              maturityLevels: {
                'AI Strategy': { average: 4.5, level: 'Managed', percentage: 90 },
                'Data Management': { average: 3.8, level: 'Defined', percentage: 76 },
                'Technology Infrastructure': { average: 4.0, level: 'Managed', percentage: 80 },
                'Talent & Skills': { average: 3.5, level: 'Defined', percentage: 70 },
                'Risk & Ethics': { average: 4.3, level: 'Managed', percentage: 86 }
              }
            }
          }}
          onRetake={() => alert('Retake assessment clicked!')}
        />
      } />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UseCaseProvider>
          <Toaster />
          <Router />
        </UseCaseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
