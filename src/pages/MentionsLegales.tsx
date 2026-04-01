
import React from 'react';
import { Scale, User, Server, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MentionsLegales = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          {/* Header */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Scale className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>Mentions légales</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Informations légales concernant le site InfoEau.fr et ses conditions d'utilisation.
            </p>
          </div>

          <div className="space-y-8">
            {/* Éditeur du site */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-blue-600" />
                  <span>Éditeur du site</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Responsable de la publication</h4>
                  <p className="text-gray-700">Nathan Orso</p>
                  <p className="text-gray-600">Développeur et créateur d'InfoEau.fr</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                  <p className="text-gray-700">Email : contact@infoeau.fr</p>
                  <p className="text-gray-600">LinkedIn : <a href="https://www.linkedin.com/in/nathan-orso-bdx/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Nathan Orso</a></p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Statut du site</h4>
                  <p className="text-gray-700">Site personnel à vocation d'information publique</p>
                  <p className="text-gray-600">Projet citoyen indépendant et bénévole</p>
                </div>
              </CardContent>
            </Card>

            {/* Hébergement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-6 h-6 text-green-600" />
                  <span>Hébergement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Plateforme d'hébergement</h4>
                  <p className="text-gray-700">Lovable.dev</p>
                  <p className="text-gray-600">Plateforme de développement et d'hébergement d'applications web</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Infrastructure technique</h4>
                  <p className="text-gray-700">Le site utilise des services cloud conformes aux standards européens de protection des données.</p>
                </div>
              </CardContent>
            </Card>

            {/* Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <span>Propriété intellectuelle</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Code source et design</h4>
                  <p className="text-gray-700">
                    Le code source, le design et l'interface du site InfoEau.fr sont la propriété de Nathan Orso. 
                    Toute reproduction, représentation, modification ou adaptation de tout ou partie de ces éléments 
                    est strictement interdite sans autorisation expresse.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Données publiques</h4>
                  <p className="text-gray-700">
                    Les données présentées sur le site proviennent d'organismes publics français (ARS, EauFrance, BRGM) 
                    et européens (Agence Européenne de l'Environnement – EEA, WISE DWD) et sont régies 
                    par les principes de l'Open Data. Les données européennes sont soumises à la politique 
                    de réutilisation standard de l'EEA. Ces données restent la propriété de leurs organismes émetteurs respectifs.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Marques et logos</h4>
                  <p className="text-gray-700">
                    La marque "InfoEau.fr" et son logo sont des créations originales. Les logos et marques des organismes 
                    officiels mentionnés demeurent la propriété de leurs détenteurs respectifs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Responsabilité et garanties */}
            <Card>
              <CardHeader>
                <CardTitle>Responsabilité et garanties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Exactitude des informations</h4>
                  <p className="text-gray-700">
                    InfoEau.fr s'efforce de fournir des informations exactes et à jour. Cependant, nous ne pouvons 
                    garantir l'exactitude, la complétude ou l'actualité des informations diffusées sur le site. 
                    Les données sont issues de sources officielles mais peuvent comporter des erreurs ou des retards.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Limitation de responsabilité</h4>
                  <p className="text-gray-700">
                    L'utilisation des informations fournies se fait sous la seule responsabilité de l'utilisateur. 
                    InfoEau.fr ne saurait être tenu responsable de tout dommage direct ou indirect résultant de 
                    l'utilisation des informations du site. En cas de doute sur la qualité de votre eau, consultez 
                    les services officiels compétents.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Disponibilité du service</h4>
                  <p className="text-gray-700">
                    Nous nous efforçons d'assurer une disponibilité continue du site, mais ne pouvons garantir 
                    un accès ininterrompu. Le site peut être temporairement inaccessible pour des raisons de 
                    maintenance, de mise à jour ou de défaillance technique.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Conditions d'utilisation */}
            <Card>
              <CardHeader>
                <CardTitle>Conditions d'utilisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accès au site</h4>
                  <p className="text-gray-700">
                    L'accès au site InfoEau.fr est libre et gratuit. Aucune inscription n'est requise pour 
                    consulter les informations publiques. L'utilisateur s'engage à utiliser le site de manière 
                    responsable et conforme aux lois en vigueur.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage autorisé</h4>
                  <p className="text-gray-700">
                    Le site est destiné à un usage personnel et informatif. L'utilisation commerciale des données 
                    ou du contenu du site nécessite une autorisation préalable. Les utilisateurs peuvent partager 
                    et citer les informations du site en mentionnant la source.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Modification des conditions</h4>
                  <p className="text-gray-700">
                    Ces mentions légales peuvent être modifiées à tout moment sans préavis. Il appartient aux 
                    utilisateurs de consulter régulièrement cette page pour prendre connaissance des éventuelles 
                    modifications.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Droit applicable */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Droit applicable et juridiction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">
                  Les présentes mentions légales sont régies par le droit français. En cas de litige, 
                  et après recherche d'une solution amiable, les tribunaux français seront seuls compétents. 
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse : 
                  contact@infoeau.fr
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 md:mt-12">
            <NavigationCTA />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentionsLegales;
