import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ui/error-boundary";
import { UseCaseProvider } from "./contexts/UseCaseContext";
import HomePage from "./pages/HomePage";
import ProcessActivityManagementBlock from "./components/lego-blocks/ProcessActivityManagementBlock";
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
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={() => 
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        } />
        <Route path="/test" component={() => 
          <ErrorBoundary>
            <ProcessActivityManagementBlock />
          </ErrorBoundary>
        } />
        <Route path="/question-demo" component={() => 
          <ErrorBoundary>
            <QuestionLegoBlockDemo />
          </ErrorBoundary>
        } />
        <Route path="/section-demo" component={() => 
          <ErrorBoundary>
            <SectionLegoBlockDemo />
          </ErrorBoundary>
        } />
        <Route path="/smart-rating-demo" component={() => 
          <ErrorBoundary>
            <SmartRatingLegoBlockDemo />
          </ErrorBoundary>
        } />
        <Route path="/ranking-demo" component={() => 
          <ErrorBoundary>
            <RankingLegoBlockDemo />
          </ErrorBoundary>
        } />
        <Route path="/currency-demo" component={() => 
          <ErrorBoundary>
            <CurrencyInputLegoBlockDemo />
          </ErrorBoundary>
        } />
        <Route path="/allocation-demo" component={() => 
          <ErrorBoundary>
            <PercentageAllocationLegoBlockDemo />
          </ErrorBoundary>
        } />

        <Route path="/roadmap" component={() => 
          <ErrorBoundary>
            <AIRoadmapPage />
          </ErrorBoundary>
        } />
        <Route path="/assessment" component={() => 
          <ErrorBoundary>
            <RSAAssessmentLandingPage />
          </ErrorBoundary>
        } />
        <Route path="/assessment/start" component={() => 
          <ErrorBoundary>
            <AssessmentSessionStart 
              onSessionStarted={(email, name) => {
                // User info collected, navigation handled by component
                console.log('User info collected:', { email, name });
              }}
            />
          </ErrorBoundary>
        } />
        <Route path="/assessment/take" component={() => 
          <ErrorBoundary>
            <SurveyJsAssessment />
          </ErrorBoundary>
        } />
        <Route path="/assessment/surveyjs" component={() => 
          <ErrorBoundary>
            <SurveyJsAssessment />
          </ErrorBoundary>
        } />

        <Route path="/surveyjs-standalone" component={() => 
          <ErrorBoundary>
            <StandaloneSurveyDemo />
          </ErrorBoundary>
        } />

        <Route path="/scoring-demo" component={() => 
          <ErrorBoundary>
            <ScoringDashboardDemo />
          </ErrorBoundary>
        } />
        <Route path="/export-demo" component={() => 
          <ErrorBoundary>
            <ResponseExportDemo />
          </ErrorBoundary>
        } />
        <Route path="/results/:responseId" component={({ params: { responseId } }) => 
          <ErrorBoundary>
            <AssessmentResultsDashboard 
              responseId={responseId}
            />
          </ErrorBoundary>
        } />
        <Route path="/results-demo" component={() => 
          <ErrorBoundary>
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
          </ErrorBoundary>
        } />
        <Route component={() => 
          <ErrorBoundary>
            <NotFound />
          </ErrorBoundary>
        } />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <TooltipProvider>
            <ErrorBoundary>
              <UseCaseProvider>
                <Toaster />
                <Router />
              </UseCaseProvider>
            </ErrorBoundary>
          </TooltipProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
