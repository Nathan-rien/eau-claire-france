
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WaterQualityCard from '@/components/WaterQualityCard';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import AffiliateProductPick from '@/components/affiliate/AffiliateProductPick';

const Diagnostic = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isUsingGeolocation, setIsUsingGeolocation] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  
  // Géolocalisation
  const { coordinates, error: geoError, loading: geoLoading, getCurrentPosition } = useGeolocation();
  const { data: reverseGeoData, isLoading: reverseGeoLoading } = useReverseGeocoding(coordinates);

  // Load city from URL parameter on startup
  useEffect(() => {
    const cityFromUrl = searchParams.get('city');
    if (cityFromUrl) {
      setSelectedCity(cityFromUrl);
      setIsUsingGeolocation(false);
    }
  }, [searchParams]);

  // Auto-set city from geolocation when available
  useEffect(() => {
    if (reverseGeoData?.city && !selectedCity && !searchParams.get('city')) {
      setSelectedCity(reverseGeoData.city);
      setIsUsingGeolocation(true);
    }
  }, [reverseGeoData, selectedCity, searchParams]);

  // Automatically trigger geolocation on page load if no city is set
  useEffect(() => {
    if (!selectedCity && !searchParams.get('city') && !geoLoading) {
      getCurrentPosition();
    }
  }, [selectedCity, searchParams, geoLoading, getCurrentPosition]);

  const handleGeolocationClick = () => {
    getCurrentPosition();
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsUsingGeolocation(false);
  };

  return (
    <Layout>
      <SEOHead 
        title={seoData.diagnostic.title}
        description={seoData.diagnostic.description}
        keywords={seoData.diagnostic.keywords}
        canonical="/diagnostic"
        ogImage={seoData.diagnostic.ogImage}
        schemaData={seoData.diagnostic.schemaData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumb items={[
            { name: t('breadcrumb.diagnostic'), href: '/diagnostic', current: true }
          ]} />
        </div>
        
        <section className="py-8 px-4" role="main">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Search className="w-8 h-8 text-blue-600" />
                <span>{t('diagnostic.title')}</span>
              </h1>
              <p className="text-lg text-gray-600">
                {t('diagnostic.subtitle')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-center sm:text-left">{t('diagnostic.searchTitle')}</h2>
                <Button
                  onClick={handleGeolocationClick}
                  disabled={geoLoading || reverseGeoLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {geoLoading || reverseGeoLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  Ma position
                </Button>
              </div>
              
              {geoError && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center mb-4">
                  <p className="text-orange-800 text-sm">{geoError}</p>
                </div>
              )}
              
              <SearchBar onCitySelect={handleCitySelect} placeholder={t('diagnostic.searchPlaceholder')} />
              
              {selectedCity && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mt-4">
                  <p className="text-blue-800">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {isUsingGeolocation ? (
                      <>Ville détectée automatiquement : <strong>{selectedCity}</strong></>
                    ) : (
                      <>Ville sélectionnée : <strong>{selectedCity}</strong></>
                    )}
                  </p>
                </div>
              )}
            </div>
            
            <WaterQualityCard city={selectedCity || "Paris"} />

            <AffiliateProductPick
              category="filtration"
              problemContext={searchParams.get('probleme') ?? undefined}
              className="px-0"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Diagnostic;
