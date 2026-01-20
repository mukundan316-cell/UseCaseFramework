import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ui/error-boundary";
import { UseCaseProvider } from "./contexts/UseCaseContext";
import HomePage from "./pages/HomePage";
import RSAAssessmentLandingPage from "./components/RSAAssessmentLandingPage";
import SurveyJsAssessment from "./pages/SurveyJsAssessment";
import AIRoadmapPage from "./pages/AIRoadmapPage";
import InsightsPage from "./pages/InsightsPage";
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

        <Route path="/insights" component={() => 
          <ErrorBoundary>
            <InsightsPage />
          </ErrorBoundary>
        } />
        <Route path="/insights/:subTab" component={({ params: { subTab } }) => 
          <ErrorBoundary>
            <InsightsPage defaultTab={subTab as 'value-realization' | 'operating-model' | 'capability-transition' | 'responsible-ai'} />
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
