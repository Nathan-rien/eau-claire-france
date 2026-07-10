
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { analyticsService } from "@/services/analyticsService";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RegionProvider } from "@/contexts/RegionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import SecurityHeaders from "@/components/SecurityHeaders";
import { EnhancedSecurityService } from "@/services/enhancedSecurityService";
import OndineChat from "@/components/OndineChat";
import NewsTicker from "@/components/NewsTicker";

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

const MarquePrix = React.lazy(() => import("./pages/MarquePrix"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AdminSetup = React.lazy(() => import("./pages/AdminSetup"));
const CarteEurope = React.lazy(() => import("./pages/CarteEurope"));
const CartePolluantsEurope = React.lazy(() => import("./pages/CartePolluantsEurope"));
const ClassementEurope = React.lazy(() => import("./pages/ClassementEurope"));
const PolluantsEurope = React.lazy(() => import("./pages/PolluantsEurope"));
const DiagnosticEurope = React.lazy(() => import("./pages/DiagnosticEurope"));
const AlertesEurope = React.lazy(() => import("./pages/AlertesEurope"));
const PrixEauxEurope = React.lazy(() => import("./pages/PrixEauxEurope"));
const CompositionEurope = React.lazy(() => import("./pages/CompositionEurope"));
const ParcoursEau = React.lazy(() => import("./pages/ParcoursEau"));
const ParcoursEauBouteille = React.lazy(() => import("./pages/ParcoursEauBouteille"));
const CoursEau = React.lazy(() => import("./pages/CoursEau"));
const CarteParcoursEau = React.lazy(() => import("./pages/CarteParcoursEau"));
const CarteParcoursRobinet = React.lazy(() => import("./pages/CarteParcoursRobinet"));
const DiagnosticPrix = React.lazy(() => import("./pages/DiagnosticPrix"));
const LettreEau = React.lazy(() => import("./pages/LettreEau"));
const LettreEauArticle = React.lazy(() => import("./pages/LettreEauArticle"));
const GoutEau = React.lazy(() => import("./pages/GoutEau"));
const QualiteEauIndex = React.lazy(() => import("./pages/QualiteEauIndex"));
const QualiteEauCommune = React.lazy(() => import("./pages/QualiteEauCommune"));
const GuideEauxMagnesium = React.lazy(() => import("./pages/GuideEauxMagnesium"));
const AlerteEauVendee = React.lazy(() => import("./pages/actualites/AlerteEauVendee"));


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
            <RegionProvider>
            <TooltipProvider>
              <SecurityHeaders />
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <NewsTicker />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/carte" element={<Carte />} />
                <Route path="/carte-polluants" element={<CartePolluants />} />
                <Route path="/sources-eau" element={<SourcesEau />} />
                <Route path="/alertes" element={<Alertes />} />
                <Route path="/diagnostic" element={<Diagnostic />} />
                {/* Redirections SEO: ancienne URL comparateur → page classement (plus aboutie) */}
                <Route path="/comparatif-bouteilles" element={<Navigate to="/classement" replace />} />
                <Route path="/bouteilles" element={<Navigate to="/classement" replace />} />
                <Route path="/quelle-eau-boire" element={<LazyWaterRecommendation />} />
                <Route path="/quelle-eau-boire/rapide" element={<LazyWaterRecommendation initialMode="quick" />} />
                <Route path="/quelle-eau-boire/complet" element={<LazyWaterRecommendation initialMode="full" />} />
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
                
                <Route path="/marque/:slug" element={<MarquePrix />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route path="/carte-europe" element={<CarteEurope />} />
                <Route path="/carte-polluants-europe" element={<CartePolluantsEurope />} />
                <Route path="/classement-europe" element={<ClassementEurope />} />
                <Route path="/polluants-europe" element={<PolluantsEurope />} />
                <Route path="/diagnostic-europe" element={<DiagnosticEurope />} />
                <Route path="/alertes-europe" element={<AlertesEurope />} />
                <Route path="/prix-eaux-europe" element={<PrixEauxEurope />} />
                <Route path="/composition-europe" element={<CompositionEurope />} />
                <Route path="/parcours-eau" element={<ParcoursEau />} />
                <Route path="/cours-eau" element={<CoursEau />} />
                <Route path="/parcours-eau-bouteille" element={<ParcoursEauBouteille />} />
                <Route path="/carte-parcours-eau" element={<CarteParcoursEau />} />
                <Route path="/carte-parcours-robinet" element={<CarteParcoursRobinet />} />
                <Route path="/diagnostic-prix" element={<DiagnosticPrix />} />
                <Route path="/lettre-de-leau" element={<LettreEau />} />
                <Route path="/lettre-de-leau/:slug" element={<LettreEauArticle />} />
                <Route path="/gout-eau" element={<GoutEau />} />
                <Route path="/qualite-eau" element={<QualiteEauIndex />} />
                <Route path="/qualite-eau/:slug" element={<QualiteEauCommune />} />
                <Route path="/guide/eaux-riches-magnesium" element={<GuideEauxMagnesium />} />
                <Route path="/actualites/pollution-manganese-vendee-juillet-2026" element={<AlerteEauVendee />} />


                <Route 
                  path="/admin/security" 
                  element={
                    <ProtectedRoute>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <OndineChat />
            </BrowserRouter>
            </TooltipProvider>
            </RegionProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
