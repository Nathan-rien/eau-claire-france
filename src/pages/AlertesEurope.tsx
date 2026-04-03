import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getEUWaterQuality, getEUPollutants, getScoreBadgeClass, type EUCountryWaterQuality, type EUPollutant } from '@/services/europeWaterApi';
import { AlertTriangle, ShieldAlert, TrendingDown, ChevronDown, Bug, FlaskConical, Circle } from 'lucide-react';

const AlertesEurope = () => {
  const [quality, setQuality] = useState<EUCountryWaterQuality[]>([]);
  const [pollutants, setPollutants] = useState<EUPollutant[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([getEUWaterQuality(), getEUPollutants()]).then(([q, p]) => {
      setQuality(q);
      setPollutants(p);
    });
  }, []);

  const worstCountries = quality.filter(c => c.qualityScore === 'C' || c.complianceRate < 96);
  const allExceedances = pollutants.filter(p => p.exceedanceRatePct > 5)
    .sort((a, b) => b.exceedanceRatePct - a.exceedanceRatePct);

  const getCountryPollutants = (countryCode: string) =>
    pollutants.filter(p => p.countryCode === countryCode);

  return (
    <Layout>
      <SEOHead
        {...seoData.alertesEurope}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{t('europeAlerts.title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('europeAlerts.subtitle')}
        </p>

        {/* Countries with worst scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Pays en alerte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worstCountries.length === 0 ? (
              <p className="text-muted-foreground">Aucun pays en situation critique identifié.</p>
            ) : (
              <div className="space-y-4">
                {worstCountries.map(c => {
                  const countryPollutants = getCountryPollutants(c.countryCode);
                  return (
                    <Collapsible key={c.countryCode}>
                      <div className="rounded-lg bg-destructive/5 border border-destructive/20 overflow-hidden">
                        <CollapsibleTrigger className="w-full text-left p-4 hover:bg-destructive/10 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                              <div>
                                <span className="font-semibold">{c.countryName}</span>
                                <Badge className={`ml-2 ${getScoreBadgeClass(c.qualityScore)}`}>
                                  Score {c.qualityScore}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold">Conformité : {c.complianceRate}%</span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                            </div>
                          </div>

                          {/* Violation breakdown */}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            {c.pesticideViolations > 0 && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <FlaskConical className="h-3.5 w-3.5" />
                                Pesticides : <span className="font-semibold text-foreground">{c.pesticideViolations}</span>
                              </span>
                            )}
                            {c.leadViolations > 0 && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Circle className="h-3.5 w-3.5" />
                                Plomb : <span className="font-semibold text-foreground">{c.leadViolations}</span>
                              </span>
                            )}
                            {c.bacteriaViolations > 0 && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Bug className="h-3.5 w-3.5" />
                                Bactéries : <span className="font-semibold text-foreground">{c.bacteriaViolations}</span>
                              </span>
                            )}
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          {countryPollutants.length > 0 && (
                            <div className="px-4 pb-4 pt-1 border-t border-destructive/10">
                              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Polluants détectés</p>
                              <div className="space-y-1.5">
                                {countryPollutants.map(p => (
                                  <div key={`${p.countryCode}-${p.pollutant}`} className="flex items-center justify-between text-sm py-1.5 px-3 rounded bg-background/60">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{p.pollutant}</span>
                                      <span className="text-muted-foreground text-xs">({p.category})</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span>{p.avgValue} {p.unit}</span>
                                      <span className="text-muted-foreground">limite {p.limitValue}</span>
                                      <Badge variant={p.exceedanceRatePct > 2 ? 'destructive' : 'secondary'} className="text-xs">
                                        {p.exceedanceRatePct}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top exceedances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Dépassements de seuils les plus importants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allExceedances.length === 0 ? (
              <p className="text-muted-foreground">Aucun dépassement significatif identifié.</p>
            ) : (
              <div className="space-y-2">
                {allExceedances.slice(0, 15).map((p) => (
                  <div key={`${p.countryCode}-${p.pollutant}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="font-medium">{p.countryName}</span>
                      <span className="text-muted-foreground text-sm ml-2">— {p.pollutant}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant={p.exceedanceRatePct > 15 ? 'destructive' : 'secondary'}>
                        {p.exceedanceRatePct}% dépassement
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {p.avgValue} {p.unit} / limite {p.limitValue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AlertesEurope;
