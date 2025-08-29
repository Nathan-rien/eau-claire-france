import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { SourceItem } from '@/utils/sourcesAdapter';
import { Droplets, MapPin } from 'lucide-react';

interface WaterSourcesMapProps {
  csvSources: SourceItem[];
}

const WaterSourcesMap: React.FC<WaterSourcesMapProps> = ({ csvSources }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [sourceCoordinates, setSourceCoordinates] = useState<Record<string, [number, number]>>({});
  const [coordinatesLoaded, setCoordinatesLoaded] = useState(false);

  // Fonction de normalisation pour la correspondance des noms
  const normalize = (s: string) =>
    s?.toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ') || '';

  // Chargement des coordonnées depuis le CSV
  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        console.log('🔄 Chargement des coordonnées des sources...');
        const response = await fetch('/data/water_sources_coordinates.csv');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).slice(1).map(l => l.trim()).filter(Boolean);
        
        const coordinatesMap: Record<string, [number, number]> = {};

        for (const line of lines) {
          const parts = line.split(';').map(p => p.trim());
          
          if (parts.length < 6) continue;

          const [sourceNameRaw, brandRaw, communeRaw, , latRaw, lngRaw] = parts;
          const lat = parseFloat(latRaw);
          const lng = parseFloat(lngRaw);
          
          if (isNaN(lat) || isNaN(lng)) continue;

          const coords: [number, number] = [lng, lat]; // [longitude, latitude] pour Mapbox
          const sourceName = normalize(sourceNameRaw);
          const brand = normalize(brandRaw);
          const commune = normalize(communeRaw);

          // Stocker sous différentes clés pour maximiser les correspondances
          if (sourceName) coordinatesMap[sourceName] = coords;
          if (brand) coordinatesMap[brand] = coords;
          if (commune) coordinatesMap[commune] = coords;
          if (sourceName && commune) coordinatesMap[`${sourceName}|${commune}`] = coords;
          if (brand && commune) coordinatesMap[`${brand}|${commune}`] = coords;
        }

        console.log(`✅ ${Object.keys(coordinatesMap).length} coordonnées chargées`);
        setSourceCoordinates(coordinatesMap);
        setCoordinatesLoaded(true);
        
      } catch (e) {
        console.error('❌ Erreur lors du chargement des coordonnées:', e);
        // Coordonnées de fallback pour les principales sources
        const fallbackCoords: Record<string, [number, number]> = {
          'evian': [6.5885, 46.4008],
          'volvic': [3.0319, 45.8708],
          'vittel': [5.9469, 48.2034],
          'contrex': [5.8936, 48.1847],
          'hepar': [5.9500, 48.2100],
          'perrier': [3.9500, 43.7500],
          'badoit': [4.2500, 45.5333],
          'cristaline': [2.2137, 46.2276],
        };
        setSourceCoordinates(fallbackCoords);
        setCoordinatesLoaded(true);
      }
    };

    loadCoordinates();
  }, []);

  // Fonction pour obtenir les coordonnées d'une source
  const getCoordinatesForSource = (source: SourceItem): [number, number] | null => {
    if (!coordinatesLoaded || Object.keys(sourceCoordinates).length === 0) {
      return null;
    }

    const sName = normalize(source.source_name);
    const loc = normalize(source.location || '');
    const commune = (loc.split(/[,–-]/)[0] || '').trim();

    // 1. Recherche exacte : source|commune
    if (sName && commune && sourceCoordinates[`${sName}|${commune}`]) {
      return sourceCoordinates[`${sName}|${commune}`];
    }
    
    // 2. Recherche par nom de source
    if (sName && sourceCoordinates[sName]) {
      return sourceCoordinates[sName];
    }
    
    // 3. Recherche par marques
    for (const brand of source.brands) {
      const normalizedBrand = normalize(brand);
      
      // 3a. brand|commune
      if (normalizedBrand && commune && sourceCoordinates[`${normalizedBrand}|${commune}`]) {
        return sourceCoordinates[`${normalizedBrand}|${commune}`];
      }
      
      // 3b. brand uniquement
      if (normalizedBrand && sourceCoordinates[normalizedBrand]) {
        return sourceCoordinates[normalizedBrand];
      }
    }
    
    // 4. Recherche par commune
    if (commune && sourceCoordinates[commune]) {
      return sourceCoordinates[commune];
    }

    // 5. Recherche de correspondances partielles
    const allKeys = Object.keys(sourceCoordinates);
    
    if (sName) {
      const partialMatch = allKeys.find(key => 
        key.includes(sName) || sName.includes(key.split('|')[0])
      );
      if (partialMatch) {
        return sourceCoordinates[partialMatch];
      }
    }
    
    for (const brand of source.brands) {
      const normalizedBrand = normalize(brand);
      if (normalizedBrand) {
        const partialMatch = allKeys.find(key => 
          key.includes(normalizedBrand) || normalizedBrand.includes(key.split('|')[0])
        );
        if (partialMatch) {
          return sourceCoordinates[partialMatch];
        }
      }
    }

    console.warn(`❌ Aucune coordonnée trouvée pour: ${source.source_name}`);
    return null;
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
    if (map.current && map.current.isStyleLoaded() && csvSources.length > 0 && coordinatesLoaded) {
      if (map.current.getSource('water-sources')) {
        updateSourcesOnMap();
      } else {
        addSourcesLayer();
      }
    }
  }, [csvSources, coordinatesLoaded, sourceCoordinates]);

  const addSourcesLayer = () => {
    if (!map.current || !coordinatesLoaded) return;

    console.log('📍 Ajout des sources sur la carte...');
    
    // Créer les features avec validation des coordonnées
    const features = csvSources
      .map(source => {
        const coords = getCoordinatesForSource(source);
        
        if (!coords) {
          return null; // Ignorer les sources sans coordonnées
        }

        // Déterminer le type d'eau
        let waterType = 'Eau minérale naturelle';
        
        const isSpringWater = source.source_name.toLowerCase().includes('source') ||
                             source.brands.some(brand => 
                               ['cristaline', 'carrefour', 'marque repère', 'eco+', 'saskia', 'rocheval', 
                                'ondine', 'monoprix', 'auchan', 'casino', 'top budget'].some(keyword =>
                                 brand.toLowerCase().includes(keyword)
                               )
                             );
        
        if (isSpringWater) {
          waterType = 'Eau de source';
        } else if (source.is_sparkling_mix) {
          waterType = 'Eau minérale naturelle gazeuse';
        }
        
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
            is_sparkling_mix: source.is_sparkling_mix,
            displayName: source.brands.length > 0 ? `${source.brands[0]}` : source.source_name,
            flow_rate: source.flow_rate ?? null,
            depth: source.depth ?? null,
            temperature: source.temperature ?? null,
            residue: source.residue ?? null,
          }
        };
      })
      .filter(feature => feature !== null); // Enlever les features nulles

    console.log(`✅ ${features.length} sources ajoutées sur ${csvSources.length} sources total`);

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
          'case',
          ['==', ['get', 'type'], 'Eau de source'], '#22c55e',
          ['==', ['get', 'type'], 'Eau minérale naturelle'], '#3b82f6',
          ['==', ['get', 'type'], 'Eau minérale naturelle gazeuse'], '#f59e0b',
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
        const source = csvSources.find(s => s.source_id === sourceId);
        
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
    if (!map.current || !map.current.getSource('water-sources') || !coordinatesLoaded) return;

    console.log('🔄 Mise à jour des sources sur la carte...');

    const features = csvSources
      .map(source => {
        const coords = getCoordinatesForSource(source);
        
        if (!coords) {
          return null;
        }

        let waterType = 'Eau minérale naturelle';
        
        const isSpringWater = source.source_name.toLowerCase().includes('source') ||
                             source.brands.some(brand => 
                               ['cristaline', 'carrefour', 'marque repère', 'eco+', 'saskia', 'rocheval', 
                                'ondine', 'monoprix', 'auchan', 'casino', 'top budget'].some(keyword =>
                                 brand.toLowerCase().includes(keyword)
                               )
                             );
        
        if (isSpringWater) {
          waterType = 'Eau de source';
        } else if (source.is_sparkling_mix) {
          waterType = 'Eau minérale naturelle gazeuse';
        }
        
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
            is_sparkling_mix: source.is_sparkling_mix,
            displayName: source.brands.length > 0 ? `${source.brands[0]}` : source.source_name,
            flow_rate: source.flow_rate ?? null,
            depth: source.depth ?? null,
            temperature: source.temperature ?? null,
            residue: source.residue ?? null,
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
                <Badge className={getTypeColor(selectedSource.is_sparkling_mix ? 'Eau minérale naturelle gazeuse' : 'Eau minérale naturelle')}>
                  {selectedSource.is_sparkling_mix ? 'Eau minérale naturelle gazeuse' : 'Eau minérale naturelle'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Localisation</p>
                  <p className="font-medium">{selectedSource.location || 'Non spécifiée'}</p>
                </div>

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

                {/* Informations techniques */}
                <div className="grid grid-cols-2 gap-4">
                  {typeof selectedSource.flow_rate === 'number' && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Débit autorisé</p>
                      <p className="font-medium">{selectedSource.flow_rate} m³/j</p>
                    </div>
                  )}
                  {typeof selectedSource.depth === 'number' && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Profondeur</p>
                      <p className="font-medium">{selectedSource.depth} m</p>
                    </div>
                  )}
                  {typeof selectedSource.temperature === 'number' && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Température</p>
                      <p className="font-medium">{selectedSource.temperature} °C</p>
                    </div>
                  )}
                  {typeof selectedSource.residue === 'number' && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Résidu sec</p>
                      <p className="font-medium">{selectedSource.residue} mg/L</p>
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
                    {csvSources.length} source{csvSources.length > 1 ? 's' : ''} trouvée{csvSources.length > 1 ? 's' : ''}
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