import React, { useState } from 'react';
import { Droplets, MapPin, Info } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import WaterSourcesMap from '@/components/WaterSourcesMap';
import WaterSourceFilters from '@/components/WaterSourceFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterSource } from '@/data/waterSources';

const SourcesEau = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedSource(null);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedSource(null);
  };

  const handleReset = () => {
    setSelectedType('all');
    setSelectedBrand('all');
    setSelectedSource(null);
  };

  const handleSourceSelect = (source: WaterSource) => {
    setSelectedSource(source);
  };

  return (
    <Layout>
      <SEOHead 
        title="Sources d'Eau Minérale en France - Carte Interactive | InfoEau"
        description="Explorez les principales sources des bouteilles d'eau vendues en France. Découvrez leur localisation, leur composition et les marques associées."
        keywords="sources eau bouteilles, carte sources eau, bouteilles eau France, géolocalisation sources, composition, Evian, Volvic, Vittel, Contrex"
        canonical="/sources-eau"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Les sources des bouteilles vendues en France",
          "description": "Carte interactive des principales sources des bouteilles d'eau vendues en France avec informations détaillées",
          "url": "https://info-eau.fr/sources-eau",
          "mainEntity": {
            "@type": "Dataset",
            "name": "Sources d'eau minérale françaises",
            "description": "Base de données des principales sources d'eau minérale en France"
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: 'Sources d\'eau', href: '/sources-eau', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto">
            {/* En-tête de la page */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Droplets className="w-8 h-8 text-blue-600" />
                <span>Les sources des bouteilles vendues en France</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explorez les principales sources des bouteilles d'eau vendues en France. 
                Découvrez leur localisation, leur composition et les marques associées.
              </p>
            </div>

            {/* Section d'information */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    À propos des sources d'eau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">Eau de source</h3>
                      <p className="text-sm text-gray-600">
                        Eau d'origine souterraine, microbiologiquement saine et protégée contre la pollution. 
                        Sa composition peut varier selon la source.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Eau minérale naturelle</h3>
                      <p className="text-sm text-gray-600">
                        Eau souterraine avec une composition minérale constante et des propriétés favorables à la santé. 
                        Chaque source a sa propre signature minérale.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">Eau minérale gazeuse</h3>
                      <p className="text-sm text-gray-600">
                        Eau minérale naturellement gazéifiée ou enrichie en gaz carbonique. 
                        Le CO₂ peut être d'origine naturelle ou ajouté.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interface principale */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Filtres */}
              <div className="lg:col-span-1">
                <WaterSourceFilters
                  selectedType={selectedType}
                  selectedBrand={selectedBrand}
                  onTypeChange={handleTypeChange}
                  onBrandChange={handleBrandChange}
                  onReset={handleReset}
                />
              </div>

              {/* Carte et détails */}
              <div className="lg:col-span-3">
                <WaterSourcesMap
                  selectedType={selectedType}
                  selectedBrand={selectedBrand}
                  onSourceSelect={handleSourceSelect}
                />
              </div>
            </div>

            {/* Section éducative */}
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Comprendre les sources d'eau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Formation des sources</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Les sources d'eau minérale se forment lorsque l'eau de pluie s'infiltre dans le sol 
                        et traverse différentes couches géologiques. Ce voyage peut durer plusieurs années 
                        à plusieurs décennies, permettant à l'eau de se charger en minéraux.
                      </p>
                      
                      <h3 className="font-semibold mb-3">Protection naturelle</h3>
                      <p className="text-sm text-gray-600">
                        Les sources sont naturellement protégées par des couches imperméables qui empêchent 
                        les contaminants de surface d'atteindre l'eau. Cette protection géologique garantit 
                        la pureté de l'eau extraite.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Contrôles qualité</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Chaque source fait l'objet de contrôles rigoureux et réguliers. Les eaux minérales 
                        naturelles bénéficient d'une reconnaissance officielle après étude hydrogéologique 
                        et validation de leurs propriétés.
                      </p>
                      
                      <h3 className="font-semibold mb-3">Préservation environnementale</h3>
                      <p className="text-sm text-gray-600">
                        Les zones de captage sont protégées par des périmètres de sécurité. Les exploitants 
                        mettent en place des programmes de préservation de l'environnement pour maintenir 
                        la qualité des sources à long terme.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SourcesEau;