import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { SourceItem } from '@/utils/sourcesAdapter';
import { Droplets, MapPin, ShieldCheck, Baby, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

// === Indicateurs dérivés ===

const getMineralizationLevel = (residue?: number) => {
  if (residue === undefined) return null;
  if (residue < 50) return { label: 'Très faiblement minéralisée', color: 'bg-sky-100 text-sky-800 border-sky-200' };
  if (residue < 500) return { label: 'Faiblement minéralisée', color: 'bg-green-100 text-green-800 border-green-200' };
  if (residue < 1500) return { label: 'Moyennement minéralisée', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  return { label: 'Fortement minéralisée', color: 'bg-red-100 text-red-800 border-red-200' };
};

const computeHardness = (ca?: number, mg?: number): number | null => {
  if (ca === undefined && mg === undefined) return null;
  return ((ca ?? 0) / 40.08 + (mg ?? 0) / 24.31) * 5.0;
};

const getHardnessLabel = (th: number): string => {
  if (th < 5) return 'Très douce';
  if (th < 15) return 'Douce';
  if (th < 25) return 'Moyennement dure';
  if (th < 35) return 'Dure';
  return 'Très dure';
};

const getUsageRecommendations = (s: SourceItem): { label: string; icon: React.ReactNode; color: string }[] => {
  const recs: { label: string; icon: React.ReactNode; color: string }[] = [];
  const residue = s.residu_sec_180_mg_L ?? s.residue;
  const no3 = s.NO3_mg_L;
  const f = s.F_mg_L;
  const na = s.Na_mg_L;
  const ca = s.Ca_mg_L;
  const mg = s.Mg_mg_L;
  const hco3 = s.HCO3_mg_L;

  if (residue !== undefined && residue < 500 && (no3 === undefined || no3 < 10) && (f === undefined || f < 0.5)) {
    recs.push({ label: 'Convient aux nourrissons', icon: <Baby className="h-3 w-3" />, color: 'bg-pink-100 text-pink-800' });
  }
  if (na !== undefined && na < 20) {
    recs.push({ label: 'Pauvre en sodium', icon: <Sparkles className="h-3 w-3" />, color: 'bg-teal-100 text-teal-800' });
  }
  if (ca !== undefined && ca > 150) {
    recs.push({ label: 'Riche en calcium', icon: <Sparkles className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800' });
  }
  if (mg !== undefined && mg > 50) {
    recs.push({ label: 'Riche en magnésium', icon: <Sparkles className="h-3 w-3" />, color: 'bg-indigo-100 text-indigo-800' });
  }
  if (hco3 !== undefined && hco3 > 600) {
    recs.push({ label: 'Riche en bicarbonates', icon: <Sparkles className="h-3 w-3" />, color: 'bg-violet-100 text-violet-800' });
  }
  return recs;
};

type ComplianceItem = { param: string; value: number; limit: number; unit: string; ok: boolean };

const getComplianceChecks = (s: SourceItem): ComplianceItem[] => {
  const checks: ComplianceItem[] = [];
  if (s.NO3_mg_L !== undefined) checks.push({ param: 'Nitrates', value: s.NO3_mg_L, limit: 50, unit: 'mg/L', ok: s.NO3_mg_L <= 50 });
  if (s.F_mg_L !== undefined) checks.push({ param: 'Fluor', value: s.F_mg_L, limit: 1.5, unit: 'mg/L', ok: s.F_mg_L <= 1.5 });
  if (s.Na_mg_L !== undefined) checks.push({ param: 'Sodium', value: s.Na_mg_L, limit: 200, unit: 'mg/L', ok: s.Na_mg_L <= 200 });
  return checks;
};

interface WaterSourcesMapProps {
  sources: SourceItem[];
}

const WaterSourcesMap: React.FC<WaterSourcesMapProps> = ({ sources }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);

  console.log('🗺️ WaterSourcesMap received:', sources.length, 'sources');


  // Fonction pour obtenir les coordonnées d'une source (maintenant intégrées)
  const getCoordinatesForSource = (source: SourceItem): [number, number] | null => {
    if (typeof source.latitude === 'number' && typeof source.longitude === 'number') {
      return [source.longitude, source.latitude]; // [longitude, latitude] pour Mapbox
    }
    return null;
  };

  // Fonction pour déterminer le type d'eau selon la nouvelle logique
  const getWaterType = (source: SourceItem): string => {
    console.log(`🔍 Analyzing source: ${source.source_name}, water_category: ${source.water_category}`);
    
    // 1. Priorité à la catégorie depuis le CSV coordonnées
    if (source.water_category === 'Eau de source') {
      return 'Eau de source';
    }
    
    // 2. Eau gazeuse (détection par catégorie)
    if (source.water_category === 'Eau minérale naturelle gazeuse') {
      console.log(`✨ Found sparkling water: ${source.source_name}`);
      return 'Eau minérale naturelle gazeuse';
    }
    
    // 3. Détection eau gazeuse par nom/marques (fallback pour les cas manqués)
    const isSparklingWater = source.source_name.toLowerCase().includes('gazeuse') ||
                            source.source_name.toLowerCase().includes('pétillante') ||
                            source.brands.some(brand => 
                              ['perrier', 'badoit', 'salvetat', 'quézac', 'verniere', 'abatilles'].some(keyword =>
                                brand.toLowerCase().includes(keyword)
                              )
                            );
    
    if (isSparklingWater) {
      console.log(`✨ Found sparkling water by name/brand: ${source.source_name}`);
      return 'Eau minérale naturelle gazeuse';
    }
    
    // 4. Détection eau de source par nom/marques (fallback)
    const isSpringWater = source.source_name.toLowerCase().includes('source') ||
                         source.brands.some(brand => 
                           ['cristaline', 'carrefour', 'marque repère', 'eco+', 'saskia', 'rocheval', 
                            'ondine', 'monoprix', 'auchan', 'casino', 'top budget'].some(keyword =>
                             brand.toLowerCase().includes(keyword)
                           )
                         );
    
    if (isSpringWater) {
      return 'Eau de source';
    }
    
    // 5. Par défaut : eau minérale naturelle
    return 'Eau minérale naturelle';
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current) return;

    MapboxSecurityService.configureMapbox(mapboxgl);
    
    map.current = new mapboxgl.Map({
      ...MapboxSecurityService.createSecureMapOptions(mapContainer.current),
      center: [2.2137, 46.2276], // Centre de la France
      zoom: 5.5
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addSourcesLayer();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Mise à jour de la carte quand les données changent
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && sources.length > 0) {
      if (map.current.getSource('water-sources')) {
        updateSourcesOnMap();
      } else {
        addSourcesLayer();
      }
    }
  }, [sources]);

  const addSourcesLayer = () => {
    if (!map.current) return;

    console.log('📍 Ajout des sources sur la carte...');
    
    // Créer les features avec validation des coordonnées
    const features = sources
      .map(source => {
        const coords = getCoordinatesForSource(source);
        
        if (!coords) {
          console.warn(`❌ Pas de coordonnées pour: ${source.source_name}`);
          return null; // Ignorer les sources sans coordonnées
        }

        // Déterminer le type d'eau avec la nouvelle logique
        const waterType = getWaterType(source);
        console.log(`🧪 Source: ${source.source_name}, Category: ${source.water_category}, Type: ${waterType}`);
        
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: coords
          },
          properties: {
            id: source.source_id,
            name: source.source_name,
            type: waterType,
            brands: source.brands.join(', '),
            location: source.location || 'Non spécifiée',
            count_brands: source.count_brands,
            displayName: source.brands.length > 0 ? `${source.brands[0]}` : source.source_name,
            flow_rate: source.flow_rate ?? null,
            depth: source.depth ?? null,
            temperature: source.temperature ?? null,
            residue: source.residue ?? null,
            water_category: source.water_category || null,
          }
        };
      })
      .filter(feature => feature !== null); // Enlever les features nulles

    console.log(`✅ ${features.length} sources ajoutées sur ${sources.length} sources total`);

    // Ajouter la source de données
    map.current.addSource('water-sources', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    });

    // Couche des cercles
    map.current.addLayer({
      id: 'sources-circles',
      type: 'circle',
      source: 'water-sources',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4, 8,
          8, 15,
          12, 25
        ],
        'circle-color': [
          'match',
          ['get', 'type'],
          'Eau de source', '#22c55e',
          'Eau minérale naturelle', '#3b82f6',
          'Eau minérale naturelle gazeuse', '#f59e0b',
          '#6b7280'
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9,
        'circle-stroke-opacity': 1
      }
    });

    // Couche des labels
    map.current.addLayer({
      id: 'sources-labels',
      type: 'symbol',
      source: 'water-sources',
      layout: {
        'text-field': ['get', 'displayName'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 2.5],
        'text-anchor': 'top',
        'text-allow-overlap': false,
        'text-optional': true
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
        'text-halo-blur': 1
      }
    });

    // Événements de clic
    map.current.on('click', 'sources-circles', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const sourceId = feature.properties?.id;
        const source = sources.find(s => s.source_id === sourceId);
        
        if (source) {
          setSelectedSource(source);
          
          const coords = getCoordinatesForSource(source);
          if (coords) {
            map.current?.flyTo({
              center: coords,
              zoom: 10,
              duration: 2000
            });
          }
        }
      }
    });

    // Changement de curseur au survol
    map.current.on('mouseenter', 'sources-circles', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'sources-circles', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });
  };

  const updateSourcesOnMap = () => {
    if (!map.current || !map.current.getSource('water-sources')) return;

    console.log('🔄 Mise à jour des sources sur la carte...');

    const features = sources
      .map(source => {
        const coords = getCoordinatesForSource(source);
        
        if (!coords) {
          return null;
        }

        const waterType = getWaterType(source);
        
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: coords
          },
          properties: {
            id: source.source_id,
            name: source.source_name,
            type: waterType,
            brands: source.brands.join(', '),
            location: source.location || 'Non spécifiée',
            count_brands: source.count_brands,
            displayName: source.brands.length > 0 ? `${source.brands[0]}` : source.source_name,
            flow_rate: source.flow_rate ?? null,
            depth: source.depth ?? null,
            temperature: source.temperature ?? null,
            residue: source.residue ?? null,
            water_category: source.water_category || null,
          }
        };
      })
      .filter(feature => feature !== null);

    const source = map.current.getSource('water-sources') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features
    });

    console.log(`✅ ${features.length} sources mises à jour`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Eau de source': return 'bg-green-100 text-green-800 border-green-200';
      case 'Eau minérale naturelle': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Eau minérale naturelle gazeuse': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [2.2137, 46.2276],
        zoom: 5.5,
        duration: 2000
      });
      setSelectedSource(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Carte des Sources d'Eau
                </CardTitle>
                <Button variant="outline" size="sm" onClick={resetView}>
                  Vue d'ensemble
                </Button>
              </div>
              <div className="flex gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Eau de source</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Eau minérale</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Eau gazeuse</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div ref={mapContainer} className="w-full h-96 rounded-b-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Panneau d'information */}
        <div className="space-y-4">
          {selectedSource ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  {selectedSource.source_name}
                </CardTitle>
                <Badge className={getTypeColor(getWaterType(selectedSource))}>
                  {getWaterType(selectedSource)}
                </Badge>
                {(() => {
                  const residue = selectedSource.residu_sec_180_mg_L ?? selectedSource.residue;
                  const mLevel = getMineralizationLevel(residue);
                  return mLevel ? (
                    <Badge className={mLevel.color}>{mLevel.label}</Badge>
                  ) : null;
                })()}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Localisation</p>
                  <p className="font-medium">{selectedSource.location || 'Non spécifiée'}</p>
                </div>

                {/* Dureté de l'eau */}
                {(() => {
                  const th = computeHardness(selectedSource.Ca_mg_L, selectedSource.Mg_mg_L);
                  return th !== null ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dureté de l'eau</p>
                      <p className="font-medium">{th.toFixed(1)} °f — {getHardnessLabel(th)}</p>
                    </div>
                  ) : null;
                })()}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Marques ({selectedSource.count_brands})</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSource.brands.map((brand, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recommandations d'usage */}
                {(() => {
                  const recs = getUsageRecommendations(selectedSource);
                  return recs.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Recommandations</h4>
                      <div className="flex flex-wrap gap-1">
                        {recs.map((rec, i) => (
                          <Badge key={i} className={`${rec.color} text-xs gap-1`}>
                            {rec.icon}
                            {rec.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Composition minérale */}
                {(() => {
                  const mineralRows = [
                    { label: 'pH', value: selectedSource.pH, unit: '' },
                    { label: 'Résidu sec', value: selectedSource.residu_sec_180_mg_L, unit: 'mg/L' },
                    { label: 'Calcium (Ca)', value: selectedSource.Ca_mg_L, unit: 'mg/L' },
                    { label: 'Magnésium (Mg)', value: selectedSource.Mg_mg_L, unit: 'mg/L' },
                    { label: 'Sodium (Na)', value: selectedSource.Na_mg_L, unit: 'mg/L' },
                    { label: 'Nitrates (NO₃)', value: selectedSource.NO3_mg_L, unit: 'mg/L' },
                    { label: 'Bicarbonates (HCO₃)', value: selectedSource.HCO3_mg_L, unit: 'mg/L' },
                    { label: 'Sulfates (SO₄)', value: selectedSource.SO4_mg_L, unit: 'mg/L' },
                    { label: 'Chlorures (Cl)', value: selectedSource.Cl_mg_L, unit: 'mg/L' },
                    { label: 'Potassium (K)', value: selectedSource.K_mg_L, unit: 'mg/L' },
                    { label: 'Fluor (F)', value: selectedSource.F_mg_L, unit: 'mg/L' },
                    { label: 'Silice (SiO₂)', value: selectedSource.SiO2_mg_L, unit: 'mg/L' },
                  ].filter(row => row.value !== undefined && row.value !== null);

                  return mineralRows.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Composition minérale</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {mineralRows.map((row) => (
                          <div key={row.label} className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">{row.label}</span>
                            <span className="font-medium">{row.value}{row.unit ? ` ${row.unit}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 border border-border rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">
                        Données de composition non disponibles pour cette source.
                      </p>
                    </div>
                  );
                })()}

                {/* Coordonnées — toujours visibles */}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Coordonnées</span>
                  <span className="font-medium text-xs">
                    {selectedSource.latitude?.toFixed(4)}°N, {selectedSource.longitude?.toFixed(4)}°E
                  </span>
                </div>

                {/* Informations techniques détaillées — seulement si données réelles */}
                {(typeof selectedSource.flow_rate === 'number' && selectedSource.flow_rate > 0) ||
                 (typeof selectedSource.depth === 'number' && selectedSource.depth > 0) ||
                 (typeof selectedSource.temperature === 'number' && selectedSource.temperature > 0) ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Caractéristiques techniques</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {typeof selectedSource.flow_rate === 'number' && selectedSource.flow_rate > 0 && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Débit autorisé</span>
                          <span className="font-medium">{selectedSource.flow_rate} m³/jour</span>
                        </div>
                      )}
                      {typeof selectedSource.depth === 'number' && selectedSource.depth > 0 && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Profondeur captage</span>
                          <span className="font-medium">{selectedSource.depth} mètres</span>
                        </div>
                      )}
                      {typeof selectedSource.temperature === 'number' && selectedSource.temperature > 0 && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Température émergence</span>
                          <span className="font-medium">{selectedSource.temperature} °C</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Contrôle qualité enrichi */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Contrôle qualité
                  </h4>
                  {(() => {
                    const checks = getComplianceChecks(selectedSource);
                    return checks.length > 0 ? (
                      <div className="space-y-2">
                        {checks.map((c, i) => (
                          <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${c.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                              {c.ok ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                              <span className="text-sm font-medium">{c.param}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {c.value} / {c.limit} {c.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">Source contrôlée</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Cette source fait l'objet de contrôles sanitaires réguliers selon la réglementation française.
                        </p>
                      </div>
                    );
                  })()}
                  
                  {getWaterType(selectedSource) === 'Eau minérale naturelle gazeuse' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-amber-800">Eau naturellement gazeuse</span>
                      </div>
                      <p className="text-xs text-amber-700">
                        Cette eau contient naturellement du CO₂ à la source.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Sources d'Eau en France
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cliquez sur une source pour voir ses détails</p>
                  <p className="text-sm mt-2">
                    {sources.length} source{sources.length > 1 ? 's' : ''} trouvée{sources.length > 1 ? 's' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterSourcesMap;