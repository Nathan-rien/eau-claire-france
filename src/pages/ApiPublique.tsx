
import React from 'react';
import { Code, Database, Key, Globe } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ApiPublique = () => {
  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/water-quality/{commune}",
      description: "Obtenir les données de qualité de l'eau pour une commune",
      parameters: [
        { name: "commune", type: "string", required: true, description: "Code INSEE ou nom de la commune" }
      ],
      example: "https://api.infoeau.fr/v1/water-quality/75001"
    },
    {
      method: "GET",
      path: "/api/v1/pollutants/{region}",
      description: "Lister les polluants détectés dans une région",
      parameters: [
        { name: "region", type: "string", required: true, description: "Code région" },
        { name: "limit", type: "number", required: false, description: "Nombre de résultats (défaut: 100)" }
      ],
      example: "https://api.infoeau.fr/v1/pollutants/11?limit=50"
    },
    {
      method: "GET",
      path: "/api/v1/alerts",
      description: "Récupérer les alertes sanitaires en cours",
      parameters: [
        { name: "type", type: "string", required: false, description: "Type d'alerte (sanitaire, restriction)" },
        { name: "since", type: "date", required: false, description: "Date de début (ISO 8601)" }
      ],
      example: "https://api.infoeau.fr/v1/alerts?type=sanitaire"
    },
    {
      method: "GET",
      path: "/api/v1/networks",
      description: "Informations sur les réseaux de distribution",
      parameters: [
        { name: "department", type: "string", required: false, description: "Code département" },
        { name: "operator", type: "string", required: false, description: "Nom de l'opérateur" }
      ],
      example: "https://api.infoeau.fr/v1/networks?department=75"
    },
    {
      method: "GET",
      path: "/api/v1/eu/water-quality/{country}",
      description: "Données de qualité de l'eau pour un pays européen (conformité, population, violations)",
      parameters: [
        { name: "country", type: "string", required: true, description: "Code pays ISO 2 lettres (FR, DE, ES...)" }
      ],
      example: "https://api.infoeau.fr/v1/eu/water-quality/DE"
    },
    {
      method: "GET",
      path: "/api/v1/eu/pollutants",
      description: "Liste des polluants européens avec moyennes et dépassements par pays",
      parameters: [
        { name: "category", type: "string", required: false, description: "Catégorie (Chimique, Métaux lourds, Microbiologique, Chimique émergent, Sous-produits)" }
      ],
      example: "https://api.infoeau.fr/v1/eu/pollutants?category=Chimique%20émergent"
    },
    {
      method: "GET",
      path: "/api/v1/eu/pollutants/{country}",
      description: "Polluants détaillés pour un pays européen spécifique",
      parameters: [
        { name: "country", type: "string", required: true, description: "Code pays ISO 2 lettres" }
      ],
      example: "https://api.infoeau.fr/v1/eu/pollutants/FR"
    }
  ];

  const responseExample = {
    status: "success",
    data: {
      commune: {
        code: "75001",
        name: "Paris 1er Arrondissement",
        population: 16888
      },
      network: {
        name: "Réseau Paris Centre",
        operator: "Eau de Paris",
        source_type: "Eau de surface traitée"
      },
      last_analysis: "2024-12-15",
      quality_indicators: {
        microbiological_compliance: 100,
        chemical_compliance: 98.5,
        risk_level: "low"
      },
      detected_pollutants: [
        {
          name: "Nitrates",
          value: 12.5,
          unit: "mg/L",
          limit: 50,
          status: "compliant"
        }
      ]
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Code className="w-10 h-10 text-blue-600" />
              <span>API Publique</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Accédez programmatiquement aux données de qualité de l'eau potable française 
              et européenne via notre API REST gratuite et ouverte.
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Globe className="w-6 h-6" />
                <span>API gratuite et ouverte</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed mb-4">
                Notre API permet aux développeurs, chercheurs, journalistes et citoyens d'accéder 
                facilement aux données officielles de qualité de l'eau potable. Toutes les données 
                sont issues des sources gouvernementales et mises à jour quotidiennement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600">Gratuit</Badge>
                  <span className="text-sm text-blue-700">Aucun coût d'utilisation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600">Open Data</Badge>
                  <span className="text-sm text-blue-700">Données ouvertes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600">RESTful</Badge>
                  <span className="text-sm text-blue-700">API REST standard</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentification */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-6 h-6 text-green-600" />
                <span>Authentification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                L'API est actuellement en accès libre sans authentification pour faciliter l'adoption. 
                Une clé API pourra être requise dans le futur pour des usages intensifs.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">URL de base:</p>
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  https://api.infoeau.fr
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Points d'accès disponibles</h2>
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-gray-600">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Paramètres:</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center space-x-3 text-sm">
                              <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">Requis</Badge>
                              )}
                              <span className="text-gray-600">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Exemple:</h4>
                        <code className="text-sm bg-blue-50 text-blue-800 px-3 py-2 rounded block">
                          {endpoint.example}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Exemple de réponse */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-purple-600" />
                <span>Exemple de réponse</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Toutes les réponses sont au format JSON avec une structure cohérente:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{JSON.stringify(responseExample, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Limites et conditions */}
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Limites et conditions d'usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-orange-700">
                <div>
                  <h4 className="font-semibold mb-2">Limites techniques:</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>1000 requêtes par heure par adresse IP</li>
                    <li>Réponses limitées à 1000 enregistrements par requête</li>
                    <li>Timeout de 30 secondes maximum</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Conditions d'utilisation:</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>Usage respectueux des ressources serveur</li>
                    <li>Attribution de la source (InfoEau.fr) recommandée</li>
                    <li>Pas d'usage commercial sans autorisation</li>
                    <li>Respect de la vie privée et du RGPD</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default ApiPublique;
