import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PollutantMapEurope from '@/components/PollutantMapEurope';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';

const CartePolluantsEurope = () => {
  return (
    <Layout>
      <SEOHead
        title="Carte des polluants en Europe – Eau potable UE"
        description="Visualisez la répartition des polluants dans l'eau potable des 27 pays de l'UE : nitrates, pesticides, PFAS, métaux lourds."
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-background dark:to-background">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <span>Carte des polluants en Europe</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Visualisez la répartition géographique des polluants dans l'eau potable
                des 27 pays de l'Union Européenne. Identifiez les pays à risque et les
                polluants prévalents.
              </p>
            </div>

            <PollutantMapEurope />

            <div className="mt-8 text-center">
              <div className="bg-card rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Navigation</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="/carte-europe"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200"
                  >
                    Carte qualité Europe
                  </a>
                  <a
                    href="/polluants-europe"
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-red-200"
                  >
                    Index des polluants
                  </a>
                  <a
                    href="/diagnostic-europe"
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900 dark:text-green-200"
                  >
                    Diagnostic Europe
                  </a>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Source : EEA WISE DWD – QualityInformation, 2023. Seuils selon la Directive 2020/2184.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CartePolluantsEurope;
