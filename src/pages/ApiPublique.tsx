
import React from 'react';
import { Code, Database, Key, Globe } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const ApiPublique = () => {
  const { t } = useLanguage();

  const endpoints = [
    { method: "GET", path: "/api/v1/water-quality/{commune}", description: t('api.ep.1.desc'), parameters: [{ name: "commune", type: "string", required: true, description: t('api.ep.1.p1.desc') }], example: "https://api.infoeau.fr/v1/water-quality/75001" },
    { method: "GET", path: "/api/v1/pollutants/{region}", description: t('api.ep.2.desc'), parameters: [{ name: "region", type: "string", required: true, description: t('api.ep.2.p1.desc') }, { name: "limit", type: "number", required: false, description: t('api.ep.2.p2.desc') }], example: "https://api.infoeau.fr/v1/pollutants/11?limit=50" },
    { method: "GET", path: "/api/v1/alerts", description: t('api.ep.3.desc'), parameters: [{ name: "type", type: "string", required: false, description: t('api.ep.3.p1.desc') }, { name: "since", type: "date", required: false, description: t('api.ep.3.p2.desc') }], example: "https://api.infoeau.fr/v1/alerts?type=sanitaire" },
    { method: "GET", path: "/api/v1/networks", description: t('api.ep.4.desc'), parameters: [{ name: "department", type: "string", required: false, description: t('api.ep.4.p1.desc') }, { name: "operator", type: "string", required: false, description: t('api.ep.4.p2.desc') }], example: "https://api.infoeau.fr/v1/networks?department=75" },
    { method: "GET", path: "/api/v1/eu/water-quality/{country}", description: t('api.ep.5.desc'), parameters: [{ name: "country", type: "string", required: true, description: t('api.ep.5.p1.desc') }], example: "https://api.infoeau.fr/v1/eu/water-quality/DE" },
    { method: "GET", path: "/api/v1/eu/pollutants", description: t('api.ep.6.desc'), parameters: [{ name: "category", type: "string", required: false, description: t('api.ep.6.p1.desc') }], example: "https://api.infoeau.fr/v1/eu/pollutants?category=Chimique%20émergent" },
    { method: "GET", path: "/api/v1/eu/pollutants/{country}", description: t('api.ep.7.desc'), parameters: [{ name: "country", type: "string", required: true, description: t('api.ep.7.p1.desc') }], example: "https://api.infoeau.fr/v1/eu/pollutants/FR" }
  ];

  const responseExample = {
    status: "success",
    data: {
      commune: { code: "75001", name: "Paris 1er Arrondissement", population: 16888 },
      network: { name: "Réseau Paris Centre", operator: "Eau de Paris", source_type: "Eau de surface traitée" },
      last_analysis: "2024-12-15",
      quality_indicators: { microbiological_compliance: 100, chemical_compliance: 98.5, risk_level: "low" },
      detected_pollutants: [{ name: "Nitrates", value: 12.5, unit: "mg/L", limit: 50, status: "compliant" }]
    }
  };

  return (
    <Layout>
      <SEOHead {...seoData.apiPublique} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Code className="w-10 h-10 text-blue-600" />
              <span>{t('api.title')}</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('api.subtitle')}</p>
          </div>

          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Globe className="w-6 h-6" />
                <span>{t('api.free')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 leading-relaxed mb-4">{t('api.freeDesc')}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2"><Badge className="bg-green-600">{t('api.badge.free')}</Badge><span className="text-sm text-blue-700">{t('api.badge.freeDesc')}</span></div>
                <div className="flex items-center space-x-2"><Badge className="bg-green-600">Open Data</Badge><span className="text-sm text-blue-700">{t('api.badge.openDataDesc')}</span></div>
                <div className="flex items-center space-x-2"><Badge className="bg-green-600">RESTful</Badge><span className="text-sm text-blue-700">{t('api.badge.restDesc')}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Key className="w-6 h-6 text-green-600" /><span>{t('api.auth')}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{t('api.authDesc')}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('api.baseUrl')}</p>
                <code className="text-sm bg-white px-2 py-1 rounded border">https://api.infoeau.fr</code>
              </div>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('api.endpoints')}</h2>
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>{endpoint.method}</Badge>
                      <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">{endpoint.path}</code>
                    </div>
                    <p className="text-gray-600">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('api.params')}</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, pi) => (
                            <div key={pi} className="flex items-center space-x-3 text-sm">
                              <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              {param.required && <Badge variant="destructive" className="text-xs">{t('api.required')}</Badge>}
                              <span className="text-gray-600">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('api.example')}</h4>
                        <code className="text-sm bg-blue-50 text-blue-800 px-3 py-2 rounded block">{endpoint.example}</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Database className="w-6 h-6 text-purple-600" /><span>{t('api.responseExample')}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{t('api.responseDesc')}</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">{JSON.stringify(responseExample, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader><CardTitle className="text-orange-800">{t('api.limits')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 text-orange-700">
                <div>
                  <h4 className="font-semibold mb-2">{t('api.limits.techTitle')}</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>{t('api.limits.t1')}</li>
                    <li>{t('api.limits.t2')}</li>
                    <li>{t('api.limits.t3')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('api.limits.condTitle')}</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>{t('api.limits.c1')}</li>
                    <li>{t('api.limits.c2')}</li>
                    <li>{t('api.limits.c3')}</li>
                    <li>{t('api.limits.c4')}</li>
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

export default ApiPublique;
