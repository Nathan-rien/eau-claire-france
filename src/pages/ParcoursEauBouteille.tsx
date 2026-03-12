
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

import {
  SourceCaptageAnimation,
  AnalyseAnimation,
  EmbouteillageAnimation,
  EtiquetageAnimation,
  TransportAnimation,
  AchatAnimation,
} from '@/components/parcours/BottleStageAnimations';
import {
  GeologicalSourceAnimation,
  QualityDashboardAnimation,
  BottlingSpeedAnimation,
  CarbonFootprintAnimation,
  FranceRoutesAnimation,
  PriceComparisonAnimation,
} from '@/components/parcours/BottleSecondaryAnimations';
import { BottleJourneyAnimation } from '@/components/parcours/BottleJourneyAnimation';
import {
  Droplets, Mountain, FlaskConical, Factory, Tag, Truck, ShoppingCart,
  ChevronDown, Lightbulb, Leaf, Euro, Shield, Recycle, Gauge,
  CheckCircle2, AlertTriangle, Clock, Thermometer,
} from 'lucide-react';

/* ───── Data ───── */

const SECTIONS = [
  { id: 'captage', label: 'Captage', icon: Mountain, color: 'from-blue-600 to-blue-800' },
  { id: 'analyse', label: 'Analyse', icon: FlaskConical, color: 'from-violet-600 to-violet-800' },
  { id: 'embouteillage', label: 'Embouteillage', icon: Factory, color: 'from-cyan-600 to-cyan-800' },
  { id: 'etiquetage', label: 'Étiquetage', icon: Tag, color: 'from-amber-600 to-amber-800' },
  { id: 'transport', label: 'Transport', icon: Truck, color: 'from-rose-600 to-rose-800' },
  { id: 'achat', label: 'Achat', icon: ShoppingCart, color: 'from-green-600 to-green-800' },
] as const;

const waterTypes = [
  { title: 'Eau minérale naturelle', percentage: 45, description: 'Composition minérale stable, propriétés favorables à la santé.' },
  { title: 'Eau de source', percentage: 40, description: 'D\'origine souterraine, naturellement potable.' },
  { title: 'Eau rendue potable', percentage: 15, description: 'Eau traitée, moins courante en bouteille.' },
];

/* ───── Hooks ───── */

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

const AnimatedStat = ({ label, value, display, isVisible }: { label: string; value: number; display?: string; isVisible: boolean }) => {
  const count = useAnimatedCounter(value, isVisible);
  const formatted = display ? (isVisible ? display : '0') : count.toLocaleString('fr-FR');
  return (
    <div className="text-center p-4">
      <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">{formatted}</div>
      <div className="text-sm text-primary-foreground/70">{label}</div>
    </div>
  );
};

const AnimatedBar = ({ percentage, isVisible, delay = 0 }: { percentage: number; isVisible: boolean; delay?: number }) => (
  <div className="w-full h-3 rounded-full bg-primary-foreground/20 overflow-hidden">
    <div
      className="h-full rounded-full bg-primary-foreground transition-all ease-out"
      style={{ width: isVisible ? `${percentage}%` : '0%', transitionDuration: '1.2s', transitionDelay: `${delay}ms` }}
    />
  </div>
);

/* ───── Main Page ───── */

const ParcoursEauBouteille = () => {
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
    void scrollY;
    const ref = sectionRefs.current[sectionIdx];
    if (!ref) return {};
    const rect = ref.getBoundingClientRect();
    const offset = rect.top / window.innerHeight;
    const translateY = offset * -30;
    const scale = 1 + Math.max(0, -offset * 0.03);
    return { transform: `translateY(${translateY}px) scale(${Math.min(scale, 1.05)})`, transition: 'transform 0.1s linear' };
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

  const scrollToFirst = () => { sectionRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const scrollToSection = (idx: number) => { sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const progressValue = ((activeSection + 1) / SECTIONS.length) * 100;

  return (
    <Layout>
      <SEOHead
        title="Parcours de l'eau en bouteille — InfoEau.fr"
        description="Découvrez le parcours de l'eau en bouteille en 6 étapes : du captage à la source jusqu'à l'achat en magasin. Infographie interactive."
        keywords="eau en bouteille, parcours, embouteillage, eau minérale, transport eau, prix eau bouteille"
      />

      {/* ━━━ HERO ━━━ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-cyan-950 via-teal-900 to-cyan-950">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/80 via-teal-900/60 to-cyan-950/80" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/20 animate-v2-float"
            style={{
              width: `${12 + i * 6}px`, height: `${12 + i * 6}px`,
              left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`, animationDuration: `${4 + i}s`,
            }}
          />
        ))}

        {/* Bottle icon */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 animate-v2-water-drop">
          <span className="text-5xl opacity-60">🧴</span>
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-300/30 bg-cyan-500/10 backdrop-blur text-cyan-200 text-sm mb-6 animate-fade-in">
            Infographie interactive
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="block animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>Le parcours de l'eau</span>
            <span className="block bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>en bouteille</span>
          </h1>
          <p className="text-lg text-white/60 mb-10 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            De la source minérale au rayon du supermarché : les 6 étapes du cycle de vie
          </p>
          <button
            onClick={scrollToFirst}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-cyan-500/20 backdrop-blur border border-cyan-300/30 text-white hover:bg-cyan-500/40 transition-all duration-300 animate-fade-in"
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

      {/* ━━━ VUE D'ENSEMBLE ━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-950 via-teal-900/90 to-cyan-950 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">Le voyage complet de l'eau en bouteille</h2>
            <p className="text-cyan-200/60 text-sm md:text-base max-w-xl mx-auto">
              De la source souterraine au rayon du supermarché, suivez les 6 étapes du parcours
            </p>
          </div>

          <div className="rounded-2xl bg-cyan-950/50 backdrop-blur border border-cyan-400/10 p-4 md:p-8 mb-10">
            <BottleJourneyAnimation />
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10">
            {[
              { value: '158', label: 'sources exploitées', icon: '🏔️' },
              { value: '9,3 Mds L', label: 'vendus par an', icon: '🧴' },
              { value: '150 000 t', label: 'de plastique/an', icon: '♻️' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl md:text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg md:text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs md:text-sm text-cyan-200/50">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={scrollToFirst}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/20 backdrop-blur border border-cyan-300/30 text-white hover:bg-cyan-500/40 transition-all duration-300"
            >
              Explorer chaque étape
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ SECTIONS ━━━ */}
      <div className="space-y-0">

        {/* ── 1. CAPTAGE À LA SOURCE ── */}
        <section ref={el => { sectionRefs.current[0] = el; }} data-section="captage" className="min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={cn("transition-all duration-1000 order-2 md:order-1", visibleSections.has('captage') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12')}>
                <div className="rounded-2xl shadow-2xl bg-blue-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(0)}>
                  <SourceCaptageAnimation />
                </div>
                <div className={cn("mt-6 transition-all duration-1000", visibleSections.has('captage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')} style={{ transitionDelay: '800ms' }}>
                  <div className="rounded-xl bg-blue-950/30 backdrop-blur p-4">
                    <GeologicalSourceAnimation />
                    <p className="text-center text-xs text-blue-300/60 mt-2">Filtration naturelle à travers les couches géologiques</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className={cn("transition-all duration-700", visibleSections.has('captage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-400/20 flex items-center justify-center">
                      <Mountain className="h-7 w-7 text-blue-300" />
                    </div>
                    <div>
                      <span className="text-blue-300/70 text-sm font-medium">Étape 1</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Captage à la source</h2>
                    </div>
                  </div>
                  <p className="text-blue-100/80 text-lg mb-8">
                    La France compte <strong className="text-white">158 sources d'eau minérale</strong> exploitées, protégées par des périmètres stricts.
                    Chaque source est <strong className="text-white">unique par sa composition minérale</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  {waterTypes.map((type, i) => (
                    <div
                      key={type.title}
                      className={cn("p-4 rounded-xl bg-white/10 backdrop-blur border border-white/10 transition-all duration-700", visibleSections.has('captage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}
                      style={{ transitionDelay: `${300 + i * 150}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white text-sm">{type.title}</span>
                        <span className="text-blue-200 font-bold">{type.percentage}%</span>
                      </div>
                      <AnimatedBar percentage={type.percentage} isVisible={visibleSections.has('captage')} delay={500 + i * 200} />
                      <p className="text-xs text-blue-200/60 mt-2">{type.description}</p>
                    </div>
                  ))}
                </div>

                <div className={cn("mt-6 p-5 rounded-xl bg-blue-400/10 border border-blue-300/20 transition-all duration-700", visibleSections.has('captage') ? 'animate-v2-scale-bounce' : 'opacity-0 scale-90')} style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Le saviez-vous ?</p>
                      <p className="text-sm text-blue-100/80">
                        L'eau d'une source minérale a été filtrée pendant <strong className="text-white">des dizaines, voire des centaines d'années</strong> à travers les roches.
                        C'est ce lent voyage souterrain qui lui confère sa <strong className="text-white">composition minérale unique et stable</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. ANALYSE & AUTORISATION ── */}
        <section ref={el => { sectionRefs.current[1] = el; }} data-section="analyse" className="min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-violet-800 to-violet-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className={cn("transition-all duration-700", visibleSections.has('analyse') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                      <FlaskConical className="h-7 w-7 text-violet-300" />
                    </div>
                    <div>
                      <span className="text-violet-300/70 text-sm font-medium">Étape 2</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Analyse & Autorisation</h2>
                    </div>
                  </div>
                  <p className="text-violet-100/80 text-lg mb-4">
                    Avant toute exploitation, l'eau doit obtenir une <strong className="text-white">autorisation ministérielle</strong> basée sur des analyses approfondies.
                  </p>
                  <p className="text-violet-100/60 text-sm mb-8">
                    L'ARS réalise des contrôles réguliers : <strong className="text-white">plus de 50 paramètres</strong> sont analysés pour garantir la conformité.
                    La classification (eau minérale naturelle vs eau de source) dépend de la <strong className="text-white">stabilité de la composition</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'paramètres analysés', value: 50, display: '50+' },
                    { label: 'contrôles ARS/an', value: 12000 },
                    { label: 'ans de suivi min.', value: 2 },
                  ].map((stat, i) => (
                    <div key={stat.label} className={cn("p-4 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700", visibleSections.has('analyse') ? 'opacity-100 scale-100' : 'opacity-0 scale-90')} style={{ transitionDelay: `${400 + i * 200}ms` }}>
                      <AnimatedStat label={stat.label} value={stat.value} display={stat.display} isVisible={visibleSections.has('analyse')} />
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: '🔬', title: 'Analyses microbiologiques', desc: 'Absence totale de germes pathogènes' },
                    { icon: '⚗️', title: 'Analyses physico-chimiques', desc: 'Minéraux, pH, conductivité, résidu sec' },
                    { icon: '📋', title: 'Dossier d\'autorisation', desc: 'Procédure de 2 ans minimum auprès de l\'ARS' },
                  ].map((method, i) => (
                    <div key={method.title} className={cn("flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-600", visibleSections.has('analyse') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8')} style={{ transitionDelay: `${800 + i * 150}ms` }}>
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{method.title}</div>
                        <p className="text-xs text-violet-200/60">{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={cn("mt-6 p-5 rounded-xl bg-violet-400/10 border border-violet-300/20 transition-all duration-700", visibleSections.has('analyse') ? 'animate-v2-scale-bounce' : 'opacity-0 scale-90')} style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-violet-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Le saviez-vous ?</p>
                      <p className="text-sm text-violet-100/80">
                        L'eau minérale naturelle est la seule eau qui <strong className="text-white">ne peut subir aucun traitement de désinfection</strong>.
                        Sa pureté originelle doit être garantie naturellement, ce qui explique la rigueur des périmètres de protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("transition-all duration-1000 order-2", visibleSections.has('analyse') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12')}>
                <div className="rounded-2xl shadow-2xl bg-violet-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(1)}>
                  <AnalyseAnimation />
                </div>
                <div className={cn("mt-6 transition-all duration-1000", visibleSections.has('analyse') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')} style={{ transitionDelay: '600ms' }}>
                  <div className="rounded-xl bg-violet-950/30 backdrop-blur p-4">
                    <QualityDashboardAnimation />
                    <p className="text-center text-xs text-violet-300/60 mt-2">Tableau de bord contrôle qualité</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. EMBOUTEILLAGE ── */}
        <section ref={el => { sectionRefs.current[2] = el; }} data-section="embouteillage" className="min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={cn("transition-all duration-1000 order-2 md:order-1", visibleSections.has('embouteillage') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12')}>
                <div className="rounded-2xl shadow-2xl bg-cyan-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(2)}>
                  <EmbouteillageAnimation />
                </div>
                <div className={cn("mt-6 transition-all duration-1000", visibleSections.has('embouteillage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')} style={{ transitionDelay: '700ms' }}>
                  <div className="rounded-xl bg-cyan-950/30 backdrop-blur p-4">
                    <BottlingSpeedAnimation />
                    <p className="text-center text-xs text-cyan-300/60 mt-2">Cadence d'une ligne d'embouteillage moderne</p>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className={cn("transition-all duration-700", visibleSections.has('embouteillage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                      <Factory className="h-7 w-7 text-cyan-300" />
                    </div>
                    <div>
                      <span className="text-cyan-300/70 text-sm font-medium">Étape 3</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Embouteillage</h2>
                    </div>
                  </div>
                  <p className="text-cyan-100/80 text-lg mb-4">
                    L'embouteillage se fait <strong className="text-white">obligatoirement à la source</strong>. Les lignes modernes produisent jusqu'à <strong className="text-white">40 000 bouteilles par heure</strong>.
                  </p>
                  <p className="text-cyan-100/60 text-sm mb-8">
                    Les formats varient : <strong className="text-white">PET (plastique), verre, brique carton</strong>. Le PET représente plus de 80 % du marché français.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: '🧴', title: 'PET', desc: '80% du marché' },
                    { icon: '🍶', title: 'Verre', desc: 'CHR & premium' },
                    { icon: '📦', title: 'Brick', desc: 'Émergent' },
                  ].map((item, i) => (
                    <div key={item.title} className={cn("p-3 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700", visibleSections.has('embouteillage') ? 'opacity-100 scale-100' : 'opacity-0 scale-90')} style={{ transitionDelay: `${400 + i * 200}ms` }}>
                      <span className="text-2xl">{item.icon}</span>
                      <div className="font-semibold text-white text-xs mt-1">{item.title}</div>
                      <div className="text-[10px] text-cyan-200/60 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  {['Soufflage des préformes PET sur site', 'Remplissage en atmosphère stérile', 'Bouchonnage automatique à 40 000/h', 'Contrôle qualité en ligne par caméra'].map((text, i) => (
                    <div key={i} className={cn("flex items-center gap-2 text-sm text-cyan-100/70 transition-all duration-500", visibleSections.has('embouteillage') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6')} style={{ transitionDelay: `${800 + i * 120}ms` }}>
                      <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className={cn("mt-6 p-5 rounded-xl bg-cyan-400/10 border border-cyan-300/20 transition-all duration-700", visibleSections.has('embouteillage') ? 'animate-v2-scale-bounce' : 'opacity-0 scale-90')} style={{ animationDelay: '1.6s', animationFillMode: 'both' }}>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyan-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Le saviez-vous ?</p>
                      <p className="text-sm text-cyan-100/80">
                        Une bouteille de <strong className="text-white">1,5L en PET ne pèse que 30 grammes</strong>, contre 450g en verre. L'industrie a réduit le poids des bouteilles de <strong className="text-white">40 % en 20 ans</strong> pour diminuer l'impact environnemental.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. ÉTIQUETAGE & CONDITIONNEMENT ── */}
        <section ref={el => { sectionRefs.current[3] = el; }} data-section="etiquetage" className="min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className={cn("transition-all duration-700", visibleSections.has('etiquetage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/20 flex items-center justify-center">
                      <Tag className="h-7 w-7 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-amber-300/70 text-sm font-medium">Étape 4</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Étiquetage & Conditionnement</h2>
                    </div>
                  </div>
                  <p className="text-amber-100/80 text-lg mb-8">
                    L'étiquette doit mentionner la <strong className="text-white">composition minérale complète</strong>, le nom de la source et la date de durabilité.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: '🏷️', title: 'Nom & source', desc: 'Identification obligatoire de la source d\'émergence' },
                    { icon: '⚗️', title: 'Composition minérale', desc: 'Ca, Mg, Na, K, HCO₃, SO₄, Cl, F, résidu sec' },
                    { icon: '📅', title: 'DLUO', desc: 'Date limite d\'utilisation optimale : 1 an (PET), 2 ans (verre)' },
                    { icon: '📦', title: 'Conditionnement', desc: 'Packs de 6, 12 ou 24, palettisation automatique' },
                  ].map((item, i) => (
                    <div key={item.title} className={cn("flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-600", visibleSections.has('etiquetage') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8')} style={{ transitionDelay: `${400 + i * 150}ms` }}>
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{item.title}</div>
                        <p className="text-xs text-amber-200/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={cn("mt-6 p-5 rounded-xl bg-amber-400/10 border border-amber-300/20 transition-all duration-700", visibleSections.has('etiquetage') ? 'animate-v2-scale-bounce' : 'opacity-0 scale-90')} style={{ animationDelay: '1.3s', animationFillMode: 'both' }}>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Le saviez-vous ?</p>
                      <p className="text-sm text-amber-100/80">
                        On distingue <strong className="text-white">7 grandes familles de minéralisation</strong> : faiblement minéralisée (&lt;500 mg/L), riche en calcium, riche en magnésium, bicarbonatée, sulfatée, sodique et fluorée.
                        Chaque famille correspond à des <strong className="text-white">usages santé spécifiques</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("transition-all duration-1000 order-2", visibleSections.has('etiquetage') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12')}>
                <div className="rounded-2xl shadow-2xl bg-amber-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(3)}>
                  <EtiquetageAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. TRANSPORT & LOGISTIQUE ── */}
        <section ref={el => { sectionRefs.current[4] = el; }} data-section="transport" className="min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={cn("transition-all duration-1000 order-2 md:order-1", visibleSections.has('transport') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12')}>
                <div className="rounded-2xl shadow-2xl bg-rose-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(4)}>
                  <TransportAnimation />
                </div>
                <div className={cn("mt-6 transition-all duration-1000", visibleSections.has('transport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')} style={{ transitionDelay: '700ms' }}>
                  <div className="rounded-xl bg-rose-950/30 backdrop-blur p-4">
                    <FranceRoutesAnimation />
                    <p className="text-center text-xs text-rose-300/60 mt-2">Principaux trajets source → distribution</p>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className={cn("transition-all duration-700", visibleSections.has('transport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-400/20 flex items-center justify-center">
                      <Truck className="h-7 w-7 text-rose-300" />
                    </div>
                    <div>
                      <span className="text-rose-300/70 text-sm font-medium">Étape 5</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Transport & Logistique</h2>
                    </div>
                  </div>
                  <p className="text-rose-100/80 text-lg mb-8">
                    En moyenne, une bouteille parcourt <strong className="text-white">300 km</strong> entre la source et le magasin.
                    Certaines eaux importées voyagent <strong className="text-white">plus de 1 000 km</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'km en moyenne', value: 300 },
                    { label: 'tonnes de CO₂/an', value: 500000, display: '500 000' },
                    { label: 'camions/jour', value: 3000, display: '3 000' },
                    { label: 'kg CO₂/bouteille', value: 0, display: '0,3' },
                  ].map((stat, i) => (
                    <div key={stat.label} className={cn("p-4 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700", visibleSections.has('transport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')} style={{ transitionDelay: `${400 + i * 150}ms` }}>
                      <AnimatedStat label={stat.label} value={stat.value} display={stat.display} isVisible={visibleSections.has('transport')} />
                    </div>
                  ))}
                </div>

                <div className={cn("mt-6 p-5 rounded-xl bg-rose-400/10 border border-rose-300/20 transition-all duration-700", visibleSections.has('transport') ? 'animate-v2-scale-bounce' : 'opacity-0 scale-90')} style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Enjeu environnemental</p>
                      <p className="text-sm text-rose-100/80">
                        Le transport de l'eau en bouteille en France génère <strong className="text-white">environ 500 000 tonnes de CO₂ par an</strong>.
                        C'est l'équivalent des émissions annuelles d'une ville de <strong className="text-white">100 000 habitants</strong>.
                        Privilégier les eaux de source locales réduit considérablement cette empreinte.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cn("mt-4 transition-all duration-1000", visibleSections.has('transport') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')} style={{ transitionDelay: '1.8s' }}>
                  <div className="rounded-xl bg-rose-950/30 backdrop-blur p-4">
                    <CarbonFootprintAnimation />
                    <p className="text-center text-xs text-rose-300/60 mt-2">Comparaison empreinte carbone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. ACHAT & CONSOMMATION ── */}
        <section ref={el => { sectionRefs.current[5] = el; }} data-section="achat" className="min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-950" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className={cn("transition-all duration-700", visibleSections.has('achat') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-400/20 flex items-center justify-center">
                      <ShoppingCart className="h-7 w-7 text-green-300" />
                    </div>
                    <div>
                      <span className="text-green-300/70 text-sm font-medium">Étape 6</span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">Achat & Consommation</h2>
                    </div>
                  </div>
                  <p className="text-green-100/80 text-lg mb-8">
                    Les Français achètent en moyenne <strong className="text-white">140 litres d'eau en bouteille par an</strong> et par habitant, soit environ <strong className="text-white">9,3 milliards de litres</strong> au total.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'L/an/habitant', value: 140 },
                    { label: 'milliards L/an', value: 9, display: '9,3' },
                    { label: '€/L en moyenne', value: 0, display: '0,20–1,50' },
                    { label: 'tonnes plastique/an', value: 150000, display: '150 000' },
                  ].map((stat, i) => (
                    <div key={stat.label} className={cn("p-4 rounded-xl bg-white/10 backdrop-blur text-center border border-white/10 transition-all duration-700", visibleSections.has('achat') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')} style={{ transitionDelay: `${400 + i * 150}ms` }}>
                      <AnimatedStat label={stat.label} value={stat.value} display={stat.display} isVisible={visibleSections.has('achat')} />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    'Vérifiez la composition minérale selon vos besoins santé',
                    'Privilégiez les marques locales pour réduire l\'empreinte carbone',
                    'Recyclez systématiquement : le PET est recyclable à 100 %',
                    'Comparez les prix au litre, pas au pack',
                  ].map((tip, i) => (
                    <div key={i} className={cn("flex items-start gap-3 p-3 rounded-lg bg-white/10 border border-white/10 transition-all duration-500", visibleSections.has('achat') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8')} style={{ transitionDelay: `${800 + i * 150}ms` }}>
                      <CheckCircle2 className="w-5 h-5 text-green-300 mt-0.5 shrink-0" />
                      <span className="text-sm text-green-100/80">{tip}</span>
                    </div>
                  ))}
                </div>

                <div className={cn("p-5 rounded-xl bg-green-400/10 border border-green-300/20 transition-all duration-700", visibleSections.has('achat') ? 'animate-v2-scale-bounce' : 'opacity-0 scale-90')} style={{ animationDelay: '1.3s', animationFillMode: 'both' }}>
                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-green-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Le saviez-vous ?</p>
                      <p className="text-sm text-green-100/80">
                        Le prix de l'eau en bouteille varie de <strong className="text-white">0,10 €/L</strong> (MDD) à <strong className="text-white">plus de 1,50 €/L</strong> (marques premium).
                        C'est <strong className="text-white">100 à 300 fois plus cher</strong> que l'eau du robinet.
                        Une famille de 4 dépense en moyenne <strong className="text-white">250 à 800 €/an</strong> en eau en bouteille.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cn("mt-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-700", visibleSections.has('achat') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')} style={{ transitionDelay: '1.8s' }}>
                  <div className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-green-300 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-100/70">
                      Chaque année, <strong className="text-white">150 000 tonnes de plastique</strong> sont générées par les bouteilles d'eau en France.
                      Seulement <strong className="text-white">60 % sont effectivement recyclées</strong>. Le reste finit en décharge ou dans la nature.
                    </p>
                  </div>
                </div>
              </div>

              <div className={cn("transition-all duration-1000 order-2", visibleSections.has('achat') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12')}>
                <div className="rounded-2xl shadow-2xl bg-green-950/50 backdrop-blur p-6 aspect-[4/3] flex items-center justify-center" style={getParallaxStyle(5)}>
                  <AchatAnimation />
                </div>
                <div className={cn("mt-6 transition-all duration-1000", visibleSections.has('achat') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')} style={{ transitionDelay: '700ms' }}>
                  <div className="rounded-xl bg-green-950/30 backdrop-blur p-4">
                    <PriceComparisonAnimation />
                    <p className="text-center text-xs text-green-300/60 mt-2">Prix au litre par marque</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="py-20 bg-background text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Comparez les eaux en bouteille
          </h2>
          <p className="text-muted-foreground mb-8">
            Utilisez notre comparateur pour trouver l'eau en bouteille adaptée à vos besoins et votre budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/comparatif-bouteilles"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Comparateur bouteilles
              <Droplets className="w-5 h-5" />
            </a>
            <a
              href="/parcours-eau"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-foreground font-medium hover:bg-accent transition-colors"
            >
              Parcours eau du robinet
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ParcoursEauBouteille;
