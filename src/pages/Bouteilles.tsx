
import React, { useState, useMemo } from 'react';
import { Droplets, Calculator, ArrowRight, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData } from '@/utils/seoData';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBottleData } from '@/hooks/useBottleData';
import { rankBottles } from '@/utils/bottleRanking';

const RobinetVsBouteilles = () => {
  const { t } = useLanguage();
  const { composition, catalog, mdd: mddData, loading, error } = useBottleData();
  const [selectedRegion, setSelectedRegion] = useState('national');

  // Données de comparaison eau du robinet vs bouteilles
  const tapWaterData = {
    price: { min: 0.003, max: 0.005, unit: '€/L' },
    co2: { value: 0.3, unit: 'kg CO2/1000L' },
    quality: 'Contrôlée quotidiennement',
    treatment: 'Traitement local adapté',
    convenience: 'Disponible 24h/24'
  };

  const bottledWaterData = useMemo(() => {
    if (!composition || !catalog || composition.length === 0 || catalog.length === 0) return null;
    
    const rankedBottles = rankBottles(composition);
    const totalBottles = rankedBottles.length;
    const avgPrice = rankedBottles.reduce((sum, b) => sum + (b.nutritionalScore || 0.5), 0) / totalBottles;
    const avgCO2 = 300; // kg CO2/1000L moyenne pour les bouteilles
    
    return {
      totalBrands: totalBottles,
      price: { avg: avgPrice, unit: '€/L' },
      co2: { value: avgCO2, unit: 'kg CO2/1000L' },
      quality: 'Contrôlée à la source',
      convenience: 'Transport et stockage nécessaires'
    };
  }, [composition, catalog, mddData]);

  const comparisonData = [
    {
      criteria: 'Prix',
      tapWater: '0,003 - 0,005 €/L',
      bottledWater: bottledWaterData ? `${bottledWaterData.price.avg.toFixed(2)} €/L` : '0,30 - 3,00 €/L',
      winner: 'robinet'
    },
    {
      criteria: 'Impact carbone',
      tapWater: '0,3 kg CO2/1000L',
      bottledWater: '300 kg CO2/1000L',
      winner: 'robinet'
    },
    {
      criteria: 'Qualité sanitaire',
      tapWater: 'Contrôlée quotidiennement',
      bottledWater: 'Contrôlée à la source',
      winner: 'equal'
    },
    {
      criteria: 'Praticité',
      tapWater: 'Disponible 24h/24',
      bottledWater: 'Transport nécessaire',
      winner: 'robinet'
    },
    {
      criteria: 'Goût',
      tapWater: 'Variable selon région',
      bottledWater: 'Constant',
      winner: 'bouteille'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title="Eau du robinet vs bouteilles : Comparaison complète"
        description="Comparaison détaillée entre l'eau du robinet et les eaux en bouteilles : prix, impact environnemental, qualité et praticité."
        keywords="eau robinet, eau bouteille, comparaison, prix, écologie, qualité"
        canonical="/bouteilles"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Eau du robinet vs bouteilles : Comparaison complète",
          "description": "Comparaison détaillée entre l'eau du robinet et les eaux en bouteilles"
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: 'Robinet vs bouteilles', href: '/bouteilles', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
                <Droplets className="w-8 h-8 text-blue-600" />
                <span>vs</span>
                <Droplets className="w-8 h-8 text-green-600" />
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-700 mb-6">
                Eau du robinet vs Eaux en bouteilles
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comparaison complète pour vous aider à faire le choix le plus adapté à vos besoins et valeurs.
              </p>
            </div>

            {/* Résumé rapide */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    Eau du robinet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">1000x moins chère</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">1000x moins polluante</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Disponible partout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Goût variable selon région</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-green-600" />
                    Eaux en bouteilles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Goût constant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Choix de minéralisation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Coût important</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Impact environnemental</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tableau comparatif détaillé */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Comparaison détaillée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Critère</th>
                        <th className="text-center py-3 px-4">Eau du robinet</th>
                        <th className="text-center py-3 px-4">Eaux en bouteilles</th>
                        <th className="text-center py-3 px-4">Gagnant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{row.criteria}</td>
                          <td className="py-3 px-4 text-center">{row.tapWater}</td>
                          <td className="py-3 px-4 text-center">{row.bottledWater}</td>
                          <td className="py-3 px-4 text-center">
                            {row.winner === 'robinet' && (
                              <Badge className="bg-blue-100 text-blue-800">Robinet</Badge>
                            )}
                            {row.winner === 'bouteille' && (
                              <Badge className="bg-green-100 text-green-800">Bouteille</Badge>
                            )}
                            {row.winner === 'equal' && (
                              <Badge variant="outline">Égalité</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques des bouteilles */}
            {bottledWaterData && (
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle>Panorama des eaux en bouteilles en France</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{bottledWaterData.totalBrands}</div>
                      <div className="text-sm text-gray-600">Marques référencées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{bottledWaterData.price.avg.toFixed(2)}€</div>
                      <div className="text-sm text-gray-600">Prix moyen/litre</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">300x</div>
                      <div className="text-sm text-gray-600">Plus polluant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">1000x</div>
                      <div className="text-sm text-gray-600">Plus cher</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA vers les outils */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-800">Tester votre eau du robinet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Découvrez la qualité de l'eau dans votre commune et les éventuels polluants présents.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/diagnostic">
                      Faire le diagnostic
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="text-green-800">Explorer les bouteilles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Comparez les eaux en bouteilles et trouvez celle qui correspond à vos besoins.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/comparatif-bouteilles">
                      Comparer les bouteilles
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <NavigationCTA />
      </div>
    </Layout>
  );
};

export default RobinetVsBouteilles;
