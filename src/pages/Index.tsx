
import React, { useState } from 'react';
import { Search, MapPin, Droplets, AlertTriangle, TrendingUp, Leaf, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchBar from '@/components/SearchBar';
import QualityMap from '@/components/QualityMap';
import WaterQualityCard from '@/components/WaterQualityCard';
import BottleComparison from '@/components/BottleComparison';
import PollutantIndex from '@/components/PollutantIndex';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                InfoEau.fr
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#carte" className="text-gray-600 hover:text-blue-600 transition-colors">Carte</a>
              <a href="#diagnostic" className="text-gray-600 hover:text-blue-600 transition-colors">Diagnostic</a>
              <a href="#bouteilles" className="text-gray-600 hover:text-blue-600 transition-colors">vs Bouteilles</a>
              <a href="#polluants" className="text-gray-600 hover:text-blue-600 transition-colors">Polluants</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connaissez la qualité de 
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> votre eau</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Découvrez la composition réelle de l'eau potable distribuée dans votre commune, 
              suivez les polluants présents et comparez avec les eaux en bouteille.
            </p>
            
            <div className="mb-12">
              <SearchBar onCitySelect={setSelectedCity} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">35,000+</div>
                <div className="text-sm text-gray-600">Communes analysées</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Polluants surveillés</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">98%</div>
                <div className="text-sm text-gray-600">Eau conforme</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">24h</div>
                <div className="text-sm text-gray-600">Mise à jour</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="carte" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
              <TabsTrigger value="carte" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Carte nationale</span>
              </TabsTrigger>
              <TabsTrigger value="diagnostic" className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Diagnostic</span>
              </TabsTrigger>
              <TabsTrigger value="bouteilles" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>vs Bouteilles</span>
              </TabsTrigger>
              <TabsTrigger value="polluants" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Polluants</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="carte" className="mt-8">
              <QualityMap />
            </TabsContent>

            <TabsContent value="diagnostic" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Diagnostic personnalisé</h3>
                  <div className="space-y-4">
                    <SearchBar onCitySelect={setSelectedCity} placeholder="Entrez votre adresse..." />
                    {selectedCity && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Recherche pour : {selectedCity}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <WaterQualityCard city={selectedCity || "Paris"} />
              </div>
            </TabsContent>

            <TabsContent value="bouteilles" className="mt-8">
              <BottleComparison />
            </TabsContent>

            <TabsContent value="polluants" className="mt-8">
              <PollutantIndex />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Transparence totale sur votre eau
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Basé sur les données officielles des ARS, agences de l'eau et réseaux publics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Score de confiance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Score global de A à E basé sur la microbiologie, physico-chimie et stabilité historique de votre eau.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Impact environnemental</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comparez l'empreinte carbone et le coût de l'eau du robinet vs les eaux en bouteille.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Plateforme citoyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Alertes en cas de pollution, données ouvertes et accessibles à tous les citoyens français.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold">InfoEau.fr</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Plateforme citoyenne de transparence sur la qualité de l'eau potable en France.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Données</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Méthodologie</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API publique</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Informations</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Conformité</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibilité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Open Data</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 InfoEau.fr - Données basées sur les sources officielles ARS, EauFrance, BRGM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
