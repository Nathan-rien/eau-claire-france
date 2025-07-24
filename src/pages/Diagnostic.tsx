
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WaterQualityCard from '@/components/WaterQualityCard';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';

const Diagnostic = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  // Load city from URL parameter on startup
  useEffect(() => {
    const cityFromUrl = searchParams.get('city');
    if (cityFromUrl) {
      setSelectedCity(cityFromUrl);
    }
  }, [searchParams]);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Search className="w-8 h-8 text-blue-600" />
                <span>{t('diagnostic.title')}</span>
              </h1>
              <p className="text-lg text-gray-600">
                {t('diagnostic.subtitle')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">{t('diagnostic.searchTitle')}</h3>
              <SearchBar onCitySelect={setSelectedCity} placeholder={t('diagnostic.searchPlaceholder')} />
              {selectedCity && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mt-4">
                  <p className="text-blue-800">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t('diagnostic.searchResult', { city: selectedCity })}
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
