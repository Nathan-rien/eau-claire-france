import React from 'react';
import { Droplets } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import WaterJourneyMap from '@/components/WaterJourneyMap';
import { useLanguage } from '@/contexts/LanguageContext';

const CarteParcoursEau = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead
        title="Parcours de l'eau en bouteille : source → magasin | InfoEau.fr"
        description="Visualisez le trajet de l'eau en bouteille depuis sa source de captage jusqu'aux magasins distributeurs (Carrefour, Leclerc, etc.)."
        keywords="parcours eau bouteille, source, distributeur, MDD, carte, animation"
        canonical="/carte-parcours-eau"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: t('nav.maps'), href: '/carte' },
            { name: t('waterJourney.breadcrumb'), href: '/carte-parcours-eau', current: true },
          ]} />
        </div>

        <section className="py-6 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
                <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>{t('waterJourney.title')}</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                {t('waterJourney.subtitle')}
              </p>
            </div>

            <WaterJourneyMap />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CarteParcoursEau;
