
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PollutantIndex from '@/components/PollutantIndex';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const Polluants = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-6 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>{t('pollutants.title')}</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('pollutants.description')}
              </p>
            </div>
            
            <PollutantIndex />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Polluants;
