import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEUWaterQuality, getScoreBadgeClass, type EUCountryWaterQuality } from '@/services/europeWaterApi';
import { Droplets, MapPin, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarteEurope: React.FC = () => {
  const [data, setData] = useState<EUCountryWaterQuality[]>([]);
  const [selected, setSelected] = useState<EUCountryWaterQuality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEUWaterQuality().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const avgCompliance = data.length ? (data.reduce((s, c) => s + c.complianceRate, 0) / data.length).toFixed(1) : '—';
  const totalPop = data.reduce((s, c) => s + c.populationServedMillions, 0).toFixed(0);
  const countA = data.filter(c => c.qualityScore === 'A').length;

  return (
    <Layout>
      <SEOHead
        title="Carte de la qualité de l'eau en Europe – 27 pays EU"
        description="Explorez la qualité de l'eau potable dans les 27 pays de l'Union européenne. Données basées sur la Directive Eau Potable (DWD) de l'EEA."
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🇪🇺</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Qualité de l'eau en Europe
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Données de conformité de l'eau potable dans les 27 pays de l'UE, basées sur la Directive Eau Potable (Drinking Water Directive) de l'Agence européenne pour l'environnement.
          </p>
          <Link to="/carte" className="text-sm text-primary hover:underline">
            ← Retour à la carte France
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Droplets className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{avgCompliance}%</div>
              <div className="text-xs text-muted-foreground">Conformité moyenne</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">27</div>
              <div className="text-xs text-muted-foreground">Pays analysés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{totalPop}M</div>
              <div className="text-xs text-muted-foreground">Population couverte</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{countA}</div>
              <div className="text-xs text-muted-foreground">Pays score A</div>
            </CardContent>
          </Card>
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-32" />
              </Card>
            ))
          ) : (
            data
              .sort((a, b) => b.complianceRate - a.complianceRate)
              .map(country => (
                <Card
                  key={country.countryCode}
                  className={`cursor-pointer transition-all hover:shadow-md ${selected?.countryCode === country.countryCode ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelected(selected?.countryCode === country.countryCode ? null : country)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{country.countryName}</CardTitle>
                      <Badge className={getScoreBadgeClass(country.qualityScore)}>
                        {country.qualityScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conformité</span>
                      <span className="font-semibold text-foreground">{country.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${country.complianceRate}%`,
                          backgroundColor: country.complianceRate >= 99 ? 'hsl(142, 76%, 36%)' : country.complianceRate >= 97 ? 'hsl(48, 96%, 53%)' : 'hsl(0, 84%, 60%)',
                        }}
                      />
                    </div>
                    {selected?.countryCode === country.countryCode && (
                      <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t border-border mt-2">
                        <div className="flex justify-between"><span>Nitrates moy.</span><span>{country.nitrateAvg} mg/L</span></div>
                        <div className="flex justify-between"><span>Violations pesticides</span><span>{country.pesticideViolations}</span></div>
                        <div className="flex justify-between"><span>Violations plomb</span><span>{country.leadViolations}</span></div>
                        <div className="flex justify-between"><span>Violations bactéries</span><span>{country.bacteriaViolations}</span></div>
                        <div className="flex justify-between"><span>Population desservie</span><span>{country.populationServedMillions}M</span></div>
                        <div className="flex justify-between"><span>Zones d'approvisionnement</span><span>{country.waterSupplyZones.toLocaleString()}</span></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Source */}
        <p className="text-xs text-muted-foreground text-center">
          Source : EEA Waterbase – WISE Drinking Water Directive (DWD), rapport 2023. Données agrégées au niveau national.
        </p>
      </div>
    </Layout>
  );
};

export default CarteEurope;
