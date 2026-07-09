import React, { lazy, Suspense, useState } from 'react';
import { AlertTriangle, Droplets, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { MapLoader, MapLoadingPlaceholder } from '@/components/ui/map-loader';
import TasteWall from '@/components/TasteWall';
import TasteReportForm from '@/components/TasteReportForm';
import TastePartnerForm from '@/components/TastePartnerForm';


const TasteMap = lazy(() => import('@/components/TasteMap'));

const GoutEau: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <Layout>
      <SEOHead {...seoData.goutEau} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-6 md:py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                <Droplets className="w-7 h-7 md:w-9 md:h-9 text-blue-600" />
                <span>Goût de l'eau du robinet par région</span>
              </h1>
              <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
                Ce que les Français disent réellement du goût de leur eau du robinet :
                témoignages, sondages et articles de presse, cartographiés par région.
              </p>
            </div>

            {/* Avertissement */}
            <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 md:p-5 flex gap-3 max-w-4xl mx-auto">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Perceptions qualitatives, pas des mesures officielles</p>
                <p className="leading-relaxed">
                  Les retours ci-dessous proviennent de la presse, de sondages et de
                  témoignages. Ils reflètent des <strong>ressentis</strong> et non des mesures
                  de conformité sanitaire. Pour les données réglementaires,
                  consultez la{' '}
                  <Link to="/carte" className="underline font-medium">
                    carte de la qualité de l'eau
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Map */}
            <div className="mb-10">
              <MapLoader>
                <Suspense fallback={<MapLoadingPlaceholder />}>
                  <TasteMap
                    onSelectRegion={(r) => setSelectedRegion(r)}
                    selectedRegion={selectedRegion}
                  />
                </Suspense>
              </MapLoader>
            </div>

            {/* Wall */}
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {selectedRegion
                    ? `Retours pour ${selectedRegion}`
                    : 'Mur des retours'}
                </h2>
              </div>
              <TasteWall
                selectedRegion={selectedRegion}
                onClearRegion={() => setSelectedRegion(null)}
              />
            </div>

            {/* Contribution form */}
            <div className="mb-10 max-w-3xl mx-auto">
              <TasteReportForm />
            </div>

            {/* Cross-links */}

            <div className="mt-8 bg-white rounded-lg p-4 md:p-6 shadow-lg max-w-3xl mx-auto">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-900">
                Aller plus loin
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/carte"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Carte de la qualité
                </Link>
                <Link
                  to="/carte-polluants"
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Carte des polluants
                </Link>
                <Link
                  to="/quelle-eau-boire"
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  Quelle eau boire ?
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GoutEau;
