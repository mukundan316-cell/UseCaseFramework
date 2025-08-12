import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UseCaseProvider } from "./contexts/UseCaseContext";
import HomePage from "./pages/HomePage";
// Legacy LEGO blocks imports removed - using Survey.js architecture
import RSAAssessmentLandingPage from "./components/RSAAssessmentLandingPage";
import SurveyJsAssessment from "./pages/SurveyJsAssessment";
import { AssessmentSessionStart } from "./components/AssessmentSessionStart";
import { SimpleSurveyJsDemo } from "./components/SimpleSurveyJsDemo";
import StandaloneSurveyDemo from "./pages/StandaloneSurveyDemo";
import AIRoadmapPage from "./pages/AIRoadmapPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      {/* Legacy LEGO blocks demo routes removed - using Survey.js architecture */}
      <Route path="/roadmap" component={AIRoadmapPage} />
      <Route path="/assessment" component={() => <RSAAssessmentLandingPage />} />
      <Route path="/assessment/start" component={() => 
        <AssessmentSessionStart questionnaireId="91684df8-9700-4605-bc3e-2320120e5e1b" />
      } />
      <Route path="/assessment/take" component={() => 
        <SurveyJsAssessment questionnaireId="91684df8-9700-4605-bc3e-2320120e5e1b" />
      } />
      <Route path="/assessment/surveyjs" component={() => 
        <SurveyJsAssessment questionnaireId="91684df8-9700-4605-bc3e-2320120e5e1b" />
      } />
      <Route path="/surveyjs-demo" component={SimpleSurveyJsDemo} />
      <Route path="/surveyjs-standalone" component={StandaloneSurveyDemo} />
      {/* Results will be handled by Survey.js results processing */}
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
