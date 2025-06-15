
import React from 'react';
import { MapPin, Droplets } from 'lucide-react';
import QualityMap from '@/components/QualityMap';
import Footer from '@/components/Footer';

const Carte = () => {
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
              <a href="/carte" className="text-blue-600 font-medium">Carte</a>
              <a href="/diagnostic" className="text-gray-600 hover:text-blue-600 transition-colors">Diagnostic</a>
              <a href="/bouteilles" className="text-gray-600 hover:text-blue-600 transition-colors">vs Bouteilles</a>
              <a href="/polluants" className="text-gray-600 hover:text-blue-600 transition-colors">Polluants</a>
            </nav>
          </div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <span>Carte nationale de la qualité de l'eau</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorez la qualité de l'eau potable dans toute la France. Cliquez sur votre région pour découvrir les données locales.
            </p>
          </div>
          
          <QualityMap />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Carte;
