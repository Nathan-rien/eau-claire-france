import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEUWaterQuality, getEUPollutants, getScoreBadgeClass, type EUCountryWaterQuality, type EUPollutant } from '@/services/europeWaterApi';
import { AlertTriangle, ShieldAlert, TrendingDown } from 'lucide-react';

const AlertesEurope = () => {
  const [quality, setQuality] = useState<EUCountryWaterQuality[]>([]);
  const [pollutants, setPollutants] = useState<EUPollutant[]>([]);

  useEffect(() => {
    Promise.all([getEUWaterQuality(), getEUPollutants()]).then(([q, p]) => {
      setQuality(q);
      setPollutants(p);
    });
  }, []);

  const worstCountries = quality.filter(c => c.qualityScore === 'C' || c.complianceRate < 96);
  const allExceedances = pollutants.filter(p => p.exceedanceRatePct > 5)
    .sort((a, b) => b.exceedanceRatePct - a.exceedanceRatePct);

  return (
    <Layout>
      <SEOHead
        title="Alertes qualité de l'eau en Europe | InfoEau"
        description="Pays et polluants les plus préoccupants en Europe : violations réglementaires, faible conformité, dépassements de seuils."
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Alertes qualité — Europe</h1>
        <p className="text-muted-foreground mb-8">
          Pays en situation de non-conformité et polluants avec les taux de dépassement les plus élevés (données EEA 2023).
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
              <div className="space-y-3">
                {worstCountries.map(c => (
                  <div key={c.countryCode} className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <span className="font-semibold">{c.countryName}</span>
                        <Badge className={`ml-2 ${getScoreBadgeClass(c.qualityScore)}`}>
                          Score {c.qualityScore}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Conformité : <span className="font-bold">{c.complianceRate}%</span></div>
                      <div className="text-muted-foreground">
                        {c.pesticideViolations + c.leadViolations + c.bacteriaViolations} violations totales
                      </div>
                    </div>
                  </div>
                ))}
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
                {allExceedances.slice(0, 15).map((p, i) => (
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
