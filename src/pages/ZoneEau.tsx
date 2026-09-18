import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, MapPin, Plus, Droplets } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { MapLoader } from '@/components/ui/map-loader';
import LazyWaterPointsMap from '@/components/waterPoints/LazyWaterPointsMap';
import WaterPointForm from '@/components/waterPoints/WaterPointForm';
import { supabase } from '@/integrations/supabase/client';
import {
  WaterPoint,
  WaterPointType,
  WATER_POINT_TYPES,
  WATER_POINT_TYPE_META,
  signWaterPointPhotos,
} from '@/data/waterPoints';

const ZoneEau: React.FC = () => {
  const [points, setPoints] = useState<WaterPoint[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [activeTypes, setActiveTypes] = useState<WaterPointType[]>([
    ...WATER_POINT_TYPES,
  ]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from('water_points')
      .select('*')
      .eq('statut_moderation', 'valide')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('Water points load error:', error);
      setLoading(false);
      return;
    }
    const list = (data || []) as WaterPoint[];
    setPoints(list);
    setPhotoUrls(await signWaterPointPhotos(list));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleType = (tp: WaterPointType) => {
    setActiveTypes((prev) =>
      prev.includes(tp) ? prev.filter((t) => t !== tp) : [...prev, tp]
    );
  };

  const filtered = useMemo(
    () => points.filter((p) => activeTypes.includes(p.type)),
    [points, activeTypes]
  );

  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    points.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return counts;
  }, [points]);

  return (
    <Layout>
      <SEOHead
        title="Zone d'Eau — carte communautaire des points d'eau | InfoEau"
        description="Carte collaborative des fontaines publiques, sources et points de recharge signalés par les visiteurs d'InfoEau."
        noindex
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-6 md:py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                <Droplets className="w-7 h-7 md:w-9 md:h-9 text-blue-600" />
                <span>Zone d&apos;Eau</span>
              </h1>
              <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
                La carte communautaire des points d&apos;eau : fontaines
                publiques, sources et points de recharge, signalés par les
                visiteurs et modérés avant publication.
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 flex gap-3 max-w-4xl mx-auto">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                <span className="font-semibold">
                  Informations communautaires, non vérifiées officiellement.
                </span>{' '}
                La potabilité affichée est déclarative et n&apos;a aucune valeur
                sanitaire. En cas de doute, ne consommez pas l&apos;eau.
              </p>
            </div>

            {/* Filtres + action */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {WATER_POINT_TYPES.map((tp) => {
                  const meta = WATER_POINT_TYPE_META[tp];
                  const active = activeTypes.includes(tp);
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => toggleType(tp)}
                      aria-pressed={active}
                      className={`min-h-[44px] px-3 py-2 rounded-full text-xs font-medium border transition ${
                        active
                          ? 'text-white border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                      style={
                        active
                          ? { background: meta.color, borderColor: meta.color }
                          : {}
                      }
                    >
                      {meta.short}
                      {countByType[tp] ? ` (${countByType[tp]})` : ''}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => setShowForm((v) => !v)}
                className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Signaler un point d&apos;eau
              </Button>
            </div>

            {showForm && (
              <div className="mb-8 max-w-3xl mx-auto">
                <WaterPointForm onSubmitted={load} />
              </div>
            )}

            <div className="mb-6">
              <MapLoader>
                <LazyWaterPointsMap points={filtered} photoUrls={photoUrls} />
              </MapLoader>
            </div>

            <p className="text-xs text-gray-500 text-center mb-2">
              Données enrichies par les contributeurs{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline hover:text-blue-600"
              >
                OpenStreetMap
              </a>
              , sous licence ODbL.
            </p>

            <p className="text-sm text-gray-600 flex items-center gap-2 justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
              {loading
                ? 'Chargement des points d\u2019eau…'
                : `${filtered.length} point${
                    filtered.length > 1 ? 's' : ''
                  } d\u2019eau affiché${filtered.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ZoneEau;
