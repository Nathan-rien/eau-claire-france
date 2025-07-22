
import React from 'react';
import { MapPin } from 'lucide-react';
import QualityMap from '@/components/QualityMap';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData } from '@/utils/seoData';

const Carte = () => {
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
            { name: 'Carte interactive', href: '/carte', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <MapPin className="w-8 h-8 text-blue-600" />
                <span>Carte des eaux - Qualité nationale</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explorez la qualité de l'eau potable dans toute la France. Cliquez sur votre région pour découvrir les données locales.
              </p>
            </div>
            
            <QualityMap />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Carte;
