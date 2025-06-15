
import React, { useState } from 'react';
import { Search, MapPin, Droplets } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WaterQualityCard from '@/components/WaterQualityCard';

const Diagnostic = () => {
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
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Accueil</a>
              <a href="/carte" className="text-gray-600 hover:text-blue-600 transition-colors">Carte</a>
              <a href="/diagnostic" className="text-blue-600 font-medium">Diagnostic</a>
              <a href="/bouteilles" className="text-gray-600 hover:text-blue-600 transition-colors">vs Bouteilles</a>
              <a href="/polluants" className="text-gray-600 hover:text-blue-600 transition-colors">Polluants</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
              <Search className="w-8 h-8 text-blue-600" />
              <span>Diagnostic personnalisé</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez la qualité de l'eau potable distribuée dans votre commune avec un diagnostic détaillé.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-6">Recherchez votre commune</h3>
              <div className="space-y-4">
                <SearchBar onCitySelect={setSelectedCity} placeholder="Entrez votre adresse ou commune..." />
                {selectedCity && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Résultats pour : {selectedCity}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <WaterQualityCard city={selectedCity || "Paris"} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Diagnostic;
