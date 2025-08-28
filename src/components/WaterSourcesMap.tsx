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

  // Charger les coordonnées depuis le fichier CSV
  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        const response = await fetch('/data/water_sources_coordinates.csv');
        const csvText = await response.text();
        
        const lines = csvText.split('\n').slice(1); // Skip header
        const coordinatesMap: Record<string, [number, number]> = {};
        
        lines.forEach(line => {
          const [sourceName, brand, commune, department, lat, lng, category] = line.split(',');
          if (sourceName && lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            const key = sourceName.toLowerCase().trim();
            coordinatesMap[key] = [parseFloat(lng), parseFloat(lat)];
            
            // Ajouter aussi par nom de marque
            if (brand && brand.toLowerCase() !== sourceName.toLowerCase()) {
              coordinatesMap[brand.toLowerCase().trim()] = [parseFloat(lng), parseFloat(lat)];
            }
          }
        });
        
        setSourceCoordinates(coordinatesMap);
      } catch (error) {
        console.error('Erreur lors du chargement des coordonnées:', error);
      }
    };
    
    loadCoordinates();
  }, []);

  const getCoordinatesForSource = (source: SourceItem): [number, number] => {
    const sourceName = source.source_name.toLowerCase().trim();
    const location = source.location?.toLowerCase().trim() || '';
    
    // Recherche directe par nom de source
    if (sourceCoordinates[sourceName]) {
      return sourceCoordinates[sourceName];
    }
    
    // Recherche par marques associées
    for (const brand of source.brands) {
      const brandKey = brand.toLowerCase().trim();
      if (sourceCoordinates[brandKey]) {
        return sourceCoordinates[brandKey];
      }
    }
    
    // Recherche par mots-clés dans le nom
    for (const [key, coords] of Object.entries(sourceCoordinates)) {
      if (sourceName.includes(key) || key.includes(sourceName) || 
          (location && (location.includes(key) || key.includes(location)))) {
        return coords;
      }
    }
    
    // Position par défaut au centre de la France avec léger décalage aléatoire
    const baseCoords: [number, number] = [2.2137, 46.2276];
    const randomOffset = 0.2;
    return [
      baseCoords[0] + (Math.random() - 0.5) * randomOffset,
      baseCoords[1] + (Math.random() - 0.5) * randomOffset
    ];
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
    if (map.current && map.current.isStyleLoaded()) {
      updateSourcesOnMap();
    }
  }, [csvSources]);

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