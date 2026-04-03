
import React from 'react';
import { Database, Download, Code, FileText, Globe, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBottleData } from "@/hooks/useBottleData";
import { useLanguage } from '@/contexts/LanguageContext';

const OpenData = () => {
  const { composition, catalog, mdd, loading, error } = useBottleData();
  const { t } = useLanguage();

  const dsKeys = ['1', '2', '3', '4', '5', '6'] as const;
  const dsFormats = ["JSON, CSV, XML", "JSON, CSV", "GeoJSON, CSV", "JSON, CSV", "JSON, CSV", "JSON, CSV"];
  const dsSizes = ["45 MB", "2.3 MB", "12 MB", "8.7 MB", "1.2 MB", "0.8 MB"];
  const dsUpdates = ["2024-01-15", "2024-01-10", "2024-01-08", "2024-01-12", "2025-01-15", "2025-01-15"];
  const dsLicenses = ["Open Database License (ODbL)", "Creative Commons CC-BY-SA 4.0", "Open Database License (ODbL)", "Creative Commons CC-BY-SA 4.0", "EEA Standard re-use policy", "EEA Standard re-use policy"];
  const datasets = dsKeys.map((k, i) => ({
    name: t(`opendata.ds.${k}.name`), description: t(`opendata.ds.${k}.desc`),
    format: dsFormats[i], size: dsSizes[i], lastUpdate: dsUpdates[i], license: dsLicenses[i]
  }));

  const apiEndpoints = [
    { endpoint: "/api/v1/communes/{insee}/water-quality", method: "GET", description: t('opendata.api.1.desc'), example: "curl https://api.infoeau.fr/v1/communes/33063/water-quality" },
    { endpoint: "/api/v1/pollutants", method: "GET", description: t('opendata.api.2.desc'), example: "curl https://api.infoeau.fr/v1/pollutants" },
    { endpoint: "/api/v1/alerts", method: "GET", description: t('opendata.api.3.desc'), example: "curl https://api.infoeau.fr/v1/alerts?department=33" },
    { endpoint: "/api/v1/eu/water-quality/{country}", method: "GET", description: t('opendata.api.4.desc'), example: "curl https://api.infoeau.fr/v1/eu/water-quality/DE" },
    { endpoint: "/api/v1/eu/pollutants/{country}", method: "GET", description: t('opendata.api.5.desc'), example: "curl https://api.infoeau.fr/v1/eu/pollutants/FR" }
  ];

  return (
    <Layout>
      <SEOHead {...seoData.openData} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Database className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('opendata.title')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">{t('opendata.subtitle')}</p>
          </div>

          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader><CardTitle className="text-purple-800">{t('opendata.csvStatus')}</CardTitle></CardHeader>
            <CardContent>
              {loading && <div className="text-purple-700">{t('opendata.loading')}</div>}
              {error && <div className="text-red-600">{t('opendata.error')} {error}</div>}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-700">
                  <div className="bg-white p-3 rounded"><div className="font-semibold">Composition</div><div className="text-2xl font-bold">{composition?.length ?? 0}</div><div className="text-sm">{t('opendata.loaded')}</div></div>
                  <div className="bg-white p-3 rounded"><div className="font-semibold">Catalogue</div><div className="text-2xl font-bold">{catalog?.length ?? 0}</div><div className="text-sm">{t('opendata.loaded')}</div></div>
                  <div className="bg-white p-3 rounded"><div className="font-semibold">MDD</div><div className="text-2xl font-bold">{mdd?.length ?? 0}</div><div className="text-sm">{t('opendata.loaded')}</div></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Globe className="w-6 h-6" />
                <span>{t('opendata.principles')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-700">
                {(['1','2','3','4'] as const).map(k => (
                  <div key={k}><h4 className="font-semibold mb-2">{t(`opendata.pr.${k}.title`)}</h4><p className="text-sm">{t(`opendata.pr.${k}.desc`)}</p></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('opendata.datasets')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {datasets.map((dataset, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <Badge variant="secondary">{dataset.format}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm">{dataset.description}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-gray-500">{t('opendata.size')}</span><span className="font-medium">{dataset.size}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">{t('opendata.lastUpdate')}</span><span className="font-medium">{dataset.lastUpdate}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">{t('opendata.license')}</span><span className="font-medium text-xs">{dataset.license}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="flex items-center space-x-1"><Download className="w-4 h-4" /><span>{t('opendata.downloadJson')}</span></Button>
                      <Button size="sm" variant="outline" className="flex items-center space-x-1"><Download className="w-4 h-4" /><span>CSV</span></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('opendata.api')}</h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Code className="w-6 h-6 text-purple-600" /><span>{t('opendata.apiAccess')}</span></CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('opendata.apiIntro')}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2"><strong>{t('opendata.apiBaseUrl')}</strong></p>
                  <code className="text-blue-600 font-mono">https://api.infoeau.fr/v1/</code>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              {apiEndpoints.map((api, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Badge variant={api.method === 'GET' ? 'default' : 'secondary'}>{api.method}</Badge>
                      <code className="text-sm font-mono">{api.endpoint}</code>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3 text-sm">{api.description}</p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">{api.example}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Users className="w-6 h-6 text-orange-600" /><span>{t('opendata.community')}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('opendata.comm.projects')}</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• {t('opendata.comm.p1')}</li><li>• {t('opendata.comm.p2')}</li><li>• {t('opendata.comm.p3')}</li><li>• {t('opendata.comm.p4')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('opendata.comm.contribute')}</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• {t('opendata.comm.c1')}</li><li>• {t('opendata.comm.c2')}</li><li>• {t('opendata.comm.c3')}</li><li>• {t('opendata.comm.c4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><FileText className="w-6 h-6 text-blue-600" /><span>{t('opendata.docs')}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4"><FileText className="w-5 h-5" /><div className="text-left"><div className="font-medium">{t('opendata.doc.guide')}</div><div className="text-sm text-gray-500">{t('opendata.doc.guideDesc')}</div></div></Button>
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4"><Code className="w-5 h-5" /><div className="text-left"><div className="font-medium">{t('opendata.doc.apiRef')}</div><div className="text-sm text-gray-500">{t('opendata.doc.apiRefDesc')}</div></div></Button>
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4"><Download className="w-5 h-5" /><div className="text-left"><div className="font-medium">SDKs</div><div className="text-sm text-gray-500">{t('opendata.doc.sdkDesc')}</div></div></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12 border-blue-200 bg-blue-50">
            <CardHeader><CardTitle className="text-blue-800">{t('opendata.help')}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">{t('opendata.helpDesc')}</p>
              <div className="text-blue-700 text-sm">
                <p><strong>{t('opendata.contactLabel')}</strong> contact@infoeau.fr</p>
                <p><strong>{t('opendata.contactSubject')}</strong> {t('opendata.contactSubjectVal')}</p>
              </div>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default OpenData;
