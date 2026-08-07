import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getEUWaterQuality, getEUPollutantsBaseline, enrichPollutantsWithApi, getEUWaterComposition, getScoreBadgeClass, type EUCountryWaterQuality, type EUPollutant, type EUWaterComposition } from '@/services/europeWaterApi';
import { Trophy, ArrowUpDown, ChevronDown, FlaskConical, Shield, Users, Droplets, MapPin, Beaker, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/LocalizedLink';

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

type SortKey = 'complianceRate' | 'nitrateAvg' | 'qualityScore' | 'countryName';

const ClassementEurope: React.FC = () => {
  const [data, setData] = useState<EUCountryWaterQuality[]>([]);
  const [pollutants, setPollutants] = useState<EUPollutant[]>([]);
  const [composition, setComposition] = useState<EUWaterComposition[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('complianceRate');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const { t } = useLanguage();
  useEffect(() => {
    // Phase 1: Load CSVs in parallel (fast)
    Promise.all([getEUWaterQuality(), getEUPollutantsBaseline(), getEUWaterComposition()])
      .then(([q, p, c]) => {
        setData(q);
        setPollutants(p);
        setComposition(c);
        setLoading(false);

        // Phase 2: Enrich pollutants with API in background
        setEnriching(true);
        enrichPollutantsWithApi(p)
          .then(enriched => setPollutants(enriched))
          .finally(() => setEnriching(false));
      });
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'countryName'); }
  };

  const sorted = useMemo(() =>
    [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'countryName') cmp = a.countryName.localeCompare(b.countryName);
      else if (sortKey === 'qualityScore') cmp = a.qualityScore.localeCompare(b.qualityScore);
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortAsc ? cmp : -cmp;
    }), [data, sortKey, sortAsc]);

  // Only compute pollutants/composition for expanded country
  const expandedPollutants = useMemo(() =>
    expandedCountry ? pollutants.filter(p => p.countryCode === expandedCountry) : [],
    [pollutants, expandedCountry]);

  const expandedComp = useMemo(() =>
    expandedCountry ? composition.filter(c => c.countryCode === expandedCountry) : [],
    [composition, expandedCountry]);

  return (
    <Layout>
      <SEOHead {...seoData.classementEurope} />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t('europeRanking.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('europeRanking.subtitle')}</p>
          <Link to="/classement" className="text-sm text-primary hover:underline">
            {t('europeRanking.backFrance')}
          </Link>
          {enriching && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Mise à jour en cours…
            </div>
          )}
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('countryName')} className="gap-1 px-0">
                        Pays <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('qualityScore')} className="gap-1 px-0">
                        Score <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('complianceRate')} className="gap-1 px-0">
                        Conformité <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('nitrateAvg')} className="gap-1 px-0">
                        Nitrates moy. <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Violations</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((c, i) => {
                    const isExpanded = expandedCountry === c.countryCode;

                    return (
                      <React.Fragment key={c.countryCode}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => setExpandedCountry(isExpanded ? null : c.countryCode)}
                        >
                          <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{c.countryName}</TableCell>
                          <TableCell>
                            <Badge className={getScoreBadgeClass(c.qualityScore)}>{c.qualityScore}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{c.complianceRate}%</TableCell>
                          <TableCell>{c.nitrateAvg} mg/L</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                            {c.pesticideViolations + c.leadViolations + c.bacteriaViolations} total
                          </TableCell>
                          <TableCell>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={7} className="p-4">
                              <div className="space-y-4">
                                {/* Résumé */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span><strong className="text-foreground">{c.populationServedMillions}M</strong> habitants desservis</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span><strong className="text-foreground">{c.waterSupplyZones.toLocaleString()}</strong> zones d'approvisionnement</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <span>📅 Rapport <strong className="text-foreground">{c.reportYear}</strong></span>
                                  </div>
                                </div>

                                {/* Violations détaillées */}
                                <div className="flex flex-wrap gap-3">
                                  <div className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-sm border">
                                    <FlaskConical className="w-4 h-4 text-amber-500" />
                                    <span>Pesticides : <strong>{c.pesticideViolations}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-sm border">
                                    <Shield className="w-4 h-4 text-slate-500" />
                                    <span>Plomb : <strong>{c.leadViolations}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-sm border">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    <span>Bactéries : <strong>{c.bacteriaViolations}</strong></span>
                                  </div>
                                </div>

                                {/* Polluants détectés */}
                                {expandedPollutants.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Polluants détectés</h4>
                                    <div className="rounded-md border overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-xs">Polluant</TableHead>
                                            <TableHead className="text-xs">Catégorie</TableHead>
                                            <TableHead className="text-xs">Moyenne</TableHead>
                                            <TableHead className="text-xs">Limite</TableHead>
                                            <TableHead className="text-xs">Dépassement</TableHead>
                                            <TableHead className="text-xs">Zones</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {expandedPollutants.map((p, j) => (
                                            <TableRow key={j}>
                                              <TableCell className="text-xs font-medium">{p.pollutant}</TableCell>
                                              <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                                              <TableCell className="text-xs">{p.avgValue} {p.unit}</TableCell>
                                              <TableCell className="text-xs">{p.limitValue} {p.unit}</TableCell>
                                              <TableCell className="text-xs">
                                                <Badge
                                                  variant="outline"
                                                  className={p.exceedanceRatePct > 1
                                                    ? 'border-destructive text-destructive'
                                                    : 'border-muted-foreground text-muted-foreground'}
                                                >
                                                  {p.exceedanceRatePct}%
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="text-xs text-muted-foreground">{p.affectedZones}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                )}

                                {/* Composition physico-chimique */}
                                {expandedComp.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                                      <Beaker className="w-4 h-4 text-primary" />
                                      Composition physico-chimique
                                    </h4>
                                    <div className="rounded-md border overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-xs">Paramètre</TableHead>
                                            <TableHead className="text-xs">Moyenne</TableHead>
                                            <TableHead className="text-xs">Min</TableHead>
                                            <TableHead className="text-xs">Max</TableHead>
                                            <TableHead className="text-xs">Unité</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {expandedComp.map((comp, j) => (
                                            <TableRow key={j}>
                                              <TableCell className="text-xs font-medium">{PARAM_LABELS[comp.parameter] || comp.parameter}</TableCell>
                                              <TableCell className="text-xs font-semibold">{comp.avgValue}</TableCell>
                                              <TableCell className="text-xs text-muted-foreground">{comp.minValue}</TableCell>
                                              <TableCell className="text-xs text-muted-foreground">{comp.maxValue}</TableCell>
                                              <TableCell className="text-xs text-muted-foreground">{comp.unit}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                )}

                                {/* Liens */}
                                <div className="flex gap-3 pt-1">
                                  <Link to="/carte-polluants-europe" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    🗺️ Carte des polluants
                                  </Link>
                                  <Link to="/alertes-europe" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    🔔 Alertes Europe
                                  </Link>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Source : EEA WISE DWD, 2023. Scores : A (≥99%), B (97-99%), C (&lt;97%).
        </p>
      </div>
    </Layout>
  );
};

export default ClassementEurope;
