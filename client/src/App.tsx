import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ui/error-boundary";
import { UseCaseProvider, useUseCases } from "./contexts/UseCaseContext";
import { EngagementProvider } from "./contexts/EngagementContext";
import HomePage from "./pages/HomePage";
import RSAAssessmentLandingPage from "./components/RSAAssessmentLandingPage";
import SurveyJsAssessment from "./pages/SurveyJsAssessment";
import AIRoadmapPage from "./pages/AIRoadmapPage";
import InsightsPage from "./pages/InsightsPage";
import { AssessmentSessionStart } from "./components/AssessmentSessionStart";
import NotFound from "@/pages/not-found";
import type { TabType } from "./types";

function TabSyncedHomePage({ tab }: { tab: TabType }) {
  const { setActiveTab } = useUseCases();
  
  useEffect(() => {
    setActiveTab(tab);
  }, [tab, setActiveTab]);
  
  return <HomePage />;
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={() => 
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        } />
        
        <Route path="/explorer" component={() => 
          <ErrorBoundary>
            <TabSyncedHomePage tab="explorer" />
          </ErrorBoundary>
        } />
        
        <Route path="/dashboard" component={() => 
          <ErrorBoundary>
            <TabSyncedHomePage tab="dashboard" />
          </ErrorBoundary>
        } />
        
        <Route path="/admin" component={() => 
          <ErrorBoundary>
            <TabSyncedHomePage tab="admin" />
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
              <EngagementProvider>
                <UseCaseProvider>
                  <Toaster />
                  <Router />
                </UseCaseProvider>
              </EngagementProvider>
            </ErrorBoundary>
          </TooltipProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
