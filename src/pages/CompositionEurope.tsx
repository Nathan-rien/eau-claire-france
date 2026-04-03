import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getEUWaterComposition, type EUWaterComposition } from '@/services/europeWaterApi';
import { Beaker, ArrowUpDown, ChevronDown, ChevronUp, Search, Droplets, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PARAM_LABELS: Record<string, string> = {
  'Total hardness': 'Dureté totale',
  'Carbonate hardness': 'Dureté carbonatée',
  'Electrical conductivity': 'Conductivité',
  'Nitrate': 'Nitrate',
  'pH': 'pH',
  'Calcium': 'Calcium',
  'Magnesium': 'Magnésium',
  'Sodium': 'Sodium',
  'Ammonium': 'Ammonium',
  'Chloride': 'Chlorure',
  'Sulphate': 'Sulfate',
};

const PARAM_ORDER = Object.keys(PARAM_LABELS);

// Thresholds for conditional coloring (EU drinking water directive)
const THRESHOLDS: Record<string, { warn: number | [number, number]; danger: number | [number, number] }> = {
  'Nitrate': { warn: 40, danger: 50 },
  'pH': { warn: [6.5, 9.0], danger: [6.0, 9.5] },
  'Sodium': { warn: 150, danger: 200 },
  'Ammonium': { warn: 0.4, danger: 0.5 },
  'Chloride': { warn: 200, danger: 250 },
  'Sulphate': { warn: 200, danger: 250 },
  'Electrical conductivity': { warn: 2000, danger: 2500 },
};

function getCellColor(param: string, value: number): string {
  const t = THRESHOLDS[param];
  if (!t) return '';

  if (Array.isArray(t.danger)) {
    // Range threshold (pH)
    const [dLow, dHigh] = t.danger as [number, number];
    const [wLow, wHigh] = t.warn as [number, number];
    if (value < dLow || value > dHigh) return 'bg-destructive/20 text-destructive';
    if (value < wLow || value > wHigh) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  }

  if (value >= (t.danger as number)) return 'bg-destructive/20 text-destructive';
  if (value >= (t.warn as number)) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  if (value > 0) return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  return '';
}

interface PivotRow {
  countryCode: string;
  countryName: string;
  params: Record<string, { avg: number; min: number; max: number; unit: string; samples: number }>;
}

const CompositionEurope: React.FC = () => {
  const [raw, setRaw] = useState<EUWaterComposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortParam, setSortParam] = useState<string>('countryName');
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const { t } = useLanguage();
  useEffect(() => {
    getEUWaterComposition().then(d => { setRaw(d); setLoading(false); });
  }, []);

  // Pivot data: group by country
  const pivotData = useMemo<PivotRow[]>(() => {
    const map = new Map<string, PivotRow>();
    for (const r of raw) {
      if (!map.has(r.countryCode)) {
        map.set(r.countryCode, { countryCode: r.countryCode, countryName: r.countryName, params: {} });
      }
      map.get(r.countryCode)!.params[r.parameter] = {
        avg: r.avgValue, min: r.minValue, max: r.maxValue, unit: r.unit, samples: r.samples,
      };
    }
    return Array.from(map.values());
  }, [raw]);

  // Filter + sort
  const sortedData = useMemo(() => {
    let filtered = pivotData;
    if (filter) {
      const q = filter.toLowerCase();
      filtered = pivotData.filter(r => r.countryName.toLowerCase().includes(q) || r.countryCode.toLowerCase().includes(q));
    }

    return [...filtered].sort((a, b) => {
      if (sortParam === 'countryName') {
        return sortAsc ? a.countryName.localeCompare(b.countryName) : b.countryName.localeCompare(a.countryName);
      }
      const va = a.params[sortParam]?.avg ?? -1;
      const vb = b.params[sortParam]?.avg ?? -1;
      return sortAsc ? va - vb : vb - va;
    });
  }, [pivotData, filter, sortParam, sortAsc]);

  const handleSort = (param: string) => {
    if (sortParam === param) {
      setSortAsc(!sortAsc);
    } else {
      setSortParam(param);
      setSortAsc(true);
    }
  };

  const seo = seoData.compositionEurope || seoData.classementEurope;

  return (
    <Layout>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/composition-europe"
        schemaData={seo.schemaData}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Beaker className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Composition physico-chimique de l'eau en Europe
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tableau comparatif interactif des 11 paramètres physico-chimiques de l'eau potable dans les 27 pays de l'UE.
            Données DISCODATA / Agence européenne de l'environnement.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Link to="/classement-europe">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Classement Europe</Badge>
            </Link>
            <Link to="/polluants-europe">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Polluants Europe</Badge>
            </Link>
            <Link to="/diagnostic-europe">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Diagnostic Europe</Badge>
            </Link>
          </div>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardContent className="py-3 flex flex-wrap gap-4 items-center text-sm">
            <span className="font-medium text-muted-foreground">Légende :</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200 dark:bg-green-900/40 inline-block" /> Conforme
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-900/40 inline-block" /> Proche limite
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-destructive/30 inline-block" /> Dépassement
            </span>
          </CardContent>
        </Card>

        {/* Search filter */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrer par pays..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Droplets className="h-8 w-8 animate-pulse text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement des données…</span>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto table-wrap">
                <table className="w-full text-sm table-sticky-col">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="sticky left-0 z-10 bg-muted/90 backdrop-blur px-3 py-2 text-left font-medium min-w-[140px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:text-primary"
                          onClick={() => handleSort('countryName')}
                        >
                          Pays
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </th>
                      {PARAM_ORDER.map(param => (
                        <th key={param} className="px-2 py-2 text-center font-medium min-w-[90px] whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium hover:text-primary text-xs"
                            onClick={() => handleSort(param)}
                          >
                            {PARAM_LABELS[param]}
                            {sortParam === param && (
                              sortAsc ? <ChevronUp className="ml-0.5 h-3 w-3" /> : <ChevronDown className="ml-0.5 h-3 w-3" />
                            )}
                            {sortParam !== param && <ArrowUpDown className="ml-0.5 h-3 w-3 opacity-40" />}
                          </Button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map(row => {
                      const isExpanded = expandedCountry === row.countryCode;
                      return (
                        <React.Fragment key={row.countryCode}>
                          <tr
                            className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => setExpandedCountry(isExpanded ? null : row.countryCode)}
                          >
                            <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium flex items-center gap-1.5">
                              {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                              <span className="text-xs text-muted-foreground">{row.countryCode}</span>
                              {row.countryName}
                            </td>
                            {PARAM_ORDER.map(param => {
                              const val = row.params[param];
                              const colorClass = val ? getCellColor(param, val.avg) : '';
                              return (
                                <td key={param} className={`px-2 py-2 text-center tabular-nums ${colorClass}`}>
                                  {val ? val.avg.toFixed(1) : '–'}
                                </td>
                              );
                            })}
                          </tr>
                          {isExpanded && (
                            <tr className="bg-muted/20">
                              <td colSpan={PARAM_ORDER.length + 1} className="px-2 py-2 sm:px-4 sm:py-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 min-w-0">
                                  {PARAM_ORDER.map(param => {
                                    const val = row.params[param];
                                    if (!val) return null;
                                    return (
                                      <div key={param} className="flex flex-col gap-0.5 p-2 rounded-md bg-background border">
                                        <span className="font-medium text-xs text-foreground">{PARAM_LABELS[param]}</span>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>Moy: <strong className="text-foreground">{val.avg.toFixed(2)}</strong></span>
                                          <span>{val.unit}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>Min: {val.min.toFixed(2)}</span>
                                          <span>Max: {val.max.toFixed(2)}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{val.samples} échantillons</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {sortedData.length === 0 && (
                      <tr>
                        <td colSpan={PARAM_ORDER.length + 1} className="text-center py-8 text-muted-foreground">
                          Aucun pays ne correspond à votre recherche.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats summary */}
        {!loading && pivotData.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-4 text-center">
                <FlaskConical className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold text-foreground">{pivotData.length}</div>
                <div className="text-xs text-muted-foreground">Pays analysés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <Beaker className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold text-foreground">{PARAM_ORDER.length}</div>
                <div className="text-xs text-muted-foreground">Paramètres</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <Droplets className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold text-foreground">
                  {pivotData.reduce((acc, r) => {
                    const n = r.params['Nitrate']?.avg ?? 0;
                    return n > 50 ? acc + 1 : acc;
                  }, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Pays nitrate &gt; 50 mg/L</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <FlaskConical className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold text-foreground">
                  {(pivotData.reduce((acc, r) => acc + (r.params['pH']?.avg ?? 0), 0) / pivotData.length).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">pH moyen UE</div>
              </CardContent>
            </Card>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Source : DISCODATA / WISE_SOE — Agence européenne de l'environnement (AEE). Dernière mise à jour : 2024.
        </p>
      </div>
    </Layout>
  );
};

export default CompositionEurope;
