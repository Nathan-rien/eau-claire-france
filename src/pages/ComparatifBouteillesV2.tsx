
import React from 'react';
import { TrendingUp, Star, Scale } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { useBottleComparisonUrl } from '@/hooks/useBottleComparisonUrl';
import Layout from '@/components/Layout';
import BottleSelectorV2 from '@/components/BottleSelectorV2';
import BottleComparisonTable from '@/components/BottleComparisonTable';
import NutritionalGuide from '@/components/NutritionalGuide';
import ComparisonControls from '@/components/ComparisonControls';
import FavoritesTab from '@/components/FavoritesTab';
import { BottleWaterData } from '@/data/bottleComparisonData';
import { convertBottleWaterDataToWaterData } from '@/utils/bottleConversion';

const ComparatifBouteillesV2 = () => {
  const { selectedBottles, setSelectedBottles, showTapWater, setShowTapWater } = useBottleComparisonUrl();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleBottleAdd = (bottle: BottleWaterData) => {
    if (selectedBottles.length >= 3) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez comparer que 3 bouteilles maximum.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedBottles(prev => [...prev, bottle]);
  };

  const handleBottleRemove = (bottleId: number) => {
    setSelectedBottles(prev => prev.filter(b => b.id !== bottleId));
  };

  const handleReset = () => {
    setSelectedBottles([]);
    setShowTapWater(false);
  };

  const handleToggleFavorite = (bottle: BottleWaterData) => {
    const bottleId = bottle.id.toString();
    if (isFavorite(bottleId)) {
      removeFromFavorites(bottleId);
    } else {
      const waterData = convertBottleWaterDataToWaterData(bottle);
      addToFavorites(waterData);
    }
  };

  const isBottleFavorite = (bottleId: number) => {
    return isFavorite(bottleId.toString());
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-8 lg:py-12 px-4">
          <div className="container mx-auto">
            {/* Header */}
            <div className="text-center mb-6 lg:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>Comparatif des eaux en bouteille</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                Comparez jusqu'à 3 eaux en bouteille selon leurs caractéristiques : prix, composition minérale, 
                impact environnemental et plus encore.
              </p>
            </div>

            {/* Desktop Layout: 2 columns - Mobile: stacked */}
            <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:items-start">
              
              {/* Left Column - Nutritional Guide (Desktop sticky) */}
              <div className="lg:col-span-2 mb-6 lg:mb-0">
                <div className="lg:sticky lg:top-6">
                  <NutritionalGuide />
                </div>
              </div>

              {/* Right Column - Main Content */}
              <div className="lg:col-span-3">
                {/* Enhanced Tabs */}
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
                    <TabsTrigger 
                      value="comparison" 
                      className="flex items-center space-x-2 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Comparaison</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="favorites" 
                      className="flex items-center space-x-2 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <Star className="w-4 h-4" />
                      <span>Favoris ({favorites.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="comparison" className="space-y-4">
                    {/* Controls */}
                    <ComparisonControls
                      showTapWater={showTapWater}
                      setShowTapWater={setShowTapWater}
                      selectedBottlesCount={selectedBottles.length}
                      onReset={handleReset}
                    />

                    {/* Bottle Selector - Version optimisée */}
                    <BottleSelectorV2
                      selectedBottles={selectedBottles}
                      onBottleAdd={handleBottleAdd}
                      onBottleRemove={handleBottleRemove}
                    />

                    {/* Comparison Table */}
                    <BottleComparisonTable
                      selectedBottles={selectedBottles}
                      showTapWater={showTapWater}
                      onToggleFavorite={handleToggleFavorite}
                      onRemoveFavorite={(bottleId) => removeFromFavorites(bottleId.toString())}
                      isFavorite={isBottleFavorite}
                    />
                  </TabsContent>

                  <TabsContent value="favorites">
                    <FavoritesTab
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      onRemoveFavorite={(bottleId) => removeFromFavorites(bottleId.toString())}
                      isFavorite={isBottleFavorite}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparatifBouteillesV2;
