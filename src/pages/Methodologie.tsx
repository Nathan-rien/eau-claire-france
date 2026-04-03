import React from 'react';
import { BookOpen, Target, BarChart3, CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const Methodologie = () => {
  const { t } = useLanguage();

  const methodology = (['1','2','3','4'] as const).map(s => ({
    step: s,
    title: t(`methodology.step.${s}.title`),
    description: t(`methodology.step.${s}.desc`),
    details: [t(`methodology.step.${s}.d1`), t(`methodology.step.${s}.d2`), t(`methodology.step.${s}.d3`), t(`methodology.step.${s}.d4`)]
  }));

  const qualityIndicators = (['1','2','3'] as const).map(i => ({
    name: t(`methodology.ind.${i}.name`),
    description: t(`methodology.ind.${i}.desc`),
    calculation: t(`methodology.ind.${i}.calc`),
    threshold: t(`methodology.ind.${i}.threshold`)
  }));

  return (
    <Layout>
      <SEOHead {...seoData.methodologie} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('methodology.title')}</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('methodology.subtitle')}
            </p>
          </div>

          <Card className="mb-6 md:mb-12 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Target className="w-6 h-6" />
                <span>{t('methodology.principles')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['1','2','3','4'] as const).map(k => (
                  <div key={k}>
                    <h4 className="font-semibold text-green-800 mb-2">{t(`methodology.pr.${k}.title`)}</h4>
                    <p className="text-green-700 text-sm">{t(`methodology.pr.${k}.desc`)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('methodology.process')}</h2>
            <div className="space-y-6">
              {methodology.map((step, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('methodology.indicators')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {qualityIndicators.map((indicator, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>{indicator.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{indicator.description}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('methodology.calcLabel')}</p>
                        <p className="text-sm text-gray-600">{indicator.calculation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('methodology.thresholdLabel')}</p>
                        <Badge variant="outline" className="text-xs">{indicator.threshold}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-6 md:mb-12 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <BarChart3 className="w-6 h-6" />
                <span>{t('methodology.euData')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed mb-4">{t('methodology.eu.intro')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">{t('methodology.eu.sourcesTitle')}</h4>
                  <ul className="space-y-1 text-blue-700 text-sm">
                    <li>• {t('methodology.eu.s1')}</li>
                    <li>• {t('methodology.eu.s2')}</li>
                    <li>• {t('methodology.eu.s3')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">{t('methodology.eu.scoringTitle')}</h4>
                  <ul className="space-y-1 text-blue-700 text-sm">
                    <li>• {t('methodology.eu.sc1')}</li>
                    <li>• {t('methodology.eu.sc2')}</li>
                    <li>• {t('methodology.eu.sc3')}</li>
                    <li>• {t('methodology.eu.sc4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">{t('methodology.limitations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-orange-700">
                {(['1','2','3','4'] as const).map(k => (
                  <p key={k}><strong>{t(`methodology.lim.${k}.title`)}</strong> {t(`methodology.lim.${k}.desc`)}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default Methodologie;
