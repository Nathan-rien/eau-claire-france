
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { analyticsService } from "@/services/analyticsService";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import SecurityHeaders from "@/components/SecurityHeaders";
import { EnhancedSecurityService } from "@/services/enhancedSecurityService";

// Lazy load all pages for code splitting
const Index = React.lazy(() => import("./pages/Index"));
const Carte = React.lazy(() => import("./pages/Carte"));
const CartePolluants = React.lazy(() => import("./pages/CartePolluants"));
const SourcesEau = React.lazy(() => import("./pages/SourcesEau"));
const Alertes = React.lazy(() => import("./pages/Alertes"));
const Diagnostic = React.lazy(() => import("./pages/Diagnostic"));

const ComparatifBouteilles = React.lazy(() => import("./pages/ComparatifBouteilles"));
const LazyWaterRecommendation = React.lazy(() => import("@/components/LazyWaterRecommendation"));
const Classement = React.lazy(() => import("./pages/Classement"));
const Polluants = React.lazy(() => import("./pages/Polluants"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Sources = React.lazy(() => import("./pages/Sources"));
const Methodologie = React.lazy(() => import("./pages/Methodologie"));
const ApiPublique = React.lazy(() => import("./pages/ApiPublique"));
const APropos = React.lazy(() => import("./pages/APropos"));
const Contact = React.lazy(() => import("./pages/Contact"));
const MentionsLegales = React.lazy(() => import("./pages/MentionsLegales"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const RGPD = React.lazy(() => import("./pages/RGPD"));
const Accessibilite = React.lazy(() => import("./pages/Accessibilite"));
const OpenData = React.lazy(() => import("./pages/OpenData"));
const SecurityDashboard = React.lazy(() => import("./pages/SecurityDashboard"));
const PrixEaux = React.lazy(() => import("./pages/PrixEaux"));
const ComparateurPrix = React.lazy(() => import("./pages/ComparateurPrix"));
const MarquePrix = React.lazy(() => import("./pages/MarquePrix"));
const Admin = React.lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      networkMode: 'online',
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize tracking on app start
    analyticsService.trackPageView();
    
    // Initialize basic security monitoring (network monitoring removed)
    EnhancedSecurityService.startSecurityMonitoring();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <SecurityHeaders />
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/carte" element={<Carte />} />
                <Route path="/carte-polluants" element={<CartePolluants />} />
                <Route path="/sources-eau" element={<SourcesEau />} />
                <Route path="/alertes" element={<Alertes />} />
                <Route path="/diagnostic" element={<Diagnostic />} />
                
                <Route path="/comparatif-bouteilles" element={<ComparatifBouteilles />} />
                <Route path="/quelle-eau-boire" element={<LazyWaterRecommendation />} />
                <Route path="/classement" element={<Classement />} />
                <Route path="/polluants" element={<Polluants />} />
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/sources" element={<Sources />} />
                <Route path="/methodologie" element={<Methodologie />} />
                <Route path="/api-publique" element={<ApiPublique />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/rgpd" element={<RGPD />} />
                <Route path="/accessibilite" element={<Accessibilite />} />
                <Route path="/open-data" element={<OpenData />} />
                <Route path="/prix-eaux" element={<PrixEaux />} />
                <Route path="/comparateur-prix" element={<ComparateurPrix />} />
                <Route path="/marque/:slug" element={<MarquePrix />} />
                <Route path="/admin" element={<Admin />} />
                <Route 
                  path="/security-dashboard" 
                  element={
                    <ProtectedRoute>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
