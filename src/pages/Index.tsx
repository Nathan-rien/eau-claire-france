
import React, { useState } from 'react';
import { Search, MapPin, Droplets, AlertTriangle, TrendingUp, Leaf, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchBar from '@/components/SearchBar';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="py-8 md:py-12 lg:py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
                Connaissez-vous vraiment la qualité de 
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> votre eau</span> ?
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-2">
                Découvrez la composition réelle de l'eau potable distribuée dans votre commune, 
                suivez les polluants présents et comparez avec les eaux en bouteille.
              </p>
              
              <div className="mb-6 md:mb-8 lg:mb-12">
                <SearchBar onCitySelect={setSelectedCity} />
                {selectedCity && (
                  <div className="mt-4 px-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 max-w-lg mx-auto">
                      <p className="text-blue-800 text-sm md:text-base">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Recherche pour : {selectedCity}
                      </p>
                      <div className="mt-2">
                        <a 
                          href="/diagnostic" 
                          className="text-blue-600 hover:text-blue-800 font-medium underline text-sm md:text-base"
                        >
                          Voir le diagnostic complet →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Access Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12 px-2">
                <a href="/carte" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-blue-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-blue-600">Carte</div>
                    <div className="text-xs md:text-sm text-gray-600">Nationale</div>
                  </div>
                </a>
                <a href="/diagnostic" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-green-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <Search className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-green-600">Diagnostic</div>
                    <div className="text-xs md:text-sm text-gray-600">Personnalisé</div>
                  </div>
                </a>
                <a href="/bouteilles" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-orange-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-orange-600">vs Bouteilles</div>
                    <div className="text-xs md:text-sm text-gray-600">Comparaison</div>
                  </div>
                </a>
                <a href="/polluants" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-purple-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-purple-600">Polluants</div>
                    <div className="text-xs md:text-sm text-gray-600">Index</div>
                  </div>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12 px-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-blue-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">35,000+</div>
                  <div className="text-xs md:text-sm text-gray-600">Communes analysées</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-green-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">50+</div>
                  <div className="text-xs md:text-sm text-gray-600">Polluants surveillés</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-orange-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-orange-600">98%</div>
                  <div className="text-xs md:text-sm text-gray-600">Eau conforme</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-purple-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">24h</div>
                  <div className="text-xs md:text-sm text-gray-600">Mise à jour</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 md:py-12 lg:py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-6 md:mb-8 lg:mb-12">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Transparence totale sur votre eau
              </h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Basé sur les données officielles des ARS, agences de l'eau et réseaux publics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4">
              <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-base md:text-lg lg:text-xl">Score de confiance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    Score global de A à E basé sur la microbiologie, physico-chimie et stabilité historique de votre eau.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Leaf className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-base md:text-lg lg:text-xl">Impact environnemental</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    Comparez l'empreinte carbone et le coût de l'eau du robinet vs les eaux en bouteille.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-base md:text-lg lg:text-xl">Plateforme citoyenne</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    Alertes en cas de pollution, données ouvertes et accessibles à tous les citoyens français.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Navigation CTA */}
        <section className="py-8 md:py-12 lg:py-16 px-4">
          <div className="container mx-auto">
            <NavigationCTA />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
