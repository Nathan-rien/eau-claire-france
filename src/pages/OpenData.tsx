
import React from 'react';
import { Database, Download, Code, FileText, Globe, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBottleData } from "@/hooks/useBottleData";

const OpenData = () => {
  const { composition, catalog, mdd, loading, error } = useBottleData();
  
  const datasets = [
    {
      name: "Qualité de l'eau par commune",
      description: "Données de qualité de l'eau potable pour toutes les communes françaises",
      format: "JSON, CSV, XML",
      size: "45 MB",
      lastUpdate: "2024-01-15",
      license: "Open Database License (ODbL)"
    },
    {
      name: "Index des polluants",
      description: "Catalogue complet des polluants surveillés avec leurs seuils réglementaires",
      format: "JSON, CSV",
      size: "2.3 MB",
      lastUpdate: "2024-01-10",
      license: "Creative Commons CC-BY-SA 4.0"
    },
    {
      name: "Réseaux de distribution",
      description: "Informations sur les réseaux de distribution d'eau par région",
      format: "GeoJSON, CSV",
      size: "12 MB",
      lastUpdate: "2024-01-08",
      license: "Open Database License (ODbL)"
    },
    {
      name: "Historique des alertes",
      description: "Historique des alertes sanitaires et restrictions d'usage",
      format: "JSON, CSV",
      size: "8.7 MB",
      lastUpdate: "2024-01-12",
      license: "Creative Commons CC-BY-SA 4.0"
    },
    {
      name: "Qualité de l'eau par pays (UE 27)",
      description: "Taux de conformité, population desservie et violations par pays européen (source EEA WISE DWD)",
      format: "JSON, CSV",
      size: "1.2 MB",
      lastUpdate: "2025-01-15",
      license: "EEA Standard re-use policy"
    },
    {
      name: "Polluants européens par pays",
      description: "Concentrations moyennes et dépassements pour nitrates, pesticides, PFAS, microplastiques, THM dans les 27 pays UE",
      format: "JSON, CSV",
      size: "0.8 MB",
      lastUpdate: "2025-01-15",
      license: "EEA Standard re-use policy"
    }
  ];

  const apiEndpoints = [
    {
      endpoint: "/api/v1/communes/{insee}/water-quality",
      method: "GET",
      description: "Récupère les données de qualité de l'eau pour une commune",
      example: "curl https://api.infoeau.fr/v1/communes/33063/water-quality"
    },
    {
      endpoint: "/api/v1/pollutants",
      method: "GET", 
      description: "Liste tous les polluants surveillés avec leurs informations",
      example: "curl https://api.infoeau.fr/v1/pollutants"
    },
    {
      endpoint: "/api/v1/alerts",
      method: "GET",
      description: "Récupère les alertes en cours par département ou région",
      example: "curl https://api.infoeau.fr/v1/alerts?department=33"
    },
    {
      endpoint: "/api/v1/eu/water-quality/{country}",
      method: "GET",
      description: "Qualité de l'eau potable pour un pays européen (conformité, violations)",
      example: "curl https://api.infoeau.fr/v1/eu/water-quality/DE"
    },
    {
      endpoint: "/api/v1/eu/pollutants/{country}",
      method: "GET",
      description: "Polluants détectés dans un pays européen (PFAS, microplastiques, THM...)",
      example: "curl https://api.infoeau.fr/v1/eu/pollutants/FR"
    }
  ];

  return (
    <Layout>
      <SEOHead {...seoData.openData} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Database className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>Open Data</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Accédez librement aux données sur la qualité de l'eau potable en France et en Europe. 
              Toutes nos données sont ouvertes et réutilisables conformément aux principes de l'Open Data.
            </p>
          </div>

          {/* Test des données CSV GitHub */}
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">État des données CSV GitHub</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-purple-700">Chargement des données...</div>}
              {error && <div className="text-red-600">Erreur: {error}</div>}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-700">
                  <div className="bg-white p-3 rounded">
                    <div className="font-semibold">Composition</div>
                    <div className="text-2xl font-bold">{composition?.length ?? 0}</div>
                    <div className="text-sm">entrées chargées</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="font-semibold">Catalogue</div>
                    <div className="text-2xl font-bold">{catalog?.length ?? 0}</div>
                    <div className="text-sm">entrées chargées</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="font-semibold">MDD</div>
                    <div className="text-2xl font-bold">{mdd?.length ?? 0}</div>
                    <div className="text-sm">entrées chargées</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Principes Open Data */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Globe className="w-6 h-6" />
                <span>Nos principes Open Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-700">
                <div>
                  <h4 className="font-semibold mb-2">✅ Librement accessibles</h4>
                  <p className="text-sm">Toutes les données sont téléchargeables gratuitement sans inscription</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✅ Formats ouverts</h4>
                  <p className="text-sm">JSON, CSV, XML et GeoJSON pour une interopérabilité maximale</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✅ Licences ouvertes</h4>
                  <p className="text-sm">Creative Commons et ODbL permettant la réutilisation commerciale</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✅ Mises à jour régulières</h4>
                  <p className="text-sm">Données actualisées quotidiennement depuis les sources officielles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jeux de données */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Jeux de données disponibles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {datasets.map((dataset, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <Badge variant="secondary">{dataset.format}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm">{dataset.description}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Taille :</span>
                        <span className="font-medium">{dataset.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dernière MAJ :</span>
                        <span className="font-medium">{dataset.lastUpdate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Licence :</span>
                        <span className="font-medium text-xs">{dataset.license}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>Télécharger JSON</span>
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>CSV</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* API publique */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">API publique</h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-6 h-6 text-purple-600" />
                  <span>Accès programmatique</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Notre API REST permet d'intégrer facilement les données de qualité de l'eau dans vos applications. 
                  Aucune clé d'API requise pour un usage raisonnable.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2"><strong>URL de base :</strong></p>
                  <code className="text-blue-600 font-mono">https://api.infoeau.fr/v1/</code>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {apiEndpoints.map((api, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Badge variant={api.method === 'GET' ? 'default' : 'secondary'}>
                        {api.method}
                      </Badge>
                      <code className="text-sm font-mono">{api.endpoint}</code>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3 text-sm">{api.description}</p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                      {api.example}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Communauté */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-orange-600" />
                <span>Communauté et réutilisations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Projets utilisant nos données</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Applications mobiles de qualité de l'eau</li>
                    <li>• Études académiques en santé publique</li>
                    <li>• Outils de visualisation cartographique</li>
                    <li>• Systèmes d'alerte automatisés</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contribuer</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Signaler des erreurs dans les données</li>
                    <li>• Proposer de nouvelles sources</li>
                    <li>• Améliorer la documentation API</li>
                    <li>• Partager vos réutilisations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Documentation et ressources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Guide des données</div>
                    <div className="text-sm text-gray-500">Documentation complète</div>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
                  <Code className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Référence API</div>
                    <div className="text-sm text-gray-500">Endpoints et exemples</div>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">SDKs</div>
                    <div className="text-sm text-gray-500">Python, JavaScript, R</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-8 md:mb-12 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Besoin d'aide ou de données spécifiques ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Notre équipe peut vous accompagner dans l'utilisation des données ou développer des exports 
                personnalisés pour vos projets de recherche ou d'intérêt général.
              </p>
              <div className="text-blue-700 text-sm">
                <p><strong>Contact :</strong> contact@infoeau.fr</p>
                <p><strong>Objet :</strong> "Open Data - Demande d'assistance"</p>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default OpenData;
