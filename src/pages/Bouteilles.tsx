
import React from 'react';
import { TrendingUp } from 'lucide-react';
import BottleComparison from '@/components/BottleComparison';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';

const Bouteilles = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>Eau du robinet vs Bouteilles</span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Comparez la qualité, le coût et l'impact environnemental de l'eau du robinet avec les eaux en bouteille.
              </p>
            </div>
            
            <BottleComparison />
          </div>
        </section>

        <NavigationCTA />
      </div>
    </Layout>
  );
};

export default Bouteilles;
