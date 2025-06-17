
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WaterQualityCard from '@/components/WaterQualityCard';
import Layout from '@/components/Layout';

const Diagnostic = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Search className="w-8 h-8 text-blue-600" />
                <span>Diagnostic personnalisé</span>
              </h2>
              <p className="text-lg text-gray-600">
                Découvrez la qualité de l'eau potable distribuée dans votre commune avec un diagnostic détaillé.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Recherchez votre commune</h3>
              <SearchBar onCitySelect={setSelectedCity} placeholder="Entrez votre adresse ou commune..." />
              {selectedCity && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mt-4">
                  <p className="text-blue-800">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Résultats pour : {selectedCity}
                  </p>
                </div>
              )}
            </div>
            
            <WaterQualityCard city={selectedCity || "Paris"} />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Diagnostic;
