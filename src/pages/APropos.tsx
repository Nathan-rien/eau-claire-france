
import React from 'react';
import { Heart, Users, Target, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const APropos = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Transparence",
      description: "Nous croyons que chaque citoyen a le droit de connaître la qualité de son eau potable sans opacité ni interprétation biaisée."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Accessibilité",
      description: "Les données doivent être compréhensibles par tous, qu'ils soient experts ou simples citoyens soucieux de leur santé."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Fiabilité",
      description: "Nous utilisons exclusivement des sources officielles et appliquons des méthodes scientifiques rigoureuses."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Engagement citoyen",
      description: "Notre mission est de contribuer à une société plus informée et plus responsable vis-à-vis de l'environnement."
    }
  ];

  const timeline = [
    {
      year: "2024",
      title: "Lancement d'InfoEau.fr",
      description: "Création de la plateforme avec les données de qualité de l'eau de toute la France"
    },
    {
      year: "2024",
      title: "Intégration des alertes",
      description: "Ajout du système d'alertes sanitaires en temps réel"
    },
    {
      year: "2024",
      title: "API publique",
      description: "Ouverture de l'API pour démocratiser l'accès aux données"
    },
    {
      year: "2025",
      title: "Lancement du portail Europe",
      description: "Extension aux 27 pays de l'UE avec données EEA : polluants (PFAS, microplastiques, THM), classement, carte et alertes européennes"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          {/* Header */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
              <span>À propos d'InfoEau.fr</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Une initiative citoyenne pour démocratiser l'accès à l'information 
              sur la qualité de l'eau potable en France.
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-6 md:mb-12 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-blue-800">Notre mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-blue-700 text-center leading-relaxed">
              InfoEau.fr a été créé avec une conviction simple : <strong>chaque citoyen français 
                et européen a le droit de connaître la qualité de son eau potable de manière claire, 
                accessible et transparente</strong>. Nous transformons les données officielles 
                complexes en informations compréhensibles pour tous, en France et dans les 27 pays de l'UE.
              </p>
            </CardContent>
          </Card>

          {/* Histoire */}
          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Notre histoire</h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  InfoEau.fr est né d'un constat simple : malgré l'existence de données publiques 
                  sur la qualité de l'eau, ces informations restaient difficiles d'accès et 
                  complexes à interpréter pour le grand public. Les citoyens devaient naviguer 
                  entre plusieurs sites institutionnels, décrypter des rapports techniques et 
                  comprendre des codes de paramètres obscurs.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Créé par <strong>Nathan Orso</strong>, développeur et citoyen engagé, ce projet 
                  vise à combler ce fossé numérique et démocratique. L'objectif est de rendre 
                  l'information sur l'eau aussi accessible que la météo, en utilisant les mêmes 
                  codes visuels intuitifs et les mêmes standards d'expérience utilisateur.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Aujourd'hui, InfoEau.fr centralise et visualise les données de plus de 36 000 
                  communes françaises, offrant une vue d'ensemble inédite sur la qualité de l'eau 
                  potable en France. Notre plateforme continue d'évoluer grâce aux retours des 
                  utilisateurs et à l'engagement de la communauté.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Valeurs */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nos valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {value.icon}
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Chronologie</h2>
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {event.year}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{event.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Impact */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-green-800">Notre impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-700 mb-2">36 000+</div>
                  <p className="text-green-600">Communes couvertes</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700 mb-2">27</div>
                  <p className="text-green-600">Pays UE couverts</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700 mb-2">100%</div>
                  <p className="text-green-600">Données officielles</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700 mb-2">Gratuit</div>
                  <p className="text-green-600">Accès libre pour tous</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact/Contribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Rejoignez notre mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-center leading-relaxed mb-6">
                InfoEau.fr est un projet citoyen ouvert. Nous accueillons les contributions, 
                les suggestions d'amélioration et les partenariats avec les acteurs engagés 
                pour la transparence environnementale.
              </p>
              <div className="text-center">
                <a
                  href="/contact"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Nous contacter</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default APropos;
