import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getEUWaterQuality, getEUPollutantsBaseline, enrichPollutantsWithApi, getEUWaterComposition, getScoreBadgeClass, type EUCountryWaterQuality, type EUPollutant, type EUWaterComposition } from '@/services/europeWaterApi';
import { Droplets, Users, AlertTriangle, Shield, Activity, Beaker, Loader2 } from 'lucide-react';

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

const DiagnosticEurope = () => {
  const [quality, setQuality] = useState<EUCountryWaterQuality[]>([]);
  const [pollutants, setPollutants] = useState<EUPollutant[]>([]);
  const [composition, setComposition] = useState<EUWaterComposition[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    Promise.all([getEUWaterQuality(), getEUPollutantsBaseline(), getEUWaterComposition()])
      .then(([q, p, c]) => {
        setQuality(q);
        setPollutants(p);
        setComposition(c);
        setLoading(false);

        setEnriching(true);
        enrichPollutantsWithApi(p)
          .then(enriched => setPollutants(enriched))
          .finally(() => setEnriching(false));
      });
  }, []);

  const country = quality.find(c => c.countryCode === selectedCountry);
  const countryPollutants = pollutants.filter(p => p.countryCode === selectedCountry);
  const exceedances = countryPollutants.filter(p => p.exceedanceRatePct > 0);
  const countryComposition = composition.filter(c => c.countryCode === selectedCountry);

  return (
    <Layout>
      <SEOHead {...seoData.diagnosticEurope} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Diagnostic qualité de l'eau — Europe</h1>
        <p className="text-muted-foreground mb-6">
          Sélectionnez un pays pour visualiser ses indicateurs de qualité de l'eau potable (données EEA 2023).
        </p>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Choisir un pays…" />
                </SelectTrigger>
                <SelectContent>
                  {quality.map(c => (
                    <SelectItem key={c.countryCode} value={c.countryCode}>
                      {c.countryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {enriching && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Mise à jour…
                </div>
              )}
            </div>

            {country && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      {country.countryName}
                      <Badge className={getScoreBadgeClass(country.qualityScore)}>
                        Score {country.qualityScore}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard icon={<Activity className="h-4 w-4" />} label="Conformité" value={`${country.complianceRate}%`} />
                      <StatCard icon={<Droplets className="h-4 w-4" />} label="Nitrates moy." value={`${country.nitrateAvg} mg/L`} />
                      <StatCard icon={<Users className="h-4 w-4" />} label="Population desservie" value={`${country.populationServedMillions} M`} />
                      <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Zones de distribution" value={country.waterSupplyZones.toLocaleString()} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Violations réglementaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <ViolationCard label="Pesticides" count={country.pesticideViolations} />
                      <ViolationCard label="Plomb" count={country.leadViolations} />
                      <ViolationCard label="Bactéries" count={country.bacteriaViolations} />
                    </div>
                  </CardContent>
                </Card>

                {exceedances.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Polluants avec dépassements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {exceedances.map(p => (
                          <div key={p.pollutant} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <span className="font-medium">{p.pollutant}</span>
                              <span className="text-muted-foreground text-sm ml-2">({p.category})</span>
                            </div>
                            <div className="text-right text-sm">
                              <div>Moy. {p.avgValue} {p.unit} <span className="text-muted-foreground">/ limite {p.limitValue}</span></div>
                              <div className="text-destructive font-medium">{p.exceedanceRatePct}% de dépassement</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {countryComposition.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-primary" />
                        Composition de l'eau
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {countryComposition.map(c => (
                          <div key={c.parameter} className="text-center p-3 rounded-lg bg-muted/50">
                            <div className="text-lg font-bold text-foreground">
                              {c.avgValue} <span className="text-xs font-normal text-muted-foreground">{c.unit}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{PARAM_LABELS[c.parameter] || c.parameter}</div>
                            {(c.minValue > 0 || c.maxValue > 0) && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {c.minValue} – {c.maxValue}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="text-center p-3 rounded-lg bg-muted/50">
    <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
    <div className="text-lg font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const ViolationCard: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div className={`text-center p-4 rounded-lg ${count > 5 ? 'bg-destructive/10' : 'bg-muted/50'}`}>
    <div className={`text-2xl font-bold ${count > 5 ? 'text-destructive' : ''}`}>{count}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default DiagnosticEurope;
