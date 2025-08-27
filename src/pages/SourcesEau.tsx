import React, { useState } from 'react';
import { Droplets, MapPin, Info } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBottleData } from "@/hooks/useBottleData";
import { buildSources } from "@/utils/sourcesAdapter";

export default function SourcesEau() {
  const { composition, catalog, loading, error } = useBottleData();
  const [pageSize, setPageSize] = useState<number | "all">("all");

  if (loading) return <div style={{padding:16}}>Chargement…</div>;
  if (error)   return <div style={{padding:16}}>❌ {error}</div>;

  const sources = buildSources(composition ?? [], catalog ?? []);
  const visible = pageSize === "all" ? sources : sources.slice(0, pageSize);

  return (
    <Layout>
      <SEOHead 
        title="Sources d'Eau Minérale en France - Carte Interactive | InfoEau"
        description="Explorez les principales sources des bouteilles d'eau vendues en France. Découvrez leur localisation, leur composition et les marques associées."
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
                <span>Sources d'eau en France</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {sources.length} captages trouvés — données agrégées depuis vos CSV (composition + catalogue).
              </p>
            </div>

            {/* Section d'information */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    À propos des sources d'eau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">Eau de source</h3>
                      <p className="text-sm text-gray-600">
                        Eau d'origine souterraine, microbiologiquement saine et protégée contre la pollution. 
                        Sa composition peut varier selon la source.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Eau minérale naturelle</h3>
                      <p className="text-sm text-gray-600">
                        Eau souterraine avec une composition minérale constante et des propriétés favorables à la santé. 
                        Chaque source a sa propre signature minérale.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">Eau minérale gazeuse</h3>
                      <p className="text-sm text-gray-600">
                        Eau minérale naturellement gazéifiée ou enrichie en gaz carbonique. 
                        Le CO₂ peut être d'origine naturelle ou ajouté.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contrôles de pagination */}
            <div className="mb-6 flex items-center gap-4">
              <label htmlFor="pageSize" className="text-sm font-medium">Affichage :</label>
              <select 
                id="pageSize"
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                value={pageSize} 
                onChange={e => setPageSize(e.target.value === "all" ? "all" : Number(e.target.value))}
              >
                <option value="all">Tout ({sources.length})</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>

            {/* Liste des sources */}
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map(src => (
                <li key={src.source_id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-semibold text-gray-900 mb-1">{src.source_name}</div>
                  {src.location && <div className="text-sm text-gray-600 mb-2">{src.location}</div>}
                  <div className="text-sm text-gray-700 mb-3">
                    {src.count_brands} marque{src.count_brands > 1 ? "s" : ""}
                    {src.is_sparkling_mix ? " · inclut des gazeuses" : ""}
                  </div>
                  {src.brands.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {src.brands.slice(0, 6).join(" · ")}
                      {src.brands.length > 6 ? " · …" : ""}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Section éducative */}
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Comprendre les sources d'eau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Formation des sources</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Les sources d'eau minérale se forment lorsque l'eau de pluie s'infiltre dans le sol 
                        et traverse différentes couches géologiques. Ce voyage peut durer plusieurs années 
                        à plusieurs décennies, permettant à l'eau de se charger en minéraux.
                      </p>
                      
                      <h3 className="font-semibold mb-3">Protection naturelle</h3>
                      <p className="text-sm text-gray-600">
                        Les sources sont naturellement protégées par des couches imperméables qui empêchent 
                        les contaminants de surface d'atteindre l'eau. Cette protection géologique garantit 
                        la pureté de l'eau extraite.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Contrôles qualité</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Chaque source fait l'objet de contrôles rigoureux et réguliers. Les eaux minérales 
                        naturelles bénéficient d'une reconnaissance officielle après étude hydrogéologique 
                        et validation de leurs propriétés.
                      </p>
                      
                      <h3 className="font-semibold mb-3">Préservation environnementale</h3>
                      <p className="text-sm text-gray-600">
                        Les zones de captage sont protégées par des périmètres de sécurité. Les exploitants 
                        mettent en place des programmes de préservation de l'environnement pour maintenir 
                        la qualité des sources à long terme.
                      </p>
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