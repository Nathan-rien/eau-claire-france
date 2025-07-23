
import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottleComparison from '@/components/BottleComparison';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData } from '@/utils/seoData';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Bouteilles = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <SEOHead 
        title={seoData.bouteilles.title}
        description={seoData.bouteilles.description}
        keywords={seoData.bouteilles.keywords}
        canonical="/bouteilles"
        ogImage={seoData.bouteilles.ogImage}
        schemaData={seoData.bouteilles.schemaData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: t('breadcrumb.bottles'), href: '/bouteilles', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>{t('bottles.title')}</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4 mb-6">
                {t('bottles.subtitle')}
              </p>
              
              {/* Lien vers le comparatif avancé */}
              <Card className="max-w-md mx-auto mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">{t('bottles.advanced.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('bottles.advanced.description')}
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/comparatif-bouteilles">
                      {t('bottles.advanced.button')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <BottleComparison />
          </div>
        </section>

        <NavigationCTA />
      </div>
    </Layout>
  );
};

export default Bouteilles;
