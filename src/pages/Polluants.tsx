
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PollutantIndex from '@/components/PollutantIndex';
import Layout from '@/components/Layout';

const Polluants = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
                <span>Index des polluants</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez les différents polluants surveillés dans l'eau potable, leurs origines et leurs effets sur la santé.
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
