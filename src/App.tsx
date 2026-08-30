
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
import CookieConsent from "@/components/CookieConsent";

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
const AdminIndexation = React.lazy(() => import("./pages/AdminIndexation"));
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
const GuideMaCommune = React.lazy(() => import("./pages/GuideMaCommune"));
const AlerteEauVendee = React.lazy(() => import("./pages/actualites/AlerteEauVendee"));
const AlerteUraniumSavoie = React.lazy(() => import("./pages/actualites/AlerteUraniumSavoie"));
const TraiterEauRobinet = React.lazy(() => import("./pages/TraiterEauRobinet"));
const GuideEauCalcaire = React.lazy(() => import("./pages/traiter/GuideEauCalcaire"));
const GuideGoutChlore = React.lazy(() => import("./pages/traiter/GuideGoutChlore"));
const GuideNitratesEau = React.lazy(() => import("./pages/traiter/GuideNitratesEau"));
const GuidePlombEau = React.lazy(() => import("./pages/traiter/GuidePlombEau"));
const ComparatifCarafes = React.lazy(() => import("./pages/traiter/ComparatifCarafes"));
const GuideQuelFiltreEau = React.lazy(() => import("./pages/traiter/GuideQuelFiltreEau"));
const ComparatifFiltresEau = React.lazy(() => import("./pages/traiter/ComparatifFiltresEau"));
const BouteilleOuFiltration = React.lazy(() => import("./pages/traiter/BouteilleOuFiltration"));
const DureteEauFrance = React.lazy(() => import("./pages/DureteEauFrance"));
const EauxMineralesRegion = React.lazy(() => import("./pages/EauxMineralesRegion"));
const CalculateurHydratation = React.lazy(() => import("./pages/CalculateurHydratation"));


const appRoutes = (p: string) => (
  <>
                <Route path={p || "/"} element={<Index />} />
                <Route path={`${p}/carte`} element={<Carte />} />
                <Route path={`${p}/carte-polluants`} element={<CartePolluants />} />
                <Route path={`${p}/sources-eau`} element={<SourcesEau />} />
                <Route path={`${p}/alertes`} element={<Alertes />} />
                <Route path={`${p}/diagnostic`} element={<Diagnostic />} />
                {/* Redirections SEO: ancienne URL comparateur → page classement (plus aboutie) */}
                <Route path={`${p}/comparatif-bouteilles`} element={<Navigate to={`${p}/classement`} replace />} />
                <Route path={`${p}/bouteilles`} element={<Navigate to={`${p}/classement`} replace />} />
                <Route path={`${p}/quelle-eau-boire`} element={<LazyWaterRecommendation />} />
                <Route path={`${p}/quelle-eau-boire/rapide`} element={<LazyWaterRecommendation initialMode="quick" />} />
                <Route path={`${p}/quelle-eau-boire/complet`} element={<LazyWaterRecommendation initialMode="full" />} />
                <Route path={`${p}/classement`} element={<Classement />} />
                <Route path={`${p}/polluants`} element={<Polluants />} />
                <Route path={`${p}/auth`} element={<Auth />} />
                <Route 
                  path={`${p}/dashboard`} 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path={`${p}/sources`} element={<Sources />} />
                <Route path={`${p}/methodologie`} element={<Methodologie />} />
                <Route path={`${p}/api-publique`} element={<ApiPublique />} />
                <Route path={`${p}/a-propos`} element={<APropos />} />
                <Route path={`${p}/contact`} element={<Contact />} />
                <Route path={`${p}/mentions-legales`} element={<MentionsLegales />} />
                <Route path={`${p}/rgpd`} element={<RGPD />} />
                <Route path={`${p}/accessibilite`} element={<Accessibilite />} />
                <Route path={`${p}/open-data`} element={<OpenData />} />
                <Route path={`${p}/prix-eaux`} element={<PrixEaux />} />
                
                <Route path={`${p}/marque/:slug`} element={<MarquePrix />} />
                <Route path={`${p}/admin`} element={<Admin />} />
                <Route path={`${p}/admin-setup`} element={<AdminSetup />} />
                <Route path={`${p}/admin/indexation`} element={<AdminIndexation />} />
                <Route path={`${p}/carte-europe`} element={<CarteEurope />} />
                <Route path={`${p}/carte-polluants-europe`} element={<CartePolluantsEurope />} />
                <Route path={`${p}/classement-europe`} element={<ClassementEurope />} />
                <Route path={`${p}/polluants-europe`} element={<PolluantsEurope />} />
                <Route path={`${p}/diagnostic-europe`} element={<DiagnosticEurope />} />
                <Route path={`${p}/alertes-europe`} element={<AlertesEurope />} />
                <Route path={`${p}/prix-eaux-europe`} element={<PrixEauxEurope />} />
                <Route path={`${p}/composition-europe`} element={<CompositionEurope />} />
                <Route path={`${p}/parcours-eau`} element={<ParcoursEau />} />
                <Route path={`${p}/cours-eau`} element={<CoursEau />} />
                <Route path={`${p}/parcours-eau-bouteille`} element={<ParcoursEauBouteille />} />
                <Route path={`${p}/carte-parcours-eau`} element={<CarteParcoursEau />} />
                <Route path={`${p}/carte-parcours-robinet`} element={<CarteParcoursRobinet />} />
                <Route path={`${p}/diagnostic-prix`} element={<DiagnosticPrix />} />
                <Route path={`${p}/lettre-de-leau`} element={<LettreEau />} />
                <Route path={`${p}/lettre-de-leau/:slug`} element={<LettreEauArticle />} />
                <Route path={`${p}/gout-eau`} element={<GoutEau />} />
                <Route path={`${p}/qualite-eau`} element={<QualiteEauIndex />} />
                <Route path={`${p}/qualite-eau/:slug`} element={<QualiteEauCommune />} />
                <Route path={`${p}/guide/eaux-riches-magnesium`} element={<GuideEauxMagnesium />} />
                <Route path={`${p}/guide/ma-commune`} element={<GuideMaCommune />} />
                <Route path={`${p}/actualites/pollution-manganese-vendee-juillet-2026`} element={<AlerteEauVendee />} />
                <Route path={`${p}/actualites/uranium-eau-robinet-savoie-maurienne-aout-2026`} element={<AlerteUraniumSavoie />} />
                <Route path={`${p}/traiter-eau-robinet`} element={<TraiterEauRobinet />} />
                <Route path={`${p}/guide/eau-calcaire`} element={<GuideEauCalcaire />} />
                <Route path={`${p}/guide/gout-chlore`} element={<GuideGoutChlore />} />
                <Route path={`${p}/guide/nitrates-eau`} element={<GuideNitratesEau />} />
                <Route path={`${p}/guide/plomb-eau`} element={<GuidePlombEau />} />
                <Route path={`${p}/comparatif-carafes`} element={<ComparatifCarafes />} />
                <Route path={`${p}/guide/quel-filtre-eau`} element={<GuideQuelFiltreEau />} />
                <Route path={`${p}/comparatif-filtres-eau`} element={<ComparatifFiltresEau />} />
                <Route path={`${p}/bouteille-ou-filtration`} element={<BouteilleOuFiltration />} />
                <Route path={`${p}/durete-eau-france`} element={<DureteEauFrance />} />
                <Route path={`${p}/eaux-minerales-alpes`} element={<EauxMineralesRegion region="alpes" />} />
                <Route path={`${p}/eaux-minerales-vosges`} element={<EauxMineralesRegion region="vosges" />} />
                <Route path={`${p}/eaux-minerales-auvergne`} element={<EauxMineralesRegion region="auvergne" />} />
                <Route path={`${p}/eaux-minerales-pyrenees`} element={<EauxMineralesRegion region="pyrenees" />} />
                <Route path={`${p}/eaux-minerales-mediterranee`} element={<EauxMineralesRegion region="mediterranee" />} />
                <Route path={`${p}/calculateur-hydratation`} element={<CalculateurHydratation />} />


                <Route 
                  path={`${p}/admin/security`} 
                  element={
                    <ProtectedRoute>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path={p ? `${p}/*` : "*"} element={<NotFound />} />


  </>
);

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
          <BrowserRouter>
            {/* LanguageProvider must live inside the router: the language is
                derived from the URL pathname (/en prefix) on the first render. */}
            <LanguageProvider>
            <RegionProvider>
            <TooltipProvider>
              <SecurityHeaders />
            <Toaster />
            <Sonner />
            
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {appRoutes("")}
                {appRoutes("/en")}
              </Routes>
            </Suspense>
            <OndineChat />
            <CookieConsent />
            </TooltipProvider>
            </RegionProvider>
            </LanguageProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
