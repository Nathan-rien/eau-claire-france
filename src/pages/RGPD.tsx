
import React from 'react';
import { Shield, Eye, FileText, Users, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RGPD = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>Protection des données (RGPD)</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              InfoEau.fr s'engage à protéger vos données personnelles conformément au Règlement Général 
              sur la Protection des Données (RGPD).
            </p>
          </div>

          {/* Responsable du traitement */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Users className="w-6 h-6" />
                <span>Responsable du traitement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-blue-700 space-y-2">
                <p><strong>Nom :</strong> Nathan Orso</p>
                <p><strong>Contact :</strong> contact@infoeau.fr</p>
                <p><strong>Adresse :</strong> Bordeaux, France</p>
              </div>
            </CardContent>
          </Card>

          {/* Données collectées */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Données collectées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-6 h-6 text-green-600" />
                    <span>Données de navigation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Pages visitées</li>
                    <li>• Temps de visite</li>
                    <li>• Type d'appareil utilisé</li>
                    <li>• Géolocalisation approximative (ville)</li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-500">
                    <strong>Finalité :</strong> Amélioration de l'expérience utilisateur et statistiques d'usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <span>Données de recherche</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Communes recherchées</li>
                    <li>• Requêtes de diagnostic</li>
                    <li>• Préférences de filtrage</li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-500">
                    <strong>Finalité :</strong> Personnalisation des résultats et amélioration du service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vos droits */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Vos droits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Droit d'accès</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez demander à connaître les données que nous détenons sur vous.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Droit de rectification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez demander la correction de données inexactes vous concernant.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Droit d'effacement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez demander la suppression de vos données personnelles.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Droit à la portabilité</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez récupérer vos données dans un format structuré.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Droit d'opposition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez vous opposer au traitement de vos données.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Droit de limitation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez demander la limitation du traitement de vos données.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sécurité des données */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-6 h-6 text-purple-600" />
                <span>Sécurité des données</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mesures techniques</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Chiffrement des données en transit (HTTPS)</li>
                    <li>• Stockage sécurisé des données</li>
                    <li>• Accès limité et contrôlé</li>
                    <li>• Sauvegardes régulières</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mesures organisationnelles</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Formation à la protection des données</li>
                    <li>• Procédures de gestion des incidents</li>
                    <li>• Audits de sécurité réguliers</li>
                    <li>• Politique de confidentialité stricte</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Données européennes */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Données européennes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Les données européennes affichées sur InfoEau.fr (qualité de l'eau, polluants par pays) 
                sont des données publiques agrégées et anonymisées provenant de l'Agence Européenne de 
                l'Environnement (EEA) et du reporting WISE DWD. Elles ne constituent pas des données 
                personnelles au sens du RGPD et sont librement réutilisables selon la politique de 
                réutilisation standard de l'EEA.
              </p>
            </CardContent>
          </Card>

          {/* Conservation des données */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Durée de conservation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Données de navigation</h4>
                  <p className="text-gray-600 text-sm">Conservées pendant 25 mois maximum (recommandation CNIL)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Données de recherche</h4>
                  <p className="text-gray-600 text-sm">Anonymisées après 12 mois, conservées à des fins statistiques</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact DPO */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Exercer vos droits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Pour exercer vos droits ou pour toute question relative à la protection de vos données personnelles, 
                vous pouvez nous contacter :
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800"><strong>Email :</strong> contact@infoeau.fr</p>
                <p className="text-blue-800"><strong>Objet :</strong> "RGPD - Exercice de droits"</p>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                En cas de non-réponse ou de réponse insatisfaisante, vous pouvez saisir la CNIL : 
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  www.cnil.fr
                </a>
              </p>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default RGPD;
