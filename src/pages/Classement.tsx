"use client";
import React, { useState, useMemo } from 'react';
import { Trophy, Info, Filter, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import RankingProfileSelector from '@/components/Ranking/RankingProfileSelector';
import BottleRankingCard from '@/components/Ranking/BottleRankingCard';
import { Profile, scoreBottle, Composition, CRITERION_LABELS } from '@/utils/rankingV2';
import { useWaterCompositions } from '@/hooks/useWaterCompositions';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const Classement = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile>("daily");
  const [showSparkling, setShowSparkling] = useState(true);
  const [showStill, setShowStill] = useState(true);
  const [hideExcluded, setHideExcluded] = useState(false);

  const { waters, loading, error } = useWaterCompositions();

  const ranked = useMemo(() => {
    return waters
      .filter(water => {
        if (!showSparkling && water.is_sparkling) return false;
        if (!showStill && !water.is_sparkling) return false;
        return true;
      })
      .map(water => {
        const scored = scoreBottle(water.composition, profile);
        return {
          id: water.brand + '-' + water.source_name,
          name: water.source_name,
          brand: water.brand,
          location: water.location,
          isSparkling: water.is_sparkling,
          compos: water.composition,
          score: scored.total,
          excluded: scored.excluded,
        };
      })
      .filter(w => !hideExcluded || !w.excluded)
      .sort((a, b) => {
        // Excluded waters go to the bottom
        if (a.excluded && !b.excluded) return 1;
        if (!a.excluded && b.excluded) return -1;
        return b.score - a.score;
      });
  }, [waters, profile, showSparkling, showStill, hideExcluded]);

  const criteriaCount = Object.keys(CRITERION_LABELS).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            {/* En-tête */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                <span>{t('ranking.title')}</span>
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                {t('ranking.description', { count: String(waters.length), criteria: String(criteriaCount) })}
              </p>
            </div>

            {/* Explication du score */}
            <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
                  <Info className="w-5 h-5" />
                  <span>{t('ranking.scoreTitle')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 text-sm">
                <p className="mb-3">
                  {t('ranking.scoreDescription')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(CRITERION_LABELS).map(([key, { label }]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-white/70 rounded-lg border border-blue-200 text-xs">
                  {t('ranking.excludedNote')}
                </div>
              </CardContent>
            </Card>

            {/* Profile selector */}
            <RankingProfileSelector value={profile} onChange={setProfile} />

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 p-3 bg-white rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">{t('ranking.filters')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="still" checked={showStill} onCheckedChange={setShowStill} />
                <Label htmlFor="still" className="text-sm cursor-pointer">{t('ranking.still')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="sparkling" checked={showSparkling} onCheckedChange={setShowSparkling} />
                <Label htmlFor="sparkling" className="text-sm cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t('ranking.sparkling')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="excluded" checked={hideExcluded} onCheckedChange={setHideExcluded} />
                <Label htmlFor="excluded" className="text-sm cursor-pointer">{t('ranking.hideExcluded')}</Label>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 bg-white shadow-sm">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-2 w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
              </div>
            )}

            {/* Results count */}
            {!loading && !error && (
              <p className="text-sm text-gray-500 mb-4">
                {ranked.length} eau{ranked.length > 1 ? 'x' : ''} affichée{ranked.length > 1 ? 's' : ''}
              </p>
            )}

            {/* Classement */}
            {!loading && !error && (
              <div className="grid sm:grid-cols-2 gap-4">
                {ranked.map((b, index) => (
                  <BottleRankingCard
                    key={b.id}
                    name={b.name}
                    brand={b.brand}
                    location={b.location}
                    isSparkling={b.isSparkling}
                    compos={b.compos as Composition}
                    profile={profile}
                    rank={!b.excluded ? index + 1 : undefined}
                  />
                ))}
              </div>
            )}

            {!loading && !error && ranked.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500">Aucune eau ne correspond aux critères sélectionnés.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Classement;
