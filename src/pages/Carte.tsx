
import React from 'react';
import { MapPin } from 'lucide-react';
import LazyQualityMap from '@/components/LazyQualityMap';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';

const Carte = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <SEOHead 
        title={seoData.carte.title}
        description={seoData.carte.description}
        keywords={seoData.carte.keywords}
        canonical="/carte"
        ogImage={seoData.carte.ogImage}
        schemaData={seoData.carte.schemaData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: t('breadcrumb.map'), href: '/carte', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <MapPin className="w-8 h-8 text-blue-600" />
                <span>{t('map.title')}</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('map.subtitle')}
              </p>
            </div>
            
            <LazyQualityMap />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Carte;
