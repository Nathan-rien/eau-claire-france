"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Info, Sparkles, LayoutGrid, Table as TableIcon, Search, Star, X, GitCompare, Check, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import RankingProfileSelector from '@/components/Ranking/RankingProfileSelector';
import BottleRankingCard from '@/components/Ranking/BottleRankingCard';
import RankingFilters, { DEFAULT_FILTERS, RankingFilterState } from '@/components/Ranking/RankingFilters';
import RankingTableView from '@/components/Ranking/RankingTableView';
import BottleCompareModal from '@/components/Ranking/BottleCompareModal';
import { Profile, scoreBottle, Composition, CRITERION_LABELS } from '@/utils/rankingV2';
import { useWaterCompositions, WaterSource } from '@/hooks/useWaterCompositions';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { seoData } from '@/utils/seoData';

const FAVORITES_KEY = 'ranking-water-favorites';
const MAX_COMPARE = 5;

const Classement = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile>("purity");
  const [filters, setFilters] = useState<RankingFilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const { waters, loading, error } = useWaterCompositions();

  // Load favorites
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COMPARE) next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return waters.filter(w => {
      if (!filters.showSparkling && w.is_sparkling) return false;
      if (!filters.showStill && !w.is_sparkling) return false;
      if (filters.showMddOnly && !w.is_mdd) return false;
      if (!filters.origins.includes(w.origin)) return false;

      const c = w.composition;
      const res = c.residu_sec_180_mg_L;
      if (res != null && (res < filters.residuRange[0] || res > filters.residuRange[1])) return false;
      const ca = c.Ca_mg_L;
      if (ca != null && (ca < filters.calciumRange[0] || ca > filters.calciumRange[1])) return false;
      const na = c.Na_mg_L;
      if (na != null && (na < filters.sodiumRange[0] || na > filters.sodiumRange[1])) return false;
      const no3 = c.NO3_mg_L;
      if (no3 != null && no3 > filters.nitratesMax) return false;
      const pH = c.pH;
      if (pH != null && (pH < filters.pHRange[0] || pH > filters.pHRange[1])) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        if (!w.brand.toLowerCase().includes(q) &&
            !w.source_name.toLowerCase().includes(q) &&
            !w.location.toLowerCase().includes(q)) return false;
      }

      if (showFavoritesOnly && !favorites.has(w.id)) return false;

      return true;
    });
  }, [waters, filters, search, showFavoritesOnly, favorites]);

  const ranked = useMemo(() => {
    return filtered
      .map(w => {
        const scored = scoreBottle(w.composition, profile);
        return { water: w, score: scored.total, excluded: scored.excluded };
      })
      .filter(r => !filters.hideExcluded || !r.excluded)
      .sort((a, b) => {
        if (a.excluded && !b.excluded) return 1;
        if (!a.excluded && b.excluded) return -1;
        return b.score - a.score;
      });
  }, [filtered, profile, filters.hideExcluded]);

  const selectedWaters = useMemo(
    () => waters.filter(w => selectedIds.has(w.id)),
    [waters, selectedIds]
  );

  const criteriaCount = Object.keys(CRITERION_LABELS).length;

  return (
    <Layout>
      <SEOHead {...seoData.classement} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* En-tête */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                <span>Classement & comparateur des eaux</span>
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                {waters.length} eaux comparées sur {criteriaCount} critères. Sélectionnez votre profil et comparez côte-à-côte.
              </p>
            </div>

            {/* Explication score */}
            <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
                  <Info className="w-5 h-5" />
                  <span>Comment fonctionne le score ?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 text-sm">
                <p className="mb-2">
                  Chaque eau est notée sur 80 points selon 11 critères pondérés en fonction du profil choisi.
                  Le profil <strong>💎 Pureté</strong> valorise les eaux ultra-pures comme Mont Roucous.
                </p>
                <div className="text-xs text-blue-600">
                  ⚠️ Les eaux marquées "non recommandées" dépassent un seuil critique pour le profil sélectionné.
                </div>
              </CardContent>
            </Card>

            {/* Profile selector */}
            <RankingProfileSelector value={profile} onChange={setProfile} />

            {/* Search + view toggle + favorites */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une marque, source, région..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star className={`w-4 h-4 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favoris ({favorites.size})
              </Button>
              <div className="flex gap-1 bg-white border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Cartes
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <TableIcon className="w-3.5 h-3.5" /> Tableau
                </button>
              </div>
            </div>

            {/* Filters */}
            <RankingFilters filters={filters} onChange={setFilters} resultCount={ranked.length} />

            {/* Loading */}
            {loading && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 bg-white shadow-sm">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-2 w-full mb-2" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500"><p>{error}</p></div>
            )}

            {/* Results */}
            {!loading && !error && (
              <>
                {viewMode === 'cards' ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ranked.map((r, index) => (
                      <div key={r.water.id} className="relative">
                        {/* Selection / favorite controls */}
                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                          <button
                            onClick={() => toggleFavorite(r.water.id)}
                            className="p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition"
                            aria-label="Favori"
                          >
                            <Star className={`w-4 h-4 ${favorites.has(r.water.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={() => toggleSelect(r.water.id)}
                            disabled={!selectedIds.has(r.water.id) && selectedIds.size >= MAX_COMPARE}
                            className={`p-1.5 rounded-full shadow transition ${selectedIds.has(r.water.id) ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white disabled:opacity-40'}`}
                            aria-label="Comparer"
                            title={selectedIds.has(r.water.id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
                          >
                            {selectedIds.has(r.water.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                        <BottleRankingCard
                          name={r.water.source_name}
                          brand={r.water.brand}
                          location={r.water.location}
                          isSparkling={r.water.is_sparkling}
                          compos={r.water.composition as Composition}
                          profile={profile}
                          rank={!r.excluded ? index + 1 : undefined}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <RankingTableView
                    waters={ranked.map(r => r.water)}
                    profile={profile}
                    favorites={favorites}
                    selectedIds={selectedIds}
                    onToggleFavorite={toggleFavorite}
                    onToggleSelect={toggleSelect}
                  />
                )}

                {ranked.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-500">Aucune eau ne correspond à vos filtres</p>
                  </div>
                )}
              </>
            )}

            {/* Sticky compare bar */}
            {selectedIds.size > 0 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white border-2 border-blue-500 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 max-w-[95vw]">
                <Badge variant="default" className="bg-blue-600">
                  {selectedIds.size}/{MAX_COMPARE}
                </Badge>
                <span className="text-sm font-medium hidden sm:inline">eaux sélectionnées</span>
                <Button size="sm" onClick={() => setCompareOpen(true)} disabled={selectedIds.size < 2}>
                  <GitCompare className="w-4 h-4 mr-1" /> Comparer
                </Button>
                <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-gray-600" aria-label="Vider">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <BottleCompareModal
              open={compareOpen}
              onClose={() => setCompareOpen(false)}
              waters={selectedWaters}
              profile={profile}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Classement;
