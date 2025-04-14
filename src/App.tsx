import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatbotPage from "./pages/ChatbotPage";
import CancerDetectionPage from "./pages/CancerDetectionPage";
import MedicalReportPage from "./pages/MedicalReportPage";
import XrayMriPage from "./pages/XrayMriPage";
import HospitalsPage from "./pages/HospitalsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/cancer-detection" element={<CancerDetectionPage />} />
          <Route path="/medical-reports" element={<MedicalReportPage />} />
          <Route path="/xray-mri" element={<XrayMriPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
