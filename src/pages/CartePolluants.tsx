
import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import PollutantMap from '@/components/PollutantMap';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';

const CartePolluants = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead {...seoData.cartePolluants} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <span>{t('pollutantMap.title')}</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('pollutantMap.subtitle')}
              </p>
            </div>
            
            <PollutantMap />
            
            <div className="mt-8 text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">{t('pollutantMap.nav')}</h3>
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
