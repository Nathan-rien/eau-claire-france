
import React, { lazy, Suspense } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import TrackMapView from '@/components/TrackMapView';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapLoader, MapLoadingPlaceholder } from '@/components/ui/map-loader';

const PollutantMap = lazy(() => import('@/components/PollutantMap'));

const CartePolluants = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <TrackMapView name="carte_polluants_france" />
      <SEOHead {...seoData.cartePolluants} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-6 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                <span>{t('pollutantMap.title')}</span>
              </h1>
              <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
                {t('pollutantMap.subtitle')}
              </p>
            </div>
            
            <MapLoader>
              <Suspense fallback={<MapLoadingPlaceholder />}>
                <PollutantMap />
              </Suspense>
            </MapLoader>
            
            <div className="mt-6 md:mt-8 text-center">
              <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-900">{t('pollutantMap.nav')}</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a 
                    href="/carte" 
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {t('pollutantMap.waterMap')}
                  </a>
                  <a 
                    href="/polluants" 
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    {t('pollutantMap.pollutantIndex')}
                  </a>
                  <a 
                    href="/diagnostic" 
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    {t('pollutantMap.localDiag')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CartePolluants;
