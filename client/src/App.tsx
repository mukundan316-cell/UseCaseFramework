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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/test" component={ProcessActivityTest} />
      <Route path="/question-demo" component={QuestionLegoBlockDemo} />
      <Route path="/section-demo" component={SectionLegoBlockDemo} />
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
