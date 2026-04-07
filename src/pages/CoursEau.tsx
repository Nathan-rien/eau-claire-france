import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import {
  TrendingUp, Droplets, FlaskConical, Truck, Zap, Scale, Wrench, Shield, Thermometer, ArrowUpRight, ArrowDownRight, Minus, Clock,
} from 'lucide-react';
import {
  bottlePriceHistory, tapPriceHistory,
  bottlePriceFactors, tapPriceFactors,
  keyStats, priceEvents,
  type PriceEvent,
} from '@/data/waterPriceHistory';
import { useBrands } from '@/hooks/usePricesData';
import { getBrandTimeseries, type BrandTimeseries } from '@/services/timeseriesApi';

// ─── Animated counter hook ───
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * ease));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

// ─── Intersection observer hook ───
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Icon mapper ───
const iconMap: Record<string, React.ReactNode> = {
  flask: <FlaskConical className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  scale: <Scale className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  droplets: <Droplets className="w-5 h-5" />,
  thermometer: <Thermometer className="w-5 h-5" />,
};

// ─── Period filter ───
type Period = '5ans' | '10ans' | 'max';
function filterByPeriod<T extends { year: number }>(data: T[], period: Period): T[] {
  const now = new Date().getFullYear();
  if (period === '5ans') return data.filter(d => d.year >= now - 5);
  if (period === '10ans') return data.filter(d => d.year >= now - 10);
  return data;
}

// ─── Custom tooltip ───
const PriceTooltip = ({ active, payload, unit }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground">{d.year}</p>
      <p className="text-primary font-bold text-lg">{d.price.toFixed(2)} {unit}</p>
      {d.event && <p className="text-muted-foreground text-xs mt-1 italic">📌 {d.event}</p>}
    </div>
  );
};

// ─── Animated factor card (extracted to avoid hooks in loops) ───
const FactorCard = ({ factor, index, colorClass }: { factor: { icon: string; title: string; description: string; trend: string }; index: number; colorClass: string }) => {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-5 flex gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
            {iconMap[factor.icon]}
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{factor.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
            <Badge variant="secondary" className="text-xs">{factor.trend}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Animated timeline event (extracted) ───
const TimelineEvent = ({ event, index }: { event: PriceEvent; index: number }) => {
  const { ref, inView } = useInView(0.15);
  const ImpactIcon = event.impact === 'hausse'
    ? () => <ArrowUpRight className="w-4 h-4 text-destructive" />
    : event.impact === 'baisse'
      ? () => <ArrowDownRight className="w-4 h-4 text-green-600" />
      : () => <Minus className="w-4 h-4 text-muted-foreground" />;

  return (
    <div
      ref={ref}
      className={`relative pl-8 transition-all duration-600 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="shrink-0 tabular-nums">{event.year}</Badge>
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ImpactIcon />
            {event.title}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Animated stat card (extracted) ───
const StatCard = ({ stat, started }: { stat: typeof keyStats[0]; started: boolean }) => {
  const v = useCountUp(stat.value, 2000, started);
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="text-3xl md:text-4xl font-black text-primary tabular-nums">
          {v}{stat.suffix}
        </div>
        <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
      </CardContent>
    </Card>
  );
};

// ─── MAIN PAGE ───
const CHART_COLORS = [
  'hsl(221, 83%, 53%)', 'hsl(160, 60%, 45%)', 'hsl(280, 60%, 55%)',
  'hsl(30, 80%, 55%)', 'hsl(340, 70%, 50%)', 'hsl(190, 70%, 45%)',
  'hsl(50, 80%, 50%)', 'hsl(0, 70%, 55%)', 'hsl(120, 50%, 45%)',
];

const CoursEau = () => {
  const [period, setPeriod] = useState<Period>('max');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [brandTimeseries, setBrandTimeseries] = useState<BrandTimeseries[]>([]);
  const [timeseriesLoading, setTimeseriesLoading] = useState(false);
  const heroRef = useInView(0.3);
  const statsRef = useInView(0.2);
  const brandRef = useInView(0.2);
  const seo = (seoData as any).coursEau ?? seoData.prixEaux;

  const { brands } = useBrands();

  useEffect(() => {
    if (!selectedBrand) return;
    setTimeseriesLoading(true);
    getBrandTimeseries(selectedBrand, 90)
      .then(setBrandTimeseries)
      .catch(() => setBrandTimeseries([]))
      .finally(() => setTimeseriesLoading(false));
  }, [selectedBrand]);

  // Merge timeseries data into a single dataset for the line chart
  const timeseriesChartData = React.useMemo(() => {
    if (!brandTimeseries.length) return [];
    const dateMap: Record<string, Record<string, number>> = {};
    for (const series of brandTimeseries) {
      for (const pt of series.points) {
        if (!dateMap[pt.date]) dateMap[pt.date] = {};
        dateMap[pt.date][series.retailer_slug || 'unknown'] = pt.median_price_per_l;
      }
    }
    return Object.entries(dateMap)
      .map(([date, retailers]) => ({ date, ...retailers }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [brandTimeseries]);

  const bottleData = filterByPeriod(bottlePriceHistory, period);
  const tapData = filterByPeriod(tapPriceHistory, period);

  const latestBottle = bottlePriceHistory[bottlePriceHistory.length - 1].price;
  const latestTap = tapPriceHistory[tapPriceHistory.length - 1].price;

  const bottleCounter = useCountUp(Math.round(latestBottle * 100), 1600, heroRef.inView);
  const tapCounter = useCountUp(Math.round(latestTap * 100), 1600, heroRef.inView);

  return (
    <Layout>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/cours-eau"
      />

      {/* ─── HERO ─── */}
      <section
        ref={heroRef.ref}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 py-16 md:py-24 px-4"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-background rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container mx-auto max-w-5xl text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
            <TrendingUp className="w-3 h-3 mr-1" /> Données 2010–2025
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Cours de l'eau
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Suivez l'évolution des prix de l'eau en bouteille et du robinet en France, et comprenez les facteurs qui influencent votre facture.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-100" />
              <div className="text-4xl font-black tabular-nums">
                {(bottleCounter / 100).toFixed(2)}<span className="text-lg ml-1">€/L</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">Eau en bouteille</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Droplets className="w-8 h-8 mx-auto mb-2 text-cyan-200" />
              <div className="text-4xl font-black tabular-nums">
                {(tapCounter / 100).toFixed(2)}<span className="text-lg ml-1">€/m³</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">Eau du robinet</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-14">

        <div className="flex justify-center gap-2">
          {([
            { key: '5ans', label: '5 ans' },
            { key: '10ans', label: '10 ans' },
            { key: 'max', label: 'Max' },
          ] as const).map(p => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.key)}
              className="min-w-[70px]"
            >
              {p.label}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="bouteille" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="bouteille">🧴 Eau en bouteille</TabsTrigger>
            <TabsTrigger value="robinet">🚰 Eau du robinet</TabsTrigger>
          </TabsList>

          <TabsContent value="bouteille" className="animate-fade-in">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Prix moyen eau en bouteille (€/L)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={bottleData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradBottle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} className="fill-muted-foreground" tickFormatter={v => `${v.toFixed(2)}€`} />
                    <Tooltip content={<PriceTooltip unit="€/L" />} />
                    {priceEvents.map(e => (
                      <ReferenceLine key={e.year} x={e.year} stroke="hsl(0, 84%, 60%)" strokeDasharray="4 4" strokeOpacity={0.4} />
                    ))}
                    <Area type="monotone" dataKey="price" stroke="hsl(221, 83%, 53%)" strokeWidth={2.5} fill="url(#gradBottle)" animationDuration={1500} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {bottlePriceFactors.map((f, i) => (
                <FactorCard key={f.title} factor={f} index={i} colorClass="bg-primary/10 text-primary" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="robinet" className="animate-fade-in">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Prix moyen eau du robinet (€/m³)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={tapData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTap" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} className="fill-muted-foreground" tickFormatter={v => `${v.toFixed(2)}€`} />
                    <Tooltip content={<PriceTooltip unit="€/m³" />} />
                    <Area type="monotone" dataKey="price" stroke="hsl(160, 60%, 45%)" strokeWidth={2.5} fill="url(#gradTap)" animationDuration={1500} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {tapPriceFactors.map((f, i) => (
                <FactorCard key={f.title} factor={f} index={i} colorClass="bg-green-100 text-green-700" />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── BRAND PRICE EVOLUTION SECTION ─── */}
        <section
          ref={brandRef.ref}
          className={`transition-all duration-700 ${brandRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Prix par marque — évolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Choisir une marque…" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!selectedBrand && (
                <p className="text-sm text-muted-foreground">Sélectionnez une marque pour visualiser l'évolution de ses prix par enseigne.</p>
              )}

              {timeseriesLoading && <Skeleton className="h-[360px] w-full" />}

              {selectedBrand && !timeseriesLoading && timeseriesChartData.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Aucune donnée historique disponible pour {selectedBrand} sur les 90 derniers jours.
                </p>
              )}

              {selectedBrand && !timeseriesLoading && timeseriesChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={timeseriesChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      {brandTimeseries.map((series, i) => (
                        <linearGradient key={series.retailer_slug} id={`gradBrand-${series.retailer_slug}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      tickFormatter={(d: string) => {
                        const [, m, day] = d.split('-');
                        return `${day}/${m}`;
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="fill-muted-foreground"
                      tickFormatter={(v: number) => `${v.toFixed(2)}€`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const [, m, day] = (label as string).split('-');
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
                            <p className="font-semibold text-foreground mb-1">{day}/{m}</p>
                            {payload.map((entry: any) => {
                              const retailer = brandTimeseries.find(s => s.retailer_slug === entry.dataKey);
                              return (
                                <p key={entry.dataKey} style={{ color: entry.color }} className="font-medium">
                                  {retailer?.retailer_name || entry.dataKey} : {Number(entry.value).toFixed(3)} €/L
                                </p>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                    <Legend
                      formatter={(value: string) => {
                        const retailer = brandTimeseries.find(s => s.retailer_slug === value);
                        return retailer?.retailer_name || value;
                      }}
                    />
                    {brandTimeseries.map((series, i) => (
                      <Area
                        key={series.retailer_slug}
                        type="monotone"
                        dataKey={series.retailer_slug || 'unknown'}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={2}
                        fill={`url(#gradBrand-${series.retailer_slug})`}
                        activeDot={{ r: 4 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>


        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Événements marquants
          </h2>
          <div className="relative border-l-2 border-primary/20 ml-4 space-y-6">
            {priceEvents.map((e, i) => (
              <TimelineEvent key={e.year} event={e} index={i} />
            ))}
          </div>
        </section>

        {/* Stats */}
        <section ref={statsRef.ref}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyStats.map(s => (
              <StatCard key={s.label} stat={s} started={statsRef.inView} />
            ))}
          </div>
        </section>

        {/* Sources */}
        <section className="text-center text-sm text-muted-foreground border-t pt-8">
          <p>
            Sources : INSEE (indices prix à la consommation), SISPEA (Observatoire des services d'eau et d'assainissement),
            DGCCRF, rapports annuels des agences de l'eau. Données indicatives, prix moyens nationaux.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default CoursEau;
