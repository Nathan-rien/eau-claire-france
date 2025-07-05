
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { analyticsService } from "@/services/analyticsService";
import Index from "./pages/Index";
import Carte from "./pages/Carte";
import CartePolluants from "./pages/CartePolluants";
import Alertes from "./pages/Alertes";
import Diagnostic from "./pages/Diagnostic";
import Bouteilles from "./pages/Bouteilles";
import ComparatifBouteilles from "./pages/ComparatifBouteilles";
import Classement from "./pages/Classement";
import Polluants from "./pages/Polluants";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import Methodologie from "./pages/Methodologie";
import ApiPublique from "./pages/ApiPublique";
import APropos from "./pages/APropos";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import NotFound from "./pages/NotFound";
import RGPD from "./pages/RGPD";
import Accessibilite from "./pages/Accessibilite";
import OpenData from "./pages/OpenData";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize tracking on app start
    analyticsService.trackPageView();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/carte" element={<Carte />} />
            <Route path="/carte-polluants" element={<CartePolluants />} />
            <Route path="/alertes" element={<Alertes />} />
            <Route path="/diagnostic" element={<Diagnostic />} />
            <Route path="/bouteilles" element={<Bouteilles />} />
            <Route path="/comparatif-bouteilles" element={<ComparatifBouteilles />} />
            <Route path="/classement" element={<Classement />} />
            <Route path="/polluants" element={<Polluants />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/methodologie" element={<Methodologie />} />
            <Route path="/api-publique" element={<ApiPublique />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/rgpd" element={<RGPD />} />
            <Route path="/accessibilite" element={<Accessibilite />} />
            <Route path="/open-data" element={<OpenData />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
