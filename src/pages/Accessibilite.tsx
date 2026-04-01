
import React from 'react';
import { Accessibility, Eye, Ear, Hand, Brain } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Accessibilite = () => {
  return (
    <Layout>
      <SEOHead {...seoData.accessibilite} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Accessibility className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>Accessibilité numérique</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              InfoEau.fr s'engage à rendre ses services accessibles à tous, conformément aux standards 
              d'accessibilité numérique RGAA 4.1 et WCAG 2.1.
            </p>
          </div>

          {/* Niveau de conformité */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Niveau AA
                </Badge>
                <span>Déclaration de conformité</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 leading-relaxed">
                InfoEau.fr vise un niveau de conformité AA des WCAG 2.1. Notre équipe travaille continuellement 
                pour améliorer l'accessibilité de la plateforme et corriger les éventuels problèmes signalés.
              </p>
              <p className="text-green-700 mt-2">
                <strong>Dernière évaluation :</strong> Janvier 2024
              </p>
            </CardContent>
          </Card>

          {/* Mesures d'accessibilité */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Mesures d'accessibilité mises en œuvre</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Accessibilité visuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Contrastes de couleurs optimisés</li>
                    <li>• Textes alternatifs sur les images</li>
                    <li>• Tailles de police adaptables</li>
                    <li>• Support des lecteurs d'écran</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Hand className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Navigation au clavier</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Navigation complète au clavier</li>
                    <li>• Indicateurs de focus visibles</li>
                    <li>• Raccourcis clavier logiques</li>
                    <li>• Ordre de tabulation cohérent</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Facilité cognitive</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Interface simple et intuitive</li>
                    <li>• Messages d'erreur clairs</li>
                    <li>• Aide contextuelle disponible</li>
                    <li>• Temps de session adaptés</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Ear className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Accessibilité auditive</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Pas de contenu audio automatique</li>
                    <li>• Alternatives textuelles</li>
                    <li>• Signaux visuels pour alertes</li>
                    <li>• Sous-titres si vidéos</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Technologie d'assistance */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Technologies d'assistance supportées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lecteurs d'écran testés</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• NVDA (Windows)</li>
                    <li>• JAWS (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Navigateurs compatibles</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Chrome (dernières versions)</li>
                    <li>• Firefox (dernières versions)</li>
                    <li>• Safari (dernières versions)</li>
                    <li>• Edge (dernières versions)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raccourcis clavier */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Raccourcis clavier principaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Aller au contenu principal</span>
                    <Badge variant="outline">Alt + C</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Aller au menu de navigation</span>
                    <Badge variant="outline">Alt + M</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Aller à la recherche</span>
                    <Badge variant="outline">Alt + S</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Navigation entre onglets</span>
                    <Badge variant="outline">Tab / Shift+Tab</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Activer un élément</span>
                    <Badge variant="outline">Entrée / Espace</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Fermer un dialogue</span>
                    <Badge variant="outline">Échap</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signaler un problème */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Signaler un problème d'accessibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Si vous rencontrez des difficultés pour accéder à certains contenus ou fonctionnalités, 
                nous vous encourageons à nous le signaler :
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 mb-2"><strong>Email :</strong> contact@infoeau.fr</p>
                <p className="text-blue-800 mb-2"><strong>Objet :</strong> "Accessibilité - Problème signalé"</p>
                <p className="text-blue-800 text-sm">
                  Merci de préciser : page concernée, navigateur utilisé, technologie d'assistance, 
                  et description détaillée du problème.
                </p>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                Nous nous engageons à vous répondre dans les 48h et à corriger les problèmes dans un délai raisonnable.
              </p>
            </CardContent>
          </Card>

          {/* Dérogations */}
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>Dérogations et contenus non accessibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cartes interactives</h4>
                  <p className="text-gray-600 text-sm">
                    Les cartes géographiques peuvent présenter des limitations d'accessibilité. 
                    Des alternatives sous forme de listes et tableaux sont proposées.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Graphiques complexes</h4>
                  <p className="text-gray-600 text-sm">
                    Tous les graphiques sont accompagnés de descriptions textuelles détaillées 
                    et de tableaux de données équivalents.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aide */}
          <Card className="mb-8 md:mb-12 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Besoin d'aide ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Notre équipe est à votre disposition pour vous accompagner dans l'utilisation d'InfoEau.fr. 
                N'hésitez pas à nous contacter pour toute assistance.
              </p>
              <div className="text-green-700 text-sm">
                <p><strong>Horaires de support :</strong> Lundi au vendredi, 9h-18h</p>
                <p><strong>Délai de réponse :</strong> Maximum 48h</p>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default Accessibilite;
