import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEUPollutants, type EUPollutant } from '@/services/europeWaterApi';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

const PolluantsEurope: React.FC = () => {
  const [data, setData] = useState<EUPollutant[]>([]);
  const [selectedPollutant, setSelectedPollutant] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  useEffect(() => {
    getEUPollutants().then(setData);
  }, []);

  const pollutants = useMemo(() => [...new Set(data.map(d => d.pollutant))], [data]);
  const countries = useMemo(() => [...new Set(data.map(d => d.countryName))].sort(), [data]);

  const filtered = useMemo(() => {
    let result = data;
    if (selectedPollutant !== 'all') result = result.filter(d => d.pollutant === selectedPollutant);
    if (selectedCountry !== 'all') result = result.filter(d => d.countryName === selectedCountry);
    return result.sort((a, b) => b.exceedanceRatePct - a.exceedanceRatePct);
  }, [data, selectedPollutant, selectedCountry]);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'Chimique': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Microbiologique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Métaux lourds': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Chimique émergent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <SEOHead
        {...seoData.polluantsEurope}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FlaskConical className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Polluants en Europe</h1>
          </div>
          <p className="text-muted-foreground">Dépassements de seuils dans l'eau potable des 27 pays de l'UE</p>
          <Link to="/polluants" className="text-sm text-primary hover:underline">
            ← Retour aux polluants France
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les polluants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les polluants</SelectItem>
              {pollutants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p, i) => (
            <Card key={`${p.countryCode}-${p.pollutant}-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{p.pollutant}</CardTitle>
                  <Badge className={categoryColor(p.category)}>{p.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.countryName}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valeur moyenne</span>
                  <span className="font-medium">{p.avgValue} {p.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Limite réglementaire</span>
                  <span>{p.limitValue} {p.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taux de dépassement</span>
                  <span className={`font-semibold ${p.exceedanceRatePct > 2 ? 'text-destructive' : p.exceedanceRatePct > 1 ? 'text-yellow-600' : 'text-foreground'}`}>
                    {p.exceedanceRatePct}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zones affectées</span>
                  <span>{p.affectedZones}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucune donnée pour cette sélection.</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Source : EEA WISE DWD – QualityInformation, 2023. Seuils selon la Directive 2020/2184.
        </p>
      </div>
    </Layout>
  );
};

export default PolluantsEurope;
