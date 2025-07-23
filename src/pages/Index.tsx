
import React, { useState } from 'react';
import { Search, MapPin, Droplets, AlertTriangle, TrendingUp, Leaf, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchBar from '@/components/SearchBar';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead 
        title={seoData.home.title}
        description={seoData.home.description}
        keywords={seoData.home.keywords}
        canonical="/"
        ogImage={seoData.home.ogImage}
        schemaData={seoData.home.schemaData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="py-8 md:py-12 lg:py-16 px-4" role="banner">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
                {t('home.title')} 
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> {t('home.titleHighlight')}</span> ?
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-2">
                {t('home.subtitle')}
              </p>
              
              <div className="mb-6 md:mb-8 lg:mb-12">
                <SearchBar onCitySelect={setSelectedCity} />
                {selectedCity && (
                  <div className="mt-4 px-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 max-w-lg mx-auto">
                      <p className="text-blue-800 text-sm md:text-base">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        {t('home.searchResult', { city: selectedCity })}
                      </p>
                      <div className="mt-2">
                        <a 
                          href="/diagnostic" 
                          className="text-blue-600 hover:text-blue-800 font-medium underline text-sm md:text-base"
                        >
                          {t('home.seeFullDiagnostic')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Access Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12 px-2">
                <a href="/carte" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-blue-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-blue-600">{t('home.quickAccess.map')}</div>
                    <div className="text-xs md:text-sm text-gray-600">{t('home.quickAccess.mapSub')}</div>
                  </div>
                </a>
                <a href="/diagnostic" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-green-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <Search className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-green-600">{t('home.quickAccess.diagnostic')}</div>
                    <div className="text-xs md:text-sm text-gray-600">{t('home.quickAccess.diagnosticSub')}</div>
                  </div>
                </a>
                <a href="/bouteilles" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-orange-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-orange-600">{t('home.quickAccess.bottles')}</div>
                    <div className="text-xs md:text-sm text-gray-600">{t('home.quickAccess.bottlesSub')}</div>
                  </div>
                </a>
                <a href="/polluants" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 lg:p-6 border border-purple-100 hover:shadow-lg transition-all group-hover:scale-105">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm md:text-base lg:text-lg font-bold text-purple-600">{t('home.quickAccess.pollutants')}</div>
                    <div className="text-xs md:text-sm text-gray-600">{t('home.quickAccess.pollutantsSub')}</div>
                  </div>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12 px-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-blue-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">35,000+</div>
                  <div className="text-xs md:text-sm text-gray-600">{t('home.stats.communes')}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-green-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">50+</div>
                  <div className="text-xs md:text-sm text-gray-600">{t('home.stats.pollutants')}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-orange-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-orange-600">98%</div>
                  <div className="text-xs md:text-sm text-gray-600">{t('home.stats.compliance')}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-purple-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">24h</div>
                  <div className="text-xs md:text-sm text-gray-600">{t('home.stats.update')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 md:py-12 lg:py-16 px-4 bg-white" role="region" aria-labelledby="features-title">
          <div className="container mx-auto">
            <div className="text-center mb-6 md:mb-8 lg:mb-12">
              <h2 id="features-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                {t('home.features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4">
              <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-base md:text-lg lg:text-xl">{t('home.features.trust.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    {t('home.features.trust.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Leaf className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-base md:text-lg lg:text-xl">{t('home.features.environment.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    {t('home.features.environment.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-base md:text-lg lg:text-xl">{t('home.features.citizen.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    {t('home.features.citizen.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Navigation CTA */}
        <section className="py-8 md:py-12 lg:py-16 px-4">
          <div className="container mx-auto">
            <NavigationCTA />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
