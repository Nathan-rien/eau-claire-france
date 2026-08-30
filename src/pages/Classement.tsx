"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, Info, LayoutGrid, Table as TableIcon, Search, Star, X, GitCompare, Check, Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import RankingProfileSelector from '@/components/Ranking/RankingProfileSelector';
import ProfileRecommendationCard from '@/components/Ranking/ProfileRecommendationCard';
import BottleRankingCard from '@/components/Ranking/BottleRankingCard';
import RankingFilters, { DEFAULT_FILTERS, RankingFilterState } from '@/components/Ranking/RankingFilters';
import RankingTableView from '@/components/Ranking/RankingTableView';
import BottleCompareModal from '@/components/Ranking/BottleCompareModal';
import { Profile, scoreBottle, Composition, CRITERION_LABELS, getProfileInfo } from '@/utils/rankingV2';
import { getWaterRegion } from '@/config/waterRegions';
import { useWaterCompositions } from '@/hooks/useWaterCompositions';
import { Skeleton } from '@/components/ui/skeleton';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion } from '@/contexts/RegionContext';
import { Link } from '@/components/LocalizedLink';
import BrandLinksSection from '@/components/BrandLinksSection';
import AffiliateComparisonTable from '@/components/affiliate/AffiliateComparisonTable';
import RegionLinksSection from '@/components/RegionLinksSection';

const FAVORITES_KEY = 'ranking-water-favorites';
const MAX_COMPARE = 5;

function countActiveFilters(f: RankingFilterState): number {
  let n = 0;
  if (!f.showSparkling || !f.showStill) n++;
  if (f.hideExcluded) n++;
  if (f.showMddOnly) n++;
  if (f.origins.length !== 3) n++;
  if (f.region !== 'all') n++;
  if (f.residuRange[0] !== 0 || f.residuRange[1] !== 5000) n++;
  if (f.calciumRange[0] !== 0 || f.calciumRange[1] !== 600) n++;
  if (f.sodiumRange[0] !== 0 || f.sodiumRange[1] !== 2000) n++;
  if (f.nitratesMax !== 50) n++;
  if (f.pHRange[0] !== 5 || f.pHRange[1] !== 9) n++;
  return n;
}

const Classement = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile>("general");
  const [filters, setFilters] = useState<RankingFilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const { waters: allWaters, loading, error } = useWaterCompositions();
  const { isFrance } = useRegion();
  const waters = useMemo(
    () => isFrance ? allWaters.filter(w => w.available_fr) : allWaters,
    [allWaters, isFrance]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // Scroll to results on profile change for clear visual feedback
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [profile]);

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
      if (filters.region !== 'all' && getWaterRegion(w.brand) !== filters.region) return false;

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
    const scored = filtered
      .map(w => {
        const s = scoreBottle(w.composition, profile);
        return { water: w, score: s.total, excluded: s.excluded, name: w.brand };
      })
      .filter(r => !filters.hideExcluded || !r.excluded);

    // Déduplication par marque : garder la meilleure variante par profil
    const bestByBrand = new Map<string, typeof scored[number]>();
    for (const r of scored) {
      const key = r.water.brand.trim().toLowerCase();
      const cur = bestByBrand.get(key);
      if (!cur) { bestByBrand.set(key, r); continue; }
      // Préfère non-exclue, puis score plus haut
      if (cur.excluded && !r.excluded) bestByBrand.set(key, r);
      else if (cur.excluded === r.excluded && r.score > cur.score) bestByBrand.set(key, r);
    }

    return [...bestByBrand.values()].sort((a, b) => {
      if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      return a.water.brand.localeCompare(b.water.brand);
    });
  }, [filtered, profile, filters.hideExcluded]);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const selectedWaters = useMemo(
    () => waters.filter(w => selectedIds.has(w.id)),
    [waters, selectedIds]
  );

  const activeFilterCount = countActiveFilters(filters);
  const criteriaCount = Object.keys(CRITERION_LABELS).length;
  const profileInfo = getProfileInfo(profile);

  const renderCard = (water: typeof ranked[number]['water'], rank: number | undefined, podiumStyle = false) => (
    <div key={water.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => toggleFavorite(water.id)}
          className="p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition"
          aria-label="Favori"
        >
          <Star className={`w-4 h-4 ${favorites.has(water.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={() => toggleSelect(water.id)}
          disabled={!selectedIds.has(water.id) && selectedIds.size >= MAX_COMPARE}
          className={`p-1.5 rounded-full shadow transition ${selectedIds.has(water.id) ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white disabled:opacity-40'}`}
          aria-label="Comparer"
          title={selectedIds.has(water.id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
        >
          {selectedIds.has(water.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      <BottleRankingCard
        name={water.source_name}
        brand={water.brand}
        location={water.location}
        isSparkling={water.is_sparkling}
        compos={water.composition as Composition}
        profile={profile}
        rank={rank}
        podium={podiumStyle}
      />
    </div>
  );

  return (
    <Layout>
      <SEOHead {...seoData.classement} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Compact hero */}
        <section className="py-6 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 flex-wrap">
                <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-600" />
                <span>Classement & comparateur des eaux</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      aria-label="Comment fonctionne le score"
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" /> Comment fonctionne le score ?
                      </DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>Chaque eau est notée sur 80 points selon <strong>{criteriaCount} critères</strong> (minéralisation, nitrates, calcium, sodium, pH, etc.) pondérés en fonction du profil choisi.</p>
                      <p>Le profil <strong>Pureté</strong> valorise les eaux ultra-pures comme Mont Roucous ou Montcalm. Le profil <strong>Os & calcium</strong> valorise au contraire les eaux fortement minéralisées.</p>
                      <p className="text-amber-700 text-xs mt-2">Les eaux marquées « non recommandées » dépassent un seuil critique pour le profil sélectionné.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </h1>
              <p className="text-sm text-gray-600 mt-2 flex items-center justify-center gap-2 flex-wrap">
                <Badge variant="outline" className={isFrance ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-green-300 text-green-700 bg-green-50'}>
                  {isFrance ? 'Marché français' : 'Catalogue Europe'}
                </Badge>
                <span><strong>{waters.length}</strong> eaux comparées · {ranked.length} affichées</span>
              </p>
              {/* Bloc SEO/GEO : texte sémantique riche pour Google + moteurs IA (ChatGPT, Perplexity, Gemini) */}
              <div className="max-w-3xl mx-auto mt-4 text-sm text-gray-700 leading-relaxed">
                <h2 className="sr-only">Comparateur des meilleures eaux minérales en bouteille en France</h2>
                <p>
                  <strong>Comparateur et classement</strong> des principales eaux en bouteille vendues en France :
                  {' '}<em>Evian, Contrex, Hépar, Volvic, Mont Roucous, Badoit, Vittel, Cristaline, Wattwiller, Thonon, Montcalm, Sainte-Sophie, Quézac, Salvetat, Perrier</em> et bien d'autres.
                  Chaque eau est notée sur 80 points selon 11 critères (résidu sec, calcium, magnésium, sodium, nitrates, fluorures, pH…)
                  et 12 profils santé : Général, Pureté, Os & calcium, Sport, Bébé, Senior, Grossesse, Quotidien, Thé, Transit, Digestion, Régime pauvre en sodium.
                  Trouvez en un clic la meilleure eau en bouteille adaptée à <strong>vos besoins</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky profile selector */}
        <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b shadow-sm">
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <RankingProfileSelector value={profile} onChange={setProfile} />
          </div>
        </div>

        <section className="py-6 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Profile description with official recommendations */}
            <ProfileRecommendationCard profile={profile} />


            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une marque, source, région…"
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
                  className={`px-2 py-1.5 rounded text-xs flex items-center gap-1 transition ${viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Cartes
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2 py-1.5 rounded text-xs flex items-center gap-1 transition ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <TableIcon className="w-3.5 h-3.5" /> Tableau
                </button>
              </div>
            </div>

            {/* Filters */}
            <RankingFilters filters={filters} onChange={setFilters} resultCount={ranked.length} activeCount={activeFilterCount} />

            {/* Results */}
            <div ref={resultsRef} className="scroll-mt-24">
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

              {!loading && !error && (
                <>
                  {viewMode === 'cards' ? (
                    <div key={profile}>
                      {podium.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-600" /> Podium
                          </h2>
                          <div className="grid md:grid-cols-3 gap-4">
                            {podium.map((r, i) =>
                              renderCard(r.water, r.excluded ? undefined : i + 1, true)
                            )}
                          </div>
                        </div>
                      )}

                      {rest.length > 0 && (
                        <>
                          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Reste du classement
                          </h2>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rest.map((r, i) =>
                              renderCard(r.water, r.excluded ? undefined : i + 4, false)
                            )}
                          </div>
                        </>
                      )}
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
                      <Button variant="outline" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>
                        Réinitialiser les filtres
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

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
        <section className="container mx-auto px-4 py-12 border-t border-border">
          <AffiliateComparisonTable
            category="filtration"
            title="Filtrer plutôt que comparer les eaux en bouteille ?"
            intro="Si votre objectif est de réduire le chlore, le calcaire ou certains contaminants, la filtration à domicile peut remplacer l'achat de bouteilles. Voici ce que chaque solution traite réellement."
          />
          <Link
            to="/comparatif-filtres-eau"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
          >
            Comparatif complet des filtres à eau
          </Link>

          <aside className="rounded-xl border border-blue-200 bg-blue-50 p-5 mt-8">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">{t('ranking.treat.title')}</p>
                <p className="text-sm text-blue-900/90 mb-2">{t('ranking.treat.description')}</p>
                <Link
                  to="/traiter-eau-robinet"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                >
                  {t('ranking.treat.cta')}
                </Link>
              </div>
            </div>
          </aside>
        </section>
        <div className="container mx-auto px-4">
          <BrandLinksSection />
          <RegionLinksSection />
        </div>

      </div>
    </Layout>
  );
};

export default Classement;
