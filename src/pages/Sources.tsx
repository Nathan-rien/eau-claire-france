
import React from 'react';
import { Database, FileText, ExternalLink, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Sources = () => {
  const dataSources = [
    {
      name: "Agences Régionales de Santé (ARS)",
      description: "Données officielles de qualité de l'eau potable distribuée en France",
      url: "https://solidarites-sante.gouv.fr/",
      type: "Officiel",
      frequency: "Quotidienne",
      coverage: "100% du territoire français"
    },
    {
      name: "EauFrance - Portail national d'information sur l'eau",
      description: "Base de données nationale sur l'eau et les milieux aquatiques",
      url: "https://www.eaufrance.fr/",
      type: "Officiel",
      frequency: "Temps réel",
      coverage: "Métropole et DOM-TOM"
    },
    {
      name: "BRGM - Bureau de Recherches Géologiques et Minières",
      description: "Données géologiques et hydrogéologiques françaises",
      url: "https://www.brgm.fr/",
      type: "Scientifique",
      frequency: "Mensuelle",
      coverage: "Données géologiques nationales"
    },
    {
      name: "SISE-Eaux - Système d'Information en Santé Environnement",
      description: "Base de données sanitaires sur la qualité de l'eau de consommation",
      url: "https://sise-eaux.fr/",
      type: "Officiel",
      frequency: "Continue",
      coverage: "Tous les réseaux publics"
    },
    {
      name: "Open Data France",
      description: "Données ouvertes françaises sur l'environnement et la santé publique",
      url: "https://www.data.gouv.fr/",
      type: "Open Data",
      frequency: "Variable",
      coverage: "Données publiques françaises"
    },
    {
      name: "Agence Européenne de l'Environnement (EEA)",
      description: "Données officielles de qualité de l'eau potable dans les 27 pays de l'Union européenne",
      url: "https://www.eea.europa.eu/",
      type: "Officiel",
      frequency: "Triennale",
      coverage: "27 pays de l'UE"
    },
    {
      name: "WISE DWD - Drinking Water Directive",
      description: "Base de données européenne sur la conformité à la Directive Eau Potable (2020/2184)",
      url: "https://water.europa.eu/",
      type: "Officiel",
      frequency: "Triennale",
      coverage: "Union européenne"
    },
    {
      name: "Eurostat - Statistiques européennes de l'eau",
      description: "Statistiques comparatives sur l'eau potable et l'assainissement en Europe",
      url: "https://ec.europa.eu/eurostat/",
      type: "Statistique",
      frequency: "Annuelle",
      coverage: "UE 27 + pays associés"
    },
    {
      name: "OMS / WHO Europe",
      description: "Indicateurs de santé liés à l'eau potable : accès, maladies hydriques, normes sanitaires",
      url: "https://www.who.int/europe/",
      type: "Scientifique",
      frequency: "Annuelle",
      coverage: "Région européenne OMS"
    }
  ];

  const qualityStandards = [
    {
      organism: "Organisation Mondiale de la Santé (OMS)",
      role: "Standards internationaux de qualité de l'eau potable",
      reference: "Guidelines for drinking-water quality, 4th edition"
    },
    {
      organism: "Commission Européenne",
      role: "Directive européenne sur l'eau potable révisée",
      reference: "Directive (UE) 2020/2184 relative à la qualité des eaux destinées à la consommation humaine"
    },
    {
      organism: "Ministère de la Santé français",
      role: "Réglementation française sur l'eau potable",
      reference: "Code de la santé publique"
    },
    {
      organism: "Agence Européenne de l'Environnement (EEA)",
      role: "Reporting et conformité de la Directive Eau Potable pour les 27 États membres",
      reference: "WISE Drinking Water Directive dataset (DWD_NS, DWD_QI, DWD_NCI)"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          {/* Header */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Database className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>Sources de données</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              InfoEau.fr s'appuie exclusivement sur des sources officielles et scientifiques 
              pour garantir la fiabilité et la transparence des informations sur la qualité de l'eau potable.
            </p>
          </div>

          {/* Engagement de transparence */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Shield className="w-6 h-6" />
                <span>Notre engagement de transparence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed">
                Nous nous engageons à utiliser uniquement des données provenant d'organismes officiels 
                et reconnus. Toutes nos sources sont publiques, vérifiables et mises à jour régulièrement. 
                Aucune donnée n'est modifiée ou interprétée : nous présentons les informations telles 
                qu'elles sont fournies par les autorités compétentes.
              </p>
            </CardContent>
          </Card>

          {/* Sources principales */}
          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Sources principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <Badge variant={source.type === 'Officiel' ? 'default' : 'secondary'}>
                        {source.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{source.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fréquence de mise à jour:</span>
                        <span className="font-medium">{source.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Couverture:</span>
                        <span className="font-medium">{source.coverage}</span>
                      </div>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 mt-4"
                    >
                      <span>Consulter la source</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Standards de qualité */}
          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Standards de qualité</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {qualityStandards.map((standard, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{standard.organism}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{standard.role}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Référence:</p>
                      <p className="text-sm text-gray-600">{standard.reference}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mise à jour des données */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-green-600" />
                <span>Fréquence de mise à jour</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Données en temps réel</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Alertes sanitaires</li>
                    <li>• Restrictions d'usage</li>
                    <li>• Incidents de qualité</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Données périodiques</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Analyses de routine (hebdomadaire)</li>
                    <li>• Contrôles réglementaires (mensuel)</li>
                    <li>• Rapports de synthèse (annuel)</li>
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

export default Sources;
