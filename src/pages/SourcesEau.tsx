import { useEffect, useRef, useState, useMemo } from "react";
import { Droplets, MapPin, Info, FlaskConical, BarChart3, Database } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WaterSourcesMap from '@/components/WaterSourcesMap';
import { buildSources, type SourceItem } from "@/utils/sourcesAdapter";
import { useLanguage } from '@/contexts/LanguageContext';

export default function SourcesEau() {
  const { t } = useLanguage();
  const [sources, setSources] = useState<SourceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        console.log("[page] buildSources:start");
        const list = await buildSources();
        if (!cancelled) {
          console.log("[page] buildSources:done", list.length);
          setSources(list);
        }
      } catch (e: any) {
        console.error("[page] buildSources:error", e);
        if (!cancelled) setError(e?.message ?? "Erreur de chargement des sources");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    if (!sources) return null;
    const byType = { source: 0, minerale: 0, gazeuse: 0 };
    let residueSum = 0;
    let residueCount = 0;
    let withComposition = 0;

    for (const s of sources) {
      if (s.water_category === 'Eau de source') byType.source++;
      else if (s.water_category === 'Eau minérale naturelle gazeuse') byType.gazeuse++;
      else byType.minerale++;

      const r = s.residu_sec_180_mg_L ?? s.residue;
      if (r !== undefined) {
        residueSum += r;
        residueCount++;
      }
      if (s.Ca_mg_L || s.Mg_mg_L || s.Na_mg_L || s.pH) withComposition++;
    }

    return {
      total: sources.length,
      byType,
      withComposition,
      avgResidue: residueCount > 0 ? Math.round(residueSum / residueCount) : null,
    };
  }, [sources]);

  if (error) return <div>{t('waterSources.error')} {error}</div>;
  if (!sources) return <div>{t('waterSources.loading')}</div>;
  if (sources.length === 0) return <div>{t('waterSources.noSources')}</div>;

  return (
    <Layout>
      <SEOHead 
        title={t('waterSources.seoTitle')}
        description={t('waterSources.seoDesc')}
        keywords="sources eau bouteilles, carte sources eau, bouteilles eau France, géolocalisation sources, composition, Evian, Volvic, Vittel, Contrex"
        canonical="/sources-eau"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Les sources des bouteilles vendues en France",
          "description": "Carte interactive des principales sources des bouteilles d'eau vendues en France avec informations détaillées",
          "url": "https://info-eau.fr/sources-eau",
          "mainEntity": {
            "@type": "Dataset",
            "name": "Sources d'eau minérale françaises",
            "description": "Base de données des principales sources d'eau minérale en France"
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: 'Sources d\'eau', href: '/sources-eau', current: true }
          ]} />
        </div>
        
        <section className="py-12 px-4" role="main">
          <div className="container mx-auto">
            {/* En-tête de la page */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Droplets className="w-8 h-8 text-blue-600" />
                <span>{t('waterSources.title')}</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('waterSources.subtitle', { count: String(sources.length) })}
              </p>
            </div>

            {/* Cartes statistiques synthétiques */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <Database className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Sources référencées</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <Droplets className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <div className="flex justify-center gap-2 text-xs mt-1">
                      <span className="text-green-700">{stats.byType.source} source</span>
                      <span className="text-blue-700">{stats.byType.minerale} minérale</span>
                      <span className="text-amber-700">{stats.byType.gazeuse} gazeuse</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Répartition par type</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <FlaskConical className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-2xl font-bold">{stats.withComposition}</p>
                    <p className="text-xs text-muted-foreground">Compositions connues</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                    <p className="text-2xl font-bold">{stats.avgResidue ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Résidu sec moyen (mg/L)</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Carte des sources */}
            <div className="mb-8">
              <WaterSourcesMap sources={sources} />
            </div>

            {/* Section d'information */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t('waterSources.aboutTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">{t('waterSources.springWater')}</h3>
                      <p className="text-sm text-gray-600">{t('waterSources.springWaterDesc')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">{t('waterSources.mineralWater')}</h3>
                      <p className="text-sm text-gray-600">{t('waterSources.mineralWaterDesc')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">{t('waterSources.sparklingWater')}</h3>
                      <p className="text-sm text-gray-600">{t('waterSources.sparklingWaterDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Section éducative */}
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('waterSources.understand')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">{t('waterSources.formation')}</h3>
                      <p className="text-sm text-gray-600 mb-4">{t('waterSources.formationDesc')}</p>
                      
                      <h3 className="font-semibold mb-3">{t('waterSources.protection')}</h3>
                      <p className="text-sm text-gray-600">{t('waterSources.protectionDesc')}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">{t('waterSources.qualityControls')}</h3>
                      <p className="text-sm text-gray-600 mb-4">{t('waterSources.qualityControlsDesc')}</p>
                      
                      <h3 className="font-semibold mb-3">{t('waterSources.preservation')}</h3>
                      <p className="text-sm text-gray-600">{t('waterSources.preservationDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}