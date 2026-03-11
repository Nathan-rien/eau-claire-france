
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

import heroImg from '@/assets/parcours/hero-water.jpg';
import {
  CaptageAnimation,
  PompageAnimation,
  TraitementAnimation,
  StockageAnimation,
  DistributionAnimation,
  RobinetAnimation,
} from '@/components/parcours/StageAnimations';
import {
  Droplets, ArrowDown, FlaskConical, Cylinder, Network, Home,
  Mountain, Waves, Layers, CircleDot, Filter, Zap, Sun, Shield,
  ChevronDown, CheckCircle2, Gauge,
} from 'lucide-react';

/* ───── Data (same as V1) ───── */

const SECTIONS = [
  { id: 'captage', label: 'Captage', icon: Droplets, color: 'from-blue-600 to-blue-800' },
  { id: 'pompage', label: 'Pompage', icon: ArrowDown, color: 'from-indigo-600 to-indigo-800' },
  { id: 'traitement', label: 'Traitement', icon: FlaskConical, color: 'from-purple-600 to-purple-800' },
  { id: 'stockage', label: 'Stockage', icon: Cylinder, color: 'from-amber-600 to-amber-800' },
  { id: 'distribution', label: 'Distribution', icon: Network, color: 'from-teal-600 to-teal-800' },
  { id: 'robinet', label: 'Robinet', icon: Home, color: 'from-green-600 to-green-800' },
] as const;

const IMAGES = {
  hero: heroImg,
};

const sourceTypes = [
  { title: 'Nappes phréatiques', icon: Layers, percentage: 60, depth: '10 à 100 m', quality: 'Naturellement filtrée', risk: 'Pesticides, nitrates', description: "Principale source d'eau potable en France." },
  { title: 'Nappes de craie', icon: CircleDot, percentage: 15, depth: '50 à 300 m', quality: 'Très pure, riche en minéraux', risk: 'Pollution historique lente', description: 'Aquifères de craie du Bassin parisien.' },
  { title: 'Sources de montagne', icon: Mountain, percentage: 10, depth: 'Émergence naturelle', quality: 'Faible minéralisation', risk: 'Turbidité saisonnière', description: 'Eaux de fonte et de ruissellement.' },
  { title: 'Eaux de surface', icon: Waves, percentage: 15, depth: 'Rivières, lacs', quality: 'Variable, traitement poussé', risk: 'Micropolluants, turbidité', description: 'Rivières, fleuves et retenues.' },
];

const treatmentSteps = [
  { name: 'Dégrillage', icon: Filter },
  { name: 'Coagulation', icon: FlaskConical },
  { name: 'Décantation', icon: ArrowDown },
  { name: 'Filtration sable', icon: Layers },
  { name: 'Ozonation', icon: Zap },
  { name: 'Charbon actif', icon: Filter },
  { name: 'UV / Chloration', icon: Sun },
  { name: 'Désinfection', icon: Shield },
];

const keyStats = [
  { label: 'Points de captage', value: 33000 },
  { label: 'm³ prélevés/an', value: 5400000000, display: '5,4 Mds' },
  { label: 'L/jour/habitant', value: 148 },
  { label: 'km de canalisations', value: 906000 },
  { label: 'Analyses ARS/an', value: 320000 },
  { label: 'Châteaux d\'eau', value: 15000 },
];

/* ───── Animated Counter Hook ───── */

function useAnimatedCounter(target: number, isVisible: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target, duration]);

  return count;
}

/* ───── AnimatedStat component ───── */

const AnimatedStat = ({ label, value, display, isVisible }: { label: string; value: number; display?: string; isVisible: boolean }) => {
  const count = useAnimatedCounter(value, isVisible);
  const formatted = display
    ? (isVisible ? display : '0')
    : count.toLocaleString('fr-FR');

  return (
    <div className="text-center p-4">
      <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">{formatted}</div>
      <div className="text-sm text-primary-foreground/70">{label}</div>
    </div>
  );
};

/* ───── Animated Bar ───── */

const AnimatedBar = ({ percentage, isVisible, delay = 0 }: { percentage: number; isVisible: boolean; delay?: number }) => (
  <div className="w-full h-3 rounded-full bg-primary-foreground/20 overflow-hidden">
    <div
      className="h-full rounded-full bg-primary-foreground transition-all ease-out"
      style={{
        width: isVisible ? `${percentage}%` : '0%',
        transitionDuration: '1.2s',
        transitionDelay: `${delay}ms`,
      }}
    />
  </div>
);

/* ───── Geological Cross-Section SVG ───── */

const GeologicalSVG = ({ isVisible }: { isVisible: boolean }) => (
  <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto" aria-label="Coupe géologique simplifiée">
    {/* Surface grass */}
    <rect x="0" y="0" width="400" height="30" rx="0" className={cn("transition-all duration-1000", isVisible ? "opacity-100" : "opacity-0")} fill="hsl(142, 40%, 45%)" />
    {/* Soil layer */}
    <rect x="0" y="30" width="400" height="40" className={cn("transition-all duration-1000 delay-200", isVisible ? "opacity-100" : "opacity-0")} fill="hsl(30, 40%, 50%)" />
    {/* Sand layer */}
    <rect x="0" y="70" width="400" height="35" className={cn("transition-all duration-1000 delay-500", isVisible ? "opacity-100" : "opacity-0")} fill="hsl(45, 50%, 65%)" />
    {/* Gravel/aquifer */}
    <rect x="0" y="105" width="400" height="45" className={cn("transition-all duration-1000 delay-700", isVisible ? "opacity-100" : "opacity-0")} fill="hsl(200, 60%, 55%)" />
    {/* Rock layer */}
    <rect x="0" y="150" width="400" height="50" className={cn("transition-all duration-1000 delay-1000", isVisible ? "opacity-100" : "opacity-0")} fill="hsl(220, 15%, 40%)" />
    {/* Labels */}
    <text x="10" y="20" fill="white" fontSize="11" fontWeight="600" className={cn("transition-opacity duration-500 delay-300", isVisible ? "opacity-100" : "opacity-0")}>Surface</text>
    <text x="10" y="55" fill="white" fontSize="11" fontWeight="600" className={cn("transition-opacity duration-500 delay-500", isVisible ? "opacity-100" : "opacity-0")}>Sol</text>
    <text x="10" y="92" fill="white" fontSize="11" fontWeight="600" className={cn("transition-opacity duration-500 delay-700", isVisible ? "opacity-100" : "opacity-0")}>Sable</text>
    <text x="10" y="132" fill="white" fontSize="11" fontWeight="bold" className={cn("transition-opacity duration-500 delay-900", isVisible ? "opacity-100" : "opacity-0")}>💧 Nappe phréatique</text>
    <text x="10" y="180" fill="white" fontSize="11" fontWeight="600" className={cn("transition-opacity duration-500 delay-1100", isVisible ? "opacity-100" : "opacity-0")}>Roche imperméable</text>
    {/* Well pipe */}
    <rect x="280" y="0" width="8" height="130" className={cn("transition-all duration-1000 delay-1200", isVisible ? "opacity-100" : "opacity-0")} fill="hsl(0, 0%, 35%)" rx="2" />
    <text x="295" y="70" fill="white" fontSize="10" className={cn("transition-opacity duration-500 delay-1400", isVisible ? "opacity-100" : "opacity-0")}>Forage</text>
  </svg>
);

/* ───── Water Tower SVG ───── */

const WaterTowerSVG = ({ isVisible }: { isVisible: boolean }) => (
  <svg viewBox="0 0 200 250" className="w-32 mx-auto" aria-label="Château d'eau">
    {/* Legs */}
    <line x1="60" y1="250" x2="80" y2="140" stroke="hsl(220, 15%, 45%)" strokeWidth="6" className={cn("transition-opacity duration-500", isVisible ? "opacity-100" : "opacity-0")} />
    <line x1="140" y1="250" x2="120" y2="140" stroke="hsl(220, 15%, 45%)" strokeWidth="6" className={cn("transition-opacity duration-500", isVisible ? "opacity-100" : "opacity-0")} />
    {/* Tank */}
    <rect x="50" y="50" width="100" height="95" rx="8" fill="hsl(220, 15%, 55%)" className={cn("transition-opacity duration-700 delay-300", isVisible ? "opacity-100" : "opacity-0")} />
    {/* Water fill animation */}
    <rect x="54" y="50" width="92" height="91" rx="6"
      fill="hsl(200, 70%, 50%)"
      className={cn("transition-all duration-[2s] delay-700 origin-bottom", isVisible ? "opacity-80" : "opacity-0")}
      style={{ transform: isVisible ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'bottom', clipPath: 'inset(0 0 0 0 round 6px)' }}
    />
    {/* Roof */}
    <polygon points="40,55 100,15 160,55" fill="hsl(220, 15%, 40%)" className={cn("transition-opacity duration-500 delay-500", isVisible ? "opacity-100" : "opacity-0")} />
  </svg>
);

/* ───── Main Page ───── */

const ParcoursEauV2 = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getParallaxStyle = (sectionIdx: number) => {
    const ref = sectionRefs.current[sectionIdx];
    if (!ref) return {};
    const rect = ref.getBoundingClientRect();
    const offset = rect.top / window.innerHeight;
    const translateY = offset * -30;
    const scale = 1 + Math.max(0, -offset * 0.03);
    return {
      transform: `translateY(${translateY}px) scale(${Math.min(scale, 1.05)})`,
      transition: 'transform 0.1s linear',
    };
  };

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('data-section');
      if (!id) return;
      setVisibleSections(prev => {
        const next = new Set(prev);
        if (entry.isIntersecting) next.add(id);
        return next;
      });
      if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
        const idx = SECTIONS.findIndex(s => s.id === id);
        if (idx !== -1) setActiveSection(idx);
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0.1, 0.2, 0.4],
      rootMargin: '-5% 0px -5% 0px',
    });
    sectionRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [observerCallback]);

  const scrollToFirst = () => {
    sectionRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToSection = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const seo = seoData.parcoursEauV2 || seoData.parcoursEau;
  const progressValue = ((activeSection + 1) / SECTIONS.length) * 100;

  return (
    <Layout>
      <SEOHead title={seo.title} description={seo.description} keywords={seo.keywords} />

      {/* ━━━ HERO ━━━ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-blue-900/40 to-blue-950/70" />
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/20 animate-v2-float"
            style={{
              width: `${12 + i * 6}px`,
              height: `${12 + i * 6}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}

        {/* Water drop */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 animate-v2-water-drop">
          <Droplets className="w-10 h-10 text-blue-300/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-300/30 bg-blue-500/10 backdrop-blur text-blue-200 text-sm mb-6 animate-fade-in">
            Infographie interactive immersive
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="block animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>Le parcours</span>
            <span className="block bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>de l'eau</span>
            <span className="block text-2xl md:text-3xl font-normal text-white/70 mt-2 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>en France</span>
          </h1>
          <p className="text-lg text-white/60 mb-10 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            De la source naturelle à votre robinet : découvrez les 6 étapes du voyage
          </p>
          <button
            onClick={scrollToFirst}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-500/20 backdrop-blur border border-blue-300/30 text-white hover:bg-blue-500/40 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: '1.3s', animationFillMode: 'both' }}
          >
            Commencer le voyage
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ━━━ STICKY PROGRESS ━━━ */}
      <div className="sticky top-14 z-40 bg-background/90 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="hidden md:flex items-center justify-between gap-2">
            {SECTIONS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = idx === activeSection;
              const isPast = idx < activeSection;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(idx)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300',
                    isActive ? 'bg-primary text-primary-foreground shadow-md scale-105' :
                    isPast ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="md:hidden flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{SECTIONS[activeSection].label}</span>
            <Progress value={progressValue} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">{activeSection + 1}/6</span>
          </div>
        </div>
      </div>

      {/* ━━━ SECTIONS ━━━ */}
      <div className="space-y-0">

        {/* ── 1. CAPTAGE ── */}
        <section
          ref={el => { sectionRefs.current[0] = el; }}
          data-section="captage"
          className="min-h-[80vh] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className={cn(
                "transition-all duration-1000 order-2 md:order-1",
                visibleSections.has('captage') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              )}>
                <div className="rounded-2xl shadow-2xl bg-blue-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(0)}>
                  <CaptageAnimation />
                </div>
                <div className="mt-6">
                  <GeologicalSVG isVisible={visibleSections.has('captage')} />
                </div>
              </div>
              {/* Content */}
              <div className="order-1 md:order-2">
                <div className={cn("transition-all duration-700", visibleSections.has('captage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-400/20 flex items-center justify-center">
                      <Droplets className="h-7 w-7 text-blue-300" />
                    </div>
                    <div>
                      <span className="text-blue-300/70 text-sm font-medium">Étape 1</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Captage des sources</h2>
                    </div>
                  </div>
                  <p className="text-blue-100/80 text-lg mb-8">
                    La France exploite environ <strong className="text-white">33 000 points de captage</strong> répartis sur tout le territoire.
                    Les eaux souterraines représentent <strong className="text-white">2/3 de l'eau potable</strong>.
                  </p>
                </div>

                {/* Source type cards with animated bars */}
                <div className="space-y-4">
                  {sourceTypes.map((source, i) => {
                    const SIcon = source.icon;
                    return (
                      <div
                        key={source.title}
                        className={cn(
                          "p-4 rounded-xl bg-white/10 backdrop-blur border border-white/10 transition-all duration-700",
                          visibleSections.has('captage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        )}
                        style={{ transitionDelay: `${300 + i * 150}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <SIcon className="w-4 h-4 text-blue-300" />
                            <span className="font-semibold text-white text-sm">{source.title}</span>
                          </div>
                          <span className="text-blue-200 font-bold">{source.percentage}%</span>
                        </div>
                        <AnimatedBar percentage={source.percentage} isVisible={visibleSections.has('captage')} delay={500 + i * 200} />
                        <p className="text-xs text-blue-200/60 mt-2">{source.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. POMPAGE ── */}
        <section
          ref={el => { sectionRefs.current[1] = el; }}
          data-section="pompage"
          className="min-h-[80vh] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className={cn("transition-all duration-700", visibleSections.has('pompage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-400/20 flex items-center justify-center">
                      <ArrowDown className="h-7 w-7 text-indigo-300" />
                    </div>
                    <div>
                      <span className="text-indigo-300/70 text-sm font-medium">Étape 2</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Pompage & Prélèvement</h2>
                    </div>
                  </div>
                  <p className="text-indigo-100/80 text-lg mb-8">
                    Extraire l'eau de son milieu naturel pour la rendre disponible aux usines de traitement.
                  </p>
                </div>

                {/* Key stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'm³ prélevés/an', value: 5400000000, display: '5,4 Mds' },
                    { label: 'L/jour/habitant', value: 148 },
                    { label: 'pertes réseau', value: 20, suffix: '%' },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "p-4 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700",
                        visibleSections.has('pompage') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      )}
                      style={{ transitionDelay: `${400 + i * 200}ms` }}
                    >
                      <AnimatedStat label={stat.label} value={stat.value} display={stat.display} isVisible={visibleSections.has('pompage')} />
                    </div>
                  ))}
                </div>

                {/* Extraction methods */}
                <div className="mt-8 space-y-3">
                  {[
                    { icon: '🔧', title: 'Forages profonds', desc: 'Pompes immergées à 50-300 m de profondeur' },
                    { icon: '🏔️', title: 'Captage gravitaire', desc: 'Émergence naturelle sans pompage' },
                    { icon: '🌊', title: 'Prises en rivière', desc: 'Prélèvement direct dans les cours d\'eau' },
                  ].map((method, i) => (
                    <div
                      key={method.title}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-600",
                        visibleSections.has('pompage') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                      )}
                      style={{ transitionDelay: `${800 + i * 150}ms` }}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{method.title}</div>
                        <p className="text-xs text-indigo-200/60">{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cn(
                "transition-all duration-1000 order-2",
                visibleSections.has('pompage') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              )}>
                <div className="rounded-2xl shadow-2xl bg-indigo-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center">
                  <PompageAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. TRAITEMENT ── */}
        <section
          ref={el => { sectionRefs.current[2] = el; }}
          data-section="traitement"
          className="min-h-[80vh] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={cn(
                "transition-all duration-1000 order-2 md:order-1",
                visibleSections.has('traitement') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              )}>
                <div className="rounded-2xl shadow-2xl bg-purple-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center">
                  <TraitementAnimation />
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className={cn("transition-all duration-700", visibleSections.has('traitement') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-400/20 flex items-center justify-center">
                      <FlaskConical className="h-7 w-7 text-purple-300" />
                    </div>
                    <div>
                      <span className="text-purple-300/70 text-sm font-medium">Étape 3</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Traitement</h2>
                    </div>
                  </div>
                  <p className="text-purple-100/80 text-lg mb-4">
                    Rendre l'eau conforme aux <strong className="text-white">63 paramètres</strong> du Code de la santé publique.
                  </p>
                </div>

                {/* Treatment timeline */}
                <div className="relative">
                  {/* Animated connecting line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-400/20">
                    <div
                      className="w-full bg-gradient-to-b from-purple-400 to-purple-300 transition-all duration-[2s] ease-out"
                      style={{ height: visibleSections.has('traitement') ? '100%' : '0%' }}
                    />
                  </div>

                  <div className="space-y-3">
                    {treatmentSteps.map((step, i) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={step.name}
                          className={cn(
                            "flex items-center gap-4 pl-2 transition-all duration-500",
                            visibleSections.has('traitement') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                          )}
                          style={{ transitionDelay: `${300 + i * 120}ms` }}
                        >
                          <div className="w-9 h-9 rounded-full bg-purple-500/30 border-2 border-purple-300/50 flex items-center justify-center shrink-0 z-10">
                            <span className="text-white text-xs font-bold">{i + 1}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 flex-1">
                            <StepIcon className="w-4 h-4 text-purple-300" />
                            <span className="text-white text-sm font-medium">{step.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. STOCKAGE ── */}
        <section
          ref={el => { sectionRefs.current[3] = el; }}
          data-section="stockage"
          className="min-h-[80vh] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className={cn("transition-all duration-700", visibleSections.has('stockage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/20 flex items-center justify-center">
                      <Cylinder className="h-7 w-7 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-amber-300/70 text-sm font-medium">Étape 4</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Stockage</h2>
                    </div>
                  </div>
                  <p className="text-amber-100/80 text-lg mb-8">
                    Plus de <strong className="text-white">15 000 châteaux d'eau</strong> assurent la pression et la disponibilité 24h/24.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: '🏗️', title: 'Châteaux d\'eau', desc: 'Pression gravitaire' },
                    { icon: '🏔️', title: 'Réservoirs enterrés', desc: 'Protection thermique' },
                    { icon: '🔄', title: 'Bâches de reprise', desc: 'Régulation débit' },
                  ].map((item, i) => (
                    <div
                      key={item.title}
                      className={cn(
                        "p-3 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700",
                        visibleSections.has('stockage') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      )}
                      style={{ transitionDelay: `${400 + i * 200}ms` }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="font-semibold text-white text-xs mt-1">{item.title}</div>
                      <div className="text-[10px] text-amber-200/60 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>

                <div className={cn(
                  "p-4 rounded-xl bg-white/10 border border-amber-300/20 transition-all duration-700",
                  visibleSections.has('stockage') ? 'opacity-100' : 'opacity-0'
                )} style={{ transitionDelay: '1000ms' }}>
                  <div className="flex items-start gap-2">
                    <Gauge className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-100/80">
                      Le temps de séjour ne doit pas dépasser <strong className="text-white">48 heures</strong> pour maintenir le taux de chlore.
                    </p>
                  </div>
                </div>
              </div>

              <div className={cn(
                "transition-all duration-1000 order-2",
                visibleSections.has('stockage') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              )}>
                <div className="rounded-2xl shadow-2xl bg-amber-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center">
                  <StockageAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. DISTRIBUTION ── */}
        <section
          ref={el => { sectionRefs.current[4] = el; }}
          data-section="distribution"
          className="min-h-[80vh] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={cn(
                "transition-all duration-1000 order-2 md:order-1",
                visibleSections.has('distribution') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              )}>
                <div className="rounded-2xl shadow-2xl bg-teal-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center">
                  <DistributionAnimation />
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className={cn("transition-all duration-700", visibleSections.has('distribution') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-400/20 flex items-center justify-center">
                      <Network className="h-7 w-7 text-teal-300" />
                    </div>
                    <div>
                      <span className="text-teal-300/70 text-sm font-medium">Étape 5</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Distribution</h2>
                    </div>
                  </div>
                  <p className="text-teal-100/80 text-lg mb-8">
                    Le plus grand réseau souterrain de France : <strong className="text-white">906 000 km</strong> de canalisations.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'km de canalisations', value: 906000 },
                    { label: 'services d\'eau', value: 13500 },
                    { label: 'bars de pression', value: 5, display: '3-5' },
                    { label: 'analyses/an', value: 320000 },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "p-4 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700",
                        visibleSections.has('distribution') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      )}
                      style={{ transitionDelay: `${400 + i * 150}ms` }}
                    >
                      <AnimatedStat label={stat.label} value={stat.value} display={stat.display} isVisible={visibleSections.has('distribution')} />
                    </div>
                  ))}
                </div>

                {/* Quality controls */}
                <div className={cn(
                  "space-y-2 transition-all duration-700",
                  visibleSections.has('distribution') ? 'opacity-100' : 'opacity-0'
                )} style={{ transitionDelay: '1000ms' }}>
                  {[
                    'Chlore résiduel : 0,1 à 0,3 mg/L',
                    'Turbidité max : 1 NTU au robinet',
                    'Pression : 3-5 bars garantis',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-teal-100/70">
                      <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. ROBINET ── */}
        <section
          ref={el => { sectionRefs.current[5] = el; }}
          data-section="robinet"
          className="min-h-[80vh] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className={cn("transition-all duration-700", visibleSections.has('robinet') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-400/20 flex items-center justify-center">
                      <Home className="h-7 w-7 text-green-300" />
                    </div>
                    <div>
                      <span className="text-green-300/70 text-sm font-medium">Étape 6</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Arrivée au robinet</h2>
                    </div>
                  </div>
                  <p className="text-green-100/80 text-lg mb-8">
                    L'eau du robinet est <strong className="text-white">l'aliment le plus contrôlé en France</strong> avec plus de 63 critères vérifiés.
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-3 mb-8">
                  {[
                    'Laissez couler l\'eau quelques secondes après une longue inactivité',
                    'Vérifiez l\'âge de vos canalisations (plomb interdit depuis 1995)',
                    'Consultez le rapport ARS de votre commune sur InfoEau.fr',
                    'N\'utilisez jamais l\'eau chaude pour la cuisine',
                  ].map((tip, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg bg-white/10 border border-white/10 transition-all duration-500",
                        visibleSections.has('robinet') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                      )}
                      style={{ transitionDelay: `${400 + i * 150}ms` }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-300 mt-0.5 shrink-0" />
                      <span className="text-sm text-green-100/80">{tip}</span>
                    </div>
                  ))}
                </div>

                <div className={cn(
                  "p-5 rounded-xl bg-green-400/10 border border-green-300/20 transition-all duration-700",
                  visibleSections.has('robinet') ? 'opacity-100' : 'opacity-0'
                )} style={{ transitionDelay: '1000ms' }}>
                  <p className="text-green-100 text-sm">
                    ✅ <strong className="text-white">Résultats ARS consultables</strong> en mairie et sur InfoEau.fr — votre eau est contrôlée en permanence.
                  </p>
                </div>
              </div>

              <div className={cn(
                "transition-all duration-1000 order-2",
                visibleSections.has('robinet') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              )}>
                <div className="rounded-2xl shadow-2xl bg-green-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center">
                  <RobinetAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="py-20 bg-gradient-to-b from-green-950 to-background text-center px-4">
        <div className={cn("max-w-2xl mx-auto")}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Découvrez la qualité de votre eau
          </h2>
          <p className="text-muted-foreground mb-8">
            Utilisez notre diagnostic pour connaître la composition exacte de l'eau dans votre commune.
          </p>
          <a
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Lancer le diagnostic
            <Droplets className="w-5 h-5" />
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default ParcoursEauV2;
