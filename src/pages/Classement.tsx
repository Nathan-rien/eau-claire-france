import React, { useState, useMemo } from 'react';
import { Trophy, Star, Info, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Layout from '@/components/Layout';
import { getUniqueBottles } from '@/data/bottleComparisonData';
import { rankBottles, getScoreGrade, BottleRanking } from '@/utils/bottleRanking';
import { useFavorites } from '@/hooks/useFavorites';

const Classement = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [ecoFilter, setEcoFilter] = useState('all');
  const [expandedDetails, setExpandedDetails] = useState<number | null>(null);
  
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  const allBottles = getUniqueBottles();
  
  const filteredAndRankedBottles = useMemo(() => {
    let filtered = allBottles.filter(bottle => {
      const matchesType = typeFilter === 'all' || 
                         (typeFilter === 'plate' && !bottle.type_eau.toLowerCase().includes('gazeuse')) ||
                         (typeFilter === 'gazeuse' && bottle.type_eau.toLowerCase().includes('gazeuse'));
      
      const matchesEco = ecoFilter === 'all' || bottle.ecoscore === ecoFilter;
      
      return matchesType && matchesEco;
    });
    
    return rankBottles(filtered);
  }, [allBottles, typeFilter, ecoFilter]);

  const toggleFavorite = (bottle: BottleRanking) => {
    if (isFavorite(bottle.id)) {
      removeFromFavorites(bottle.id);
    } else {
      addToFavorites(bottle);
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {/* En-tête */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                <span>Classement des eaux en bouteille</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                Découvrez le classement des eaux en bouteille basé sur leurs valeurs nutritionnelles et leur qualité.
              </p>
            </div>

            {/* Explication du score */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Info className="w-5 h-5" />
                  <span>Comment fonctionne le score nutritionnel ?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700">
                <p className="mb-2">
                  Le score nutritionnel (sur 50 points) évalue 5 critères essentiels :
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <span>• Nitrates (10 pts max)</span>
                  <span>• Résidu sec (10 pts max)</span>
                  <span>• Calcium (10 pts max)</span>
                  <span>• Magnésium (10 pts max)</span>
                  <span>• Sodium (10 pts max)</span>
                </div>
              </CardContent>
            </Card>

            {/* Filtres */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtres</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type d'eau</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="plate">Eau plate</SelectItem>
                        <SelectItem value="gazeuse">Eau gazeuse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Éco-score</label>
                    <Select value={ecoFilter} onValueChange={setEcoFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les scores</SelectItem>
                        <SelectItem value="A">A - Excellent</SelectItem>
                        <SelectItem value="B">B - Très bon</SelectItem>
                        <SelectItem value="C">C - Bon</SelectItem>
                        <SelectItem value="D">D - Moyen</SelectItem>
                        <SelectItem value="E">E - Mauvais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classement */}
            <div className="space-y-4">
              {filteredAndRankedBottles.map((bottle, index) => {
                const rank = index + 1;
                const { grade, color, description } = getScoreGrade(bottle.nutritionalScore);
                const isExpanded = expandedDetails === bottle.id;
                
                return (
                  <Card key={bottle.id} className={`transition-all duration-200 hover:shadow-lg ${rank <= 3 ? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-gray-700 min-w-[3rem]">
                            {getRankMedal(rank)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} - ${bottle.nom_bouteille}`}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {bottle.type_eau}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {bottle.format}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  bottle.ecoscore === 'A' ? 'bg-green-100 text-green-800' :
                                  bottle.ecoscore === 'B' ? 'bg-blue-100 text-blue-800' :
                                  bottle.ecoscore === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                  bottle.ecoscore === 'D' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                Éco: {bottle.ecoscore}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${color}`}>
                              {grade}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bottle.nutritionalScore}/50
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(bottle)}
                            className={isFavorite(bottle.id) ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}
                          >
                            <Star className={`w-5 h-5 ${isFavorite(bottle.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-sm ${color} font-medium`}>
                          {description}
                        </p>
                        <span className="text-sm font-medium text-blue-600">
                          {bottle.prix_moyen_litre.toFixed(2)}€/L
                        </span>
                      </div>
                      
                      <Collapsible 
                        open={isExpanded} 
                        onOpenChange={() => setExpandedDetails(isExpanded ? null : bottle.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Masquer les détails
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Voir les détails nutritionnels
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Nitrates:</span>
                              <div>{(bottle.composition || bottle).nitrates} mg/L ({bottle.scoreBreakdown.nitrates}/10 pts)</div>
                            </div>
                            <div>
                              <span className="font-medium">Résidu sec:</span>
                              <div>{(bottle.composition || bottle).residusSec} mg/L ({bottle.scoreBreakdown.residuSec}/10 pts)</div>
                            </div>
                            <div>
                              <span className="font-medium">Calcium:</span>
                              <div>{(bottle.composition || bottle).calcium} mg/L ({bottle.scoreBreakdown.calcium}/10 pts)</div>
                            </div>
                            <div>
                              <span className="font-medium">Magnésium:</span>
                              <div>{(bottle.composition || bottle).magnesium} mg/L ({bottle.scoreBreakdown.magnesium}/10 pts)</div>
                            </div>
                            <div>
                              <span className="font-medium">Sodium:</span>
                              <div>{(bottle.composition || bottle).sodium} mg/L ({bottle.scoreBreakdown.sodium}/10 pts)</div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-xs text-gray-600">
                              <strong>Source:</strong> {bottle.source}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAndRankedBottles.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500">Aucune bouteille trouvée avec ces critères.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Classement;
