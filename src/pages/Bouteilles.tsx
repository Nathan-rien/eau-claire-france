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
import { rankCompositions, CompositionRanking } from '@/utils/bottleRanking';
import PriceOverlayDebug from '@/components/PriceOverlayDebug';
import { usePrices } from '@/hooks/usePrices';

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
    
    const rankedBottles = rankCompositions(composition);
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
      criteria: 'Impact CO2',
      tapWater: '0,3 kg CO2/1000L',
      bottledWater: bottledWaterData ? `${bottledWaterData.co2.value} kg CO2/1000L` : '250-500 kg CO2/1000L',
      winner: 'robinet'
    },
    {
      criteria: 'Qualité',
      tapWater: 'Contrôlée quotidiennement',
      bottledWater: 'Contrôlée à la source',
      winner: 'égalité'
    },
    {
      criteria: 'Praticité',
      tapWater: 'Disponible 24h/24',
      bottledWater: 'Transport nécessaire',
      winner: 'robinet'
    },
    {
      criteria: 'Déchets',
      tapWater: 'Aucun déchet plastique',
      bottledWater: 'Emballages plastique',
      winner: 'robinet'
    }
  ];

  const getWinnerIcon = (winner: string) => {
    switch (winner) {
      case 'robinet':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'bouteille':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-amber-600" />;
    }
  };

  const getWinnerBadge = (winner: string) => {
    switch (winner) {
      case 'robinet':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Robinet</Badge>;
      case 'bouteille':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bouteille</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Égalité</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Droplets className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p>Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600">Erreur: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={seoData.bouteilles.title}
        description={seoData.bouteilles.description}
        keywords={seoData.bouteilles.keywords}
        canonical="/bouteilles"
        ogImage="/images/og-bouteilles.jpg"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Eau du Robinet vs Eau en Bouteille : Comparaison Complète",
          "description": seoData.bouteilles.description,
          "author": {
            "@type": "Organization",
            "name": "InfoEau"
          },
          "datePublished": "2024-01-01",
          "dateModified": new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://info-eau.fr/bouteilles"
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: 'Robinet vs Bouteilles', href: '/bouteilles', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto">
            {/* En-tête de la page */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
                <Droplets className="w-10 h-10 text-blue-600" />
                <span>Eau du Robinet</span>
                <span className="text-2xl font-normal text-gray-500">vs</span>
                <span>Eau en Bouteille</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Comparaison complète entre l'eau du robinet et l'eau en bouteille : 
                prix, impact environnemental, qualité et praticité
              </p>
            </div>

            {/* Résumé rapide */}
            <div className="mb-12">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    Verdict : L'eau du robinet gagne sur presque tous les critères
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 text-lg">
                    <strong>Prix :</strong> 300 à 1000 fois moins chère • 
                    <strong> Environnement :</strong> 1000 fois moins polluante • 
                    <strong> Praticité :</strong> Disponible en permanence
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tableau de comparaison */}
            <div className="mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    Comparaison détaillée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4 px-2 font-semibold">Critère</th>
                          <th className="text-left py-4 px-2 font-semibold text-blue-700">Eau du robinet</th>
                          <th className="text-left py-4 px-2 font-semibold text-amber-700">Eau en bouteille</th>
                          <th className="text-center py-4 px-2 font-semibold">Gagnant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-2 font-medium">{row.criteria}</td>
                            <td className="py-4 px-2 text-blue-700">{row.tapWater}</td>
                            <td className="py-4 px-2 text-amber-700">{row.bottledWater}</td>
                            <td className="py-4 px-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {getWinnerIcon(row.winner)}
                                {getWinnerBadge(row.winner)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Onglets détaillés */}
            <div className="mb-12">
              <Tabs defaultValue="prix" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="prix">Prix</TabsTrigger>
                  <TabsTrigger value="environnement">Environnement</TabsTrigger>
                  <TabsTrigger value="qualite">Qualité</TabsTrigger>
                  <TabsTrigger value="praticite">Praticité</TabsTrigger>
                </TabsList>

                <TabsContent value="prix" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparaison des prix</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">💧 Eau du robinet</h4>
                          <p className="text-2xl font-bold text-blue-700">0,003 - 0,005 €/L</p>
                          <p className="text-sm text-blue-600 mt-2">
                            Soit environ <strong>2-3 € par an</strong> pour une consommation de 1,5L/jour
                          </p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2">🍼 Eau en bouteille</h4>
                          <p className="text-2xl font-bold text-amber-700">
                            {bottledWaterData ? `${bottledWaterData.price.avg.toFixed(2)} €/L` : '0,30 - 3,00 €/L'}
                          </p>
                          <p className="text-sm text-amber-600 mt-2">
                            Soit environ <strong>200-1000 € par an</strong> pour la même consommation
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">💰 Économies potentielles</h4>
                        <p className="text-green-700">
                          En choisissant l'eau du robinet, une famille peut économiser 
                          <strong> 800 à 4000 € par an</strong> selon sa consommation d'eau en bouteille.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="environnement" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Impact environnemental</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">💧 Eau du robinet</h4>
                          <p className="text-2xl font-bold text-blue-700">0,3 kg CO₂/1000L</p>
                          <ul className="text-sm text-blue-600 mt-2 space-y-1">
                            <li>• Aucun emballage plastique</li>
                            <li>• Transport minimal (réseau local)</li>
                            <li>• Traitement local optimisé</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2">🍼 Eau en bouteille</h4>
                          <p className="text-2xl font-bold text-amber-700">
                            {bottledWaterData ? `${bottledWaterData.co2.value} kg CO₂/1000L` : '250-500 kg CO₂/1000L'}
                          </p>
                          <ul className="text-sm text-amber-600 mt-2 space-y-1">
                            <li>• Production de bouteilles plastique</li>
                            <li>• Transport longue distance</li>
                            <li>• Gestion des déchets</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">⚠️ Impact des plastiques</h4>
                        <p className="text-red-700">
                          Une bouteille plastique met <strong>450 ans</strong> à se décomposer dans la nature. 
                          En France, seulement <strong>55%</strong> des bouteilles plastique sont recyclées.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="qualite" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contrôles qualité</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">💧 Eau du robinet</h4>
                          <ul className="text-sm text-blue-600 space-y-2">
                            <li>• <strong>Contrôles quotidiens</strong> obligatoires</li>
                            <li>• 54 paramètres analysés régulièrement</li>
                            <li>• Normes européennes strictes</li>
                            <li>• Traitement adapté à la qualité locale</li>
                            <li>• Résultats publics et accessibles</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2">🍼 Eau en bouteille</h4>
                          <ul className="text-sm text-amber-600 space-y-2">
                            <li>• Contrôles à la source</li>
                            <li>• Composition minérale stable</li>
                            <li>• Protection naturelle</li>
                            <li>• Pas de chlore</li>
                            <li>• Date limite de consommation</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">✅ Conclusion qualité</h4>
                        <p className="text-green-700">
                          Les deux options offrent une eau de qualité. L'eau du robinet bénéficie de contrôles 
                          plus fréquents, tandis que l'eau en bouteille a une composition plus stable.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="praticite" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aspect pratique</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">💧 Eau du robinet</h4>
                          <ul className="text-sm text-blue-600 space-y-2">
                            <li>• <strong>Disponible 24h/24</strong></li>
                            <li>• Aucun transport nécessaire</li>
                            <li>• Aucun stockage requis</li>
                            <li>• Température réglable</li>
                            <li>• Débit illimité</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2">🍼 Eau en bouteille</h4>
                          <ul className="text-sm text-amber-600 space-y-2">
                            <li>• Achat et transport requis</li>
                            <li>• Stockage nécessaire</li>
                            <li>• Gestion des emballages</li>
                            <li>• Portable pour les déplacements</li>
                            <li>• Différents formats disponibles</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Call to action */}
            <div className="text-center">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">
                    Découvrez la qualité de l'eau dans votre commune
                  </h3>
                  <p className="text-blue-700 mb-6">
                    Consultez les analyses officielles et comparez avec les eaux en bouteille
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Link to="/carte" className="flex items-center gap-2">
                        Carte de la qualité
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/diagnostic" className="flex items-center gap-2">
                        Diagnostic personnalisé
                        <Calculator className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
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