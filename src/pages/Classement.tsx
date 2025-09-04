
"use client";
import React, { useState, useMemo } from 'react';
import { Trophy, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import RankingProfileSelector from '@/components/Ranking/RankingProfileSelector';
import BottleRankingCard from '@/components/Ranking/BottleRankingCard';
import { Profile, scoreBottle, Composition } from '@/utils/rankingV2';
import { bottledWaters } from '@/data/bottleWaterData';

const Classement = () => {
  const [profile, setProfile] = useState<Profile>("daily");

  const ranked = useMemo(() => {
    return bottledWaters
      .map(water => {
        const compos: Composition = {
          NO3_mg_L: water.composition.nitrates,
          residu_sec_180_mg_L: water.composition.residusSec,
          Ca_mg_L: water.composition.calcium,
          Mg_mg_L: water.composition.magnesium,
          Na_mg_L: water.composition.sodium
        };
        return {
          id: water.id,
          name: water.name,
          brand: water.producer,
          pricePerL: water.price,
          compos,
          score: scoreBottle(compos, profile).total
        };
      })
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
            <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Info className="w-5 h-5" />
                  <span>Comment fonctionne notre notation ?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <p className="mb-4 text-base">
                  Notre score (sur 50 points) évalue chaque eau selon des <b>critères adaptés à votre usage</b> :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span><b>Nitrates</b> : Plus c'est bas, mieux c'est</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><b>Résidu sec</b> : Ni trop faible, ni trop élevé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span><b>Calcium</b> : Équilibre selon vos besoins</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span><b>Magnésium</b> : Adapté à votre profil</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span><b>Sodium</b> : Faible sauf pour le sport</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm italic">
                    💡 <b>Exemple :</b> Contrex est excellente pour le sport (calcium et magnésium élevés) 
                    mais moins adaptée au quotidien (résidu sec très élevé).
                  </p>
                </div>
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
