
import React from 'react';
import { Database, FileText, ExternalLink, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/utils/ga';

const Sources = () => {
  const { t } = useLanguage();

  const srcKeys = ['ars', 'eaufrance', 'brgm', 'sise', 'opendata', 'eea', 'wise', 'eurostat', 'who'] as const;
  const urls = [
    "https://solidarites-sante.gouv.fr/", "https://www.eaufrance.fr/", "https://www.brgm.fr/",
    "https://sise-eaux.fr/", "https://www.data.gouv.fr/", "https://www.eea.europa.eu/",
    "https://water.europa.eu/", "https://ec.europa.eu/eurostat/", "https://www.who.int/europe/"
  ];
  const dataSources = srcKeys.map((k, i) => ({
    name: t(`sources.src.${k}.name`), description: t(`sources.src.${k}.desc`),
    url: urls[i], type: t(`sources.src.${k}.type`), frequency: t(`sources.src.${k}.freq`), coverage: t(`sources.src.${k}.cov`)
  }));

  const stdKeys = ['oms', 'eu', 'fr', 'eea'] as const;
  const qualityStandards = stdKeys.map(k => ({
    organism: t(`sources.std.${k}.org`), role: t(`sources.std.${k}.role`), reference: t(`sources.std.${k}.ref`)
  }));

  return (
    <Layout>
      <SEOHead {...seoData.sources} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Database className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('sources.title')}</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('sources.subtitle')}
            </p>
          </div>

          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Shield className="w-6 h-6" />
                <span>{t('sources.commitment')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed">{t('sources.commitmentDesc')}</p>
            </CardContent>
          </Card>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('sources.main')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <Badge variant={source.type === t('sources.src.ars.type') ? 'default' : 'secondary'}>{source.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{source.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('sources.frequency')}</span>
                        <span className="font-medium">{source.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('sources.coverage')}</span>
                        <span className="font-medium">{source.coverage}</span>
                      </div>
                    </div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 mt-4">
                      <span>{t('sources.viewSource')}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('sources.standards')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {qualityStandards.map((standard, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{standard.organism}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{standard.role}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">{t('sources.reference')}</p>
                      <p className="text-sm text-gray-600">{standard.reference}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-green-600" />
                <span>{t('sources.updateFrequency')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('sources.realTime')}</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• {t('sources.rt.1')}</li>
                    <li>• {t('sources.rt.2')}</li>
                    <li>• {t('sources.rt.3')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('sources.periodic')}</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• {t('sources.pd.1')}</li>
                    <li>• {t('sources.pd.2')}</li>
                    <li>• {t('sources.pd.3')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default Sources;
