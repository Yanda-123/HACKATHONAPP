import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Appointments from "@/pages/appointments";
import Chatbot from "@/pages/chatbot";
import Questionnaire from "@/pages/questionnaire";
import VideoConsultation from "@/pages/video-consultation";
import Reminders from "@/pages/reminders";
import FacialRecognition from "@/pages/facial-recognition";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/chatbot" component={Chatbot} />
          <Route path="/questionnaire" component={Questionnaire} />
          <Route path="/video-consultation" component={VideoConsultation} />
          <Route path="/reminders" component={Reminders} />
          <Route path="/facial-recognition" component={FacialRecognition} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
