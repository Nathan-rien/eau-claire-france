
import React from 'react';
import { Heart, Users, Target, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const APropos = () => {
  const { t } = useLanguage();

  const values = [
    { icon: <Target className="w-8 h-8 text-blue-600" />, title: t('about.transparency'), description: t('about.transparencyDesc') },
    { icon: <Users className="w-8 h-8 text-green-600" />, title: t('about.accessibilityValue'), description: t('about.accessibilityDesc') },
    { icon: <Award className="w-8 h-8 text-purple-600" />, title: t('about.reliability'), description: t('about.reliabilityDesc') },
    { icon: <Heart className="w-8 h-8 text-red-600" />, title: t('about.citizenEngagement'), description: t('about.citizenEngagementDesc') }
  ];

  const timeline = [
    { year: "2024", title: t('about.timeline.launch'), description: t('about.timeline.launchDesc') },
    { year: "2024", title: t('about.timeline.alerts'), description: t('about.timeline.alertsDesc') },
    { year: "2024", title: t('about.timeline.api'), description: t('about.timeline.apiDesc') },
    { year: "2025", title: t('about.timeline.europe'), description: t('about.timeline.europeDesc') }
  ];

  return (
    <Layout>
      <SEOHead {...seoData.aPropos} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
              <span>{t('about.title')}</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">{t('about.subtitle')}</p>
          </div>

          <Card className="mb-6 md:mb-12 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-blue-800">{t('about.missionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-blue-700 text-center leading-relaxed">{t('about.missionText')}</p>
            </CardContent>
          </Card>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('about.historyTitle')}</h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">{t('about.historyText1')}</p>
                <p className="text-gray-700 leading-relaxed mb-6">{t('about.historyText2')}</p>
                <p className="text-gray-700 leading-relaxed">{t('about.historyText3')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('about.valuesTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {value.icon}
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('about.timelineTitle')}</h2>
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">{event.year}</div>
                  </div>
                  <Card className="flex-1">
                    <CardHeader><CardTitle className="text-lg">{event.title}</CardTitle></CardHeader>
                    <CardContent><p className="text-gray-600">{event.description}</p></CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-green-800">{t('about.impactTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div><div className="text-3xl font-bold text-green-700 mb-2">36 000+</div><p className="text-green-600">{t('about.municipalitiesCovered')}</p></div>
                <div><div className="text-3xl font-bold text-green-700 mb-2">27</div><p className="text-green-600">{t('about.euCountries')}</p></div>
                <div><div className="text-3xl font-bold text-green-700 mb-2">100%</div><p className="text-green-600">{t('about.officialData')}</p></div>
                <div><div className="text-3xl font-bold text-green-700 mb-2">Gratuit</div><p className="text-green-600">{t('about.freeAccess')}</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">{t('about.joinTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-center leading-relaxed mb-6">{t('about.joinText')}</p>
              <div className="text-center">
                <a href="/contact" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <span>{t('about.contactUs')}</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default APropos;
