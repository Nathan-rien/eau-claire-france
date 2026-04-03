
import React from 'react';
import { Shield, Eye, FileText, Users, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const RGPD = () => {
  const { t } = useLanguage();

  const navItems = t('rgpd.navItems').split('|');
  const searchItems = t('rgpd.searchItems').split('|');

  const rights = [
    { title: t('rgpd.rightAccess'), desc: t('rgpd.rightAccessDesc') },
    { title: t('rgpd.rightRectification'), desc: t('rgpd.rightRectificationDesc') },
    { title: t('rgpd.rightDeletion'), desc: t('rgpd.rightDeletionDesc') },
    { title: t('rgpd.rightPortability'), desc: t('rgpd.rightPortabilityDesc') },
    { title: t('rgpd.rightOpposition'), desc: t('rgpd.rightOppositionDesc') },
    { title: t('rgpd.rightLimitation'), desc: t('rgpd.rightLimitationDesc') },
  ];

  return (
    <Layout>
      <SEOHead {...seoData.rgpd} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('rgpd.title')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('rgpd.subtitle')}
            </p>
          </div>

          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Users className="w-6 h-6" />
                <span>{t('rgpd.controller')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-blue-700 space-y-2">
                <p><strong>{t('rgpd.label.name')}</strong> Nathan Orso</p>
                <p><strong>{t('rgpd.label.contact')}</strong> contact@infoeau.fr</p>
                <p><strong>{t('rgpd.label.address')}</strong> {t('rgpd.label.addressVal')}</p>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('rgpd.dataCollected')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-6 h-6 text-green-600" />
                    <span>{t('rgpd.navData')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    {navItems.map((item, i) => <li key={i}>• {item}</li>)}
                  </ul>
                  <p className="mt-4 text-sm text-gray-500">
                    <strong>{t('rgpd.navPurpose')}</strong>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <span>{t('rgpd.searchData')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    {searchItems.map((item, i) => <li key={i}>• {item}</li>)}
                  </ul>
                  <p className="mt-4 text-sm text-gray-500">
                    <strong>{t('rgpd.searchPurpose')}</strong>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('rgpd.rights')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rights.map((right, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{right.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{right.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-6 h-6 text-purple-600" />
                <span>{t('rgpd.security')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('rgpd.technicalMeasures')}</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• {t('rgpd.sec.t1')}</li>
                    <li>• {t('rgpd.sec.t2')}</li>
                    <li>• {t('rgpd.sec.t3')}</li>
                    <li>• {t('rgpd.sec.t4')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('rgpd.orgMeasures')}</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• {t('rgpd.sec.o1')}</li>
                    <li>• {t('rgpd.sec.o2')}</li>
                    <li>• {t('rgpd.sec.o3')}</li>
                    <li>• {t('rgpd.sec.o4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('rgpd.euData')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('rgpd.euDataDesc')}</p>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('rgpd.retention')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('rgpd.navData')}</h4>
                  <p className="text-gray-600 text-sm">{t('rgpd.ret.nav')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('rgpd.searchData')}</h4>
                  <p className="text-gray-600 text-sm">{t('rgpd.ret.search')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle>{t('rgpd.exerciseRights')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{t('rgpd.exerciseDesc')}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800"><strong>{t('rgpd.label.email')}</strong> contact@infoeau.fr</p>
                <p className="text-blue-800"><strong>{t('rgpd.label.subject')}</strong> {t('rgpd.label.subjectVal')}</p>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                {t('rgpd.cnilNote')}{' '}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  www.cnil.fr
                </a>
              </p>
            </CardContent>
          </Card>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default RGPD;
