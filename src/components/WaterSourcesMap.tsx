import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { SourceItem } from '@/utils/sourcesAdapter';

import { Droplets, MapPin, Gauge, Ruler } from 'lucide-react';

interface WaterSourcesMapProps {
  csvSources: SourceItem[];
}

const WaterSourcesMap: React.FC<WaterSourcesMapProps> = ({ csvSources }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);

  // Coordonnées réelles pour les sources françaises
  const [sourceCoordinates, setSourceCoordinates] = useState<Record<string, [number, number]>>({});

  // --- helper ---
  const normalize = (s: string) =>
    s?.toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ') || '';

  // --- useEffect pour charger les coordonnées ---
  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        const response = await fetch('/data/water_sources_coordinates.csv');
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

          const coords: [number, number] = [lng, lat];

          const sourceName = normalize(sourceNameRaw);
          const brand = normalize(brandRaw);
          const commune = normalize(communeRaw);

          if (sourceName) coordinatesMap[sourceName] = coords;
          if (brand) coordinatesMap[brand] = coords;
          if (commune) coordinatesMap[commune] = coords;
          if (sourceName && commune) coordinatesMap[`${sourceName}|${commune}`] = coords;
          if (brand && commune) coordinatesMap[`${brand}|${commune}`] = coords;
        }

        setSourceCoordinates(coordinatesMap);
      } catch (e) {
        console.error('Erreur lors du chargement des coordonnées:', e);
      }
    };

    loadCoordinates();
  }, []);

  // --- fonction de recherche stricte ---
  const getCoordinatesForSource = (source: SourceItem): [number, number] => {
    const sName = normalize(source.source_name);
    const loc = normalize(source.location || '');
    const commune = (loc.split(/[,–-]/)[0] || '').trim();

    // Log pour déboguer
    console.log('Recherche coordonnées pour:', {
      source_name: source.source_name,
      normalized_source: sName,
      location: source.location,
      normalized_commune: commune,
      brands: source.brands,
      available_keys: Object.keys(sourceCoordinates).slice(0, 10) // Premier 10 clés pour debug
    });

    // 1. Recherche source|commune
    if (sName && commune && sourceCoordinates[`${sName}|${commune}`]) {
      console.log('✓ Trouvé avec source|commune:', `${sName}|${commune}`);
      return sourceCoordinates[`${sName}|${commune}`];
    }
    
    // 2. Recherche source uniquement
    if (sName && sourceCoordinates[sName]) {
      console.log('✓ Trouvé avec source:', sName);
      return sourceCoordinates[sName];
    }
    
    // 3. Recherche par marques
    for (const b of source.brands) {
      const brand = normalize(b);
      
      // 3a. brand|commune
      if (brand && commune && sourceCoordinates[`${brand}|${commune}`]) {
        console.log('✓ Trouvé avec brand|commune:', `${brand}|${commune}`);
        return sourceCoordinates[`${brand}|${commune}`];
      }
      
      // 3b. brand uniquement
      if (brand && sourceCoordinates[brand]) {
        console.log('✓ Trouvé avec brand:', brand);
        return sourceCoordinates[brand];
      }
    }
    
    // 4. Recherche commune uniquement
    if (commune && sourceCoordinates[commune]) {
      console.log('✓ Trouvé avec commune:', commune);
      return sourceCoordinates[commune];
    }

    // 5. Fallback - chercher des correspondances partielles
    const allKeys = Object.keys(sourceCoordinates);
    
    // Chercher une correspondance partielle avec le nom de source
    if (sName) {
      const partialMatch = allKeys.find(key => 
        key.includes(sName) || sName.includes(key.split('|')[0])
      );
      if (partialMatch) {
        console.log('✓ Trouvé avec correspondance partielle source:', partialMatch);
        return sourceCoordinates[partialMatch];
      }
    }
    
    // Chercher une correspondance partielle avec les marques
    for (const b of source.brands) {
      const brand = normalize(b);
      if (brand) {
        const partialMatch = allKeys.find(key => 
          key.includes(brand) || brand.includes(key.split('|')[0])
        );
        if (partialMatch) {
          console.log('✓ Trouvé avec correspondance partielle brand:', partialMatch);
          return sourceCoordinates[partialMatch];
        }
      }
    }

    console.log('❌ Aucune coordonnée trouvée, utilisation fallback');
    // fallback centre France
    const base: [number, number] = [2.2137, 46.2276];
    const jitter = 0.05;
    return [base[0] + (Math.random() - 0.5) * jitter, base[1] + (Math.random() - 0.5) * jitter];
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configure Mapbox securely
    MapboxSecurityService.configureMapbox(mapboxgl);
    
    // Create map with secure configuration
    map.current = new mapboxgl.Map({
      ...MapboxSecurityService.createSecureMapOptions(mapContainer.current),
      center: [2.2137, 46.2276], // Centre de la France
      zoom: 5.5
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addSourcesLayer();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Mettre à jour la carte quand les sources CSV changent
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && csvSources.length > 0) {
      if (map.current.getSource('water-sources')) {
        updateSourcesOnMap();
      } else {
        addSourcesLayer();
      }
    }
  }, [csvSources, sourceCoordinates]);

  const addSourcesLayer = () => {
    if (!map.current) return;

    // Add source data
    map.current.addSource('water-sources', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: csvSources.map(source => {
          const coords = getCoordinatesForSource(source);
          const waterType = source.is_sparkling_mix ? 'Eau minérale naturelle gazeuse' : 'Eau minérale naturelle';
          
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
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
              displayName: source.brands.length > 0 ? `${source.brands[0]} - ${source.source_name}` : source.source_name
            }
          } as const;
        })
      }
    });

    // Add circles layer
    map.current.addLayer({
      id: 'sources-circles',
      type: 'circle',
      source: 'water-sources',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4, 6,
          8, 12,
          12, 20
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'type'], 'Eau de source'], '#22c55e',
          ['==', ['get', 'type'], 'Eau minérale naturelle'], '#3b82f6',
          ['==', ['get', 'type'], 'Eau minérale naturelle gazeuse'], '#f59e0b',
          '#6b7280'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add labels layer
    map.current.addLayer({
      id: 'sources-labels',
      type: 'symbol',
      source: 'water-sources',
      layout: {
        'text-field': ['get', 'displayName'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-offset': [0, 2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // Add click events
    map.current.on('click', 'sources-circles', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const sourceId = feature.properties?.id;
        const source = csvSources.find(s => s.source_id === sourceId);
        
        if (source) {
          setSelectedSource(source);
          
          // Fly to source location
          const coords = getCoordinatesForSource(source);
          map.current?.flyTo({
            center: coords,
            zoom: 10,
            duration: 2000
          });
        }
      }
    });

    // Change cursor on hover
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

    const source = map.current.getSource('water-sources') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: csvSources.map(source => {
        const coords = getCoordinatesForSource(source);
        const waterType = source.is_sparkling_mix ? 'Eau minérale naturelle gazeuse' : 'Eau minérale naturelle';
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
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
            displayName: source.brands.length > 0 ? `${source.brands[0]} - ${source.source_name}` : source.source_name
          }
        } as const;
      })
    });
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