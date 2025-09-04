
"use client";
import React, { useState, useMemo } from 'react';
import { Trophy, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import RankingProfileSelector from '@/components/Ranking/RankingProfileSelector';
import BottleRankingCard from '@/components/Ranking/BottleRankingCard';
import { Profile, scoreBottle, Composition } from '@/utils/rankingV2';
import { BOTTLES } from '@/data/bottles.composition.mock';

const Classement = () => {
  const [profile, setProfile] = useState<Profile>("daily");

  const ranked = useMemo(() => {
    return BOTTLES
      .map(b => ({ ...b, score: scoreBottle(b.compos, profile).total }))
      .sort((a,b) => b.score - a.score);
  }, [profile]);


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
                Classement basé sur 5 critères (nitrates, résidu sec, calcium, magnésium, sodium) avec des fenêtres optimales par <b>profil d'usage</b>.
              </p>
            </div>

            {/* Explication du score v2 */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Info className="w-5 h-5" />
                  <span>Moteur de score v2 : fenêtres optimales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700">
                <p className="mb-2">
                  Le nouveau score (sur 50 points) utilise des <b>fenêtres optimales</b> et pénalise les extrêmes :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <span>• Nitrates : "plus bas = mieux"</span>
                  <span>• Résidu sec : fenêtre optimale selon profil</span>
                  <span>• Calcium : ni trop bas, ni trop haut</span>
                  <span>• Magnésium : équilibre selon usage</span>
                  <span>• Sodium : faible en général, toléré en sport</span>
                </div>
                <p className="mt-2 text-xs">
                  <b>Contrex</b> : excellente en Sport (Ca/Mg élevés), pénalisée au Quotidien (résidu sec très élevé).
                </p>
              </CardContent>
            </Card>

            <RankingProfileSelector value={profile} onChange={setProfile} />

            {/* Classement v2 */}
            <div className="grid sm:grid-cols-2 gap-4">
              {ranked.map((b, index) => (
                <div key={b.id} className={index < 3 ? "border-2 border-yellow-300 rounded-xl" : ""}>
                  <BottleRankingCard
                    name={b.name}
                    brand={b.brand}
                    pricePerL={b.pricePerL}
                    compos={b.compos as Composition}
                    profile={profile}
                  />
                </div>
              ))}
            </div>

            {ranked.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500">Aucune bouteille disponible.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Classement;
