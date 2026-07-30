import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PollutantMapEurope from '@/components/PollutantMapEurope';
import Layout from '@/components/Layout';
import TrackMapView from '@/components/TrackMapView';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';

const CartePolluantsEurope = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <TrackMapView name="carte_polluants_europe" />
      <SEOHead
        {...seoData.cartePolluantsEurope}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-background dark:to-background">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <span>{t('europePollutantMap.title')}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('europePollutantMap.subtitle')}
              </p>
            </div>

            <PollutantMapEurope />

            <div className="mt-8 text-center">
              <div className="bg-card rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-3 text-foreground">{t('europePollutantMap.nav')}</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="/carte-europe"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200"
                  >
                    {t('europePollutantMap.qualityMap')}
                  </a>
                  <a
                    href="/polluants-europe"
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-red-200"
                  >
                    {t('europePollutantMap.pollutantIndex')}
                  </a>
                  <a
                    href="/diagnostic-europe"
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900 dark:text-green-200"
                  >
                    {t('europePollutantMap.diagnostic')}
                  </a>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {t('europePollutantMap.source')}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CartePolluantsEurope;
