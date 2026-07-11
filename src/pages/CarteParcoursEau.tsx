import React, { lazy, Suspense } from 'react';
import { Droplets } from 'lucide-react';
import Layout from '@/components/Layout';
import TrackMapView from '@/components/TrackMapView';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { useLanguage } from '@/contexts/LanguageContext';
import { seoData } from '@/utils/seoData';
import { MapLoader, MapLoadingPlaceholder } from '@/components/ui/map-loader';

const WaterJourneyMap = lazy(() => import('@/components/WaterJourneyMap'));

const CarteParcoursEau = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead {...seoData.carteParcoursEau} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: t('nav.maps'), href: '/carte' },
            { name: t('bottleJourney.breadcrumb'), href: '/carte-parcours-eau', current: true },
          ]} />
        </div>

        <section className="py-6 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
                <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>{t('bottleJourney.title')}</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                {t('bottleJourney.subtitle')}
              </p>
            </div>

            <MapLoader>
              <Suspense fallback={<MapLoadingPlaceholder />}>
                <WaterJourneyMap />
              </Suspense>
            </MapLoader>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CarteParcoursEau;
