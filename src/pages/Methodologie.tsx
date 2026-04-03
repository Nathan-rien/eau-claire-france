import React from 'react';
import { BookOpen, Target, BarChart3, CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const Methodologie = () => {
  const { t } = useLanguage();

  const methodology = [
    {
      step: "1",
      title: "Collecte des données",
      description: "Récupération automatisée des données depuis les API officielles",
      details: [
        "Connexion sécurisée aux bases de données ARS",
        "Synchronisation quotidienne avec SISE-Eaux",
        "Validation de l'intégrité des données",
        "Gestion des formats de données hétérogènes"
      ]
    },
    {
      step: "2",
      title: "Traitement et normalisation",
      description: "Harmonisation et structuration des données pour l'analyse",
      details: [
        "Conversion des unités de mesure",
        "Normalisation des noms de polluants",
        "Géocodage des points de distribution",
        "Détection et correction des anomalies"
      ]
    },
    {
      step: "3",
      title: "Analyse et classification",
      description: "Évaluation de la qualité selon les normes en vigueur",
      details: [
        "Comparaison aux seuils réglementaires",
        "Calcul d'indices de qualité globaux",
        "Classification des niveaux de risque",
        "Identification des tendances temporelles"
      ]
    },
    {
      step: "4",
      title: "Visualisation et diffusion",
      description: "Présentation accessible et transparente des résultats",
      details: [
        "Cartographie interactive des données",
        "Tableaux de bord personnalisés",
        "Alertes automatiques en cas de dépassement",
        "Export des données en format ouvert"
      ]
    }
  ];

  const qualityIndicators = [
    {
      name: "Indice de conformité microbiologique",
      description: "Évalue la présence de bactéries pathogènes",
      calculation: "Pourcentage d'analyses conformes aux normes E.coli et entérocoques",
      threshold: "100% de conformité exigée"
    },
    {
      name: "Indice de conformité physico-chimique",
      description: "Mesure la conformité des paramètres chimiques",
      calculation: "Respect des limites pour nitrates, pesticides, métaux lourds",
      threshold: "95% de conformité minimum"
    },
    {
      name: "Niveau de risque sanitaire",
      description: "Classification globale du risque pour la santé",
      calculation: "Pondération des dépassements selon leur gravité",
      threshold: "Faible / Modéré / Élevé"
    }
  ];

  return (
    <Layout>
      <SEOHead {...seoData.methodologie} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('methodology.title')}</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('methodology.subtitle')}
            </p>
          </div>

          <Card className="mb-6 md:mb-12 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Target className="w-6 h-6" />
                <span>{t('methodology.principles')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Transparence totale</h4>
                  <p className="text-green-700 text-sm">Toutes nos méthodes sont documentées et nos sources sont publiques</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Rigueur scientifique</h4>
                  <p className="text-green-700 text-sm">Application stricte des normes et protocoles officiels</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Neutralité</h4>
                  <p className="text-green-700 text-sm">Présentation objective des données sans interprétation biaisée</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Accessibilité</h4>
                  <p className="text-green-700 text-sm">Information compréhensible pour tous les citoyens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('methodology.process')}</h2>
            <div className="space-y-6">
              {methodology.map((step, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('methodology.indicators')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {qualityIndicators.map((indicator, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>{indicator.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{indicator.description}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Calcul:</p>
                        <p className="text-sm text-gray-600">{indicator.calculation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Seuils:</p>
                        <Badge variant="outline" className="text-xs">{indicator.threshold}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-6 md:mb-12 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <BarChart3 className="w-6 h-6" />
                <span>{t('methodology.euData')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed mb-4">
                Le portail Europe d'InfoEau.fr s'appuie sur les données officielles de l'Agence Européenne
                de l'Environnement (EEA), issues du reporting de la Directive Eau Potable (WISE DWD).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Sources et couverture</h4>
                  <ul className="space-y-1 text-blue-700 text-sm">
                    <li>• 27 pays membres de l'Union européenne</li>
                    <li>• Datasets EEA WISE DWD</li>
                    <li>• Polluants couverts : nitrates, pesticides, plomb, bactéries, PFAS, microplastiques, trihalométhanes, arsenic, chlore résiduel</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Traitement et scoring</h4>
                  <ul className="space-y-1 text-blue-700 text-sm">
                    <li>• Score de conformité (A/B/C)</li>
                    <li>• Fréquence : tous les 3 ans</li>
                    <li>• Dernières données : cycle 2020-2022</li>
                    <li>• Fallback sur fichiers CSV enrichis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">{t('methodology.limitations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-orange-700">
                <p><strong>Fréquence des analyses :</strong> Les données reflètent les analyses officielles qui ne sont pas effectuées en continu.</p>
                <p><strong>Représentativité géographique :</strong> Les points de mesure peuvent ne pas couvrir l'intégralité d'un réseau de distribution.</p>
                <p><strong>Évolution réglementaire :</strong> Les normes et seuils peuvent évoluer. Notre plateforme s'adapte aux changements réglementaires.</p>
                <p><strong>Utilisation responsable :</strong> Ces données sont indicatives et ne remplacent pas un avis médical en cas de préoccupation sanitaire.</p>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default Methodologie;
