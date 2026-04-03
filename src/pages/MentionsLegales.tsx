
import React from 'react';
import { Scale, User, Server, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const MentionsLegales = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead {...seoData.mentionsLegales} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Scale className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('legal.title')}</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('legal.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-blue-600" />
                  <span>{t('legal.editor')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.publisher')}</h4>
                  <p className="text-gray-700">Nathan Orso</p>
                  <p className="text-gray-600">{t('legal.publisherRole')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.contact')}</h4>
                  <p className="text-gray-700">Email : contact@infoeau.fr</p>
                  <p className="text-gray-600">LinkedIn : <a href="https://www.linkedin.com/in/nathan-orso-bdx/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Nathan Orso</a></p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.siteStatus')}</h4>
                  <p className="text-gray-700">{t('legal.siteStatusDesc')}</p>
                  <p className="text-gray-600">{t('legal.citizenProject')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-6 h-6 text-green-600" />
                  <span>{t('legal.hosting')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.hostingPlatform')}</h4>
                  <p className="text-gray-700">Lovable.dev</p>
                  <p className="text-gray-600">{t('legal.hostingDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.infrastructure')}</h4>
                  <p className="text-gray-700">{t('legal.infrastructureDesc')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <span>{t('legal.ip')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.codeDesign')}</h4>
                  <p className="text-gray-700">{t('legal.codeDesignDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.publicData')}</h4>
                  <p className="text-gray-700">{t('legal.publicDataDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.brands')}</h4>
                  <p className="text-gray-700">{t('legal.brandsDesc')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('legal.responsibility')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.accuracy')}</h4>
                  <p className="text-gray-700">{t('legal.accuracyDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.limitation')}</h4>
                  <p className="text-gray-700">{t('legal.limitationDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.availability')}</h4>
                  <p className="text-gray-700">{t('legal.availabilityDesc')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('legal.terms')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.access')}</h4>
                  <p className="text-gray-700">{t('legal.accessDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.usage')}</h4>
                  <p className="text-gray-700">{t('legal.usageDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legal.changes')}</h4>
                  <p className="text-gray-700">{t('legal.changesDesc')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">{t('legal.law')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">{t('legal.lawDesc')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 md:mt-12">
            <NavigationCTA />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentionsLegales;
