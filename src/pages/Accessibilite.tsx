
import React from 'react';
import { Accessibility, Eye, Ear, Hand, Brain } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const Accessibilite = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead {...seoData.accessibilite} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Accessibility className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('a11y.title')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('a11y.subtitle')}
            </p>
          </div>

          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Badge variant="secondary" className="bg-green-100 text-green-800">Niveau AA</Badge>
                <span>{t('a11y.conformance')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 leading-relaxed">{t('a11y.conformanceDesc')}</p>
              <p className="text-green-700 mt-2"><strong>{t('a11y.lastEval')}</strong> {t('a11y.lastEvalDate')}</p>
            </CardContent>
          </Card>

          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('a11y.measures')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{t('a11y.visual')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• {t('a11y.vis.1')}</li>
                    <li>• {t('a11y.vis.2')}</li>
                    <li>• {t('a11y.vis.3')}</li>
                    <li>• {t('a11y.vis.4')}</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Hand className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{t('a11y.keyboard')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• {t('a11y.kb.1')}</li>
                    <li>• {t('a11y.kb.2')}</li>
                    <li>• {t('a11y.kb.3')}</li>
                    <li>• {t('a11y.kb.4')}</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">{t('a11y.cognitive')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• {t('a11y.cog.1')}</li>
                    <li>• {t('a11y.cog.2')}</li>
                    <li>• {t('a11y.cog.3')}</li>
                    <li>• {t('a11y.cog.4')}</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Ear className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">{t('a11y.auditory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• {t('a11y.aud.1')}</li>
                    <li>• {t('a11y.aud.2')}</li>
                    <li>• {t('a11y.aud.3')}</li>
                    <li>• {t('a11y.aud.4')}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('a11y.assistive')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('a11y.screenReaders')}</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• NVDA (Windows)</li>
                    <li>• JAWS (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('a11y.browsers')}</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Chrome</li>
                    <li>• Firefox</li>
                    <li>• Safari</li>
                    <li>• Edge</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('a11y.shortcuts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{t('a11y.sc.1')}</span>
                    <Badge variant="outline">Alt + C</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{t('a11y.sc.2')}</span>
                    <Badge variant="outline">Alt + M</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{t('a11y.sc.3')}</span>
                    <Badge variant="outline">Alt + S</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{t('a11y.sc.4')}</span>
                    <Badge variant="outline">Tab / Shift+Tab</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{t('a11y.sc.5')}</span>
                    <Badge variant="outline">Entrée / Espace</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{t('a11y.sc.6')}</span>
                    <Badge variant="outline">Échap</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('a11y.report')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{t('a11y.reportDesc')}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 mb-2"><strong>{t('a11y.reportEmail')}</strong> contact@infoeau.fr</p>
                <p className="text-blue-800 mb-2"><strong>{t('a11y.reportSubject')}</strong> {t('a11y.reportSubjectVal')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('a11y.exceptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('a11y.maps')}</h4>
                  <p className="text-gray-600 text-sm">{t('a11y.mapsDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('a11y.charts')}</h4>
                  <p className="text-gray-600 text-sm">{t('a11y.chartsDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">{t('a11y.help')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">{t('a11y.helpDesc')}</p>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default Accessibilite;
