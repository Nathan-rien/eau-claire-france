import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { waterSources, WaterSource, getSourcesByType } from '@/data/waterSources';
import { Droplets, MapPin, Gauge, Ruler } from 'lucide-react';

interface WaterSourcesMapProps {
  selectedType?: string;
  onSourceSelect?: (source: WaterSource) => void;
}

const WaterSourcesMap: React.FC<WaterSourcesMapProps> = ({ 
  selectedType = 'all',
  onSourceSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);
  const [filteredSources, setFilteredSources] = useState<WaterSource[]>(waterSources);

  // Mettre à jour les sources filtrées quand le type change
  useEffect(() => {
    const sources = getSourcesByType(selectedType);
    setFilteredSources(sources);
  }, [selectedType]);

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

  // Mettre à jour la carte quand les sources filtrées changent
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateSourcesOnMap();
    }
  }, [filteredSources]);

  const addSourcesLayer = () => {
    if (!map.current) return;

    // Add source data
    map.current.addSource('water-sources', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredSources.map(source => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: source.coordinates
          },
          properties: {
            id: source.id,
            name: source.name,
            type: source.type,
            brands: source.brands.join(', '),
            location: source.location,
            region: source.region,
            calcium: source.composition.calcium,
            magnesium: source.composition.magnesium,
            sodium: source.composition.sodium
          }
        }))
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
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
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
        const source = waterSources.find(s => s.id === sourceId);
        
        if (source) {
          setSelectedSource(source);
          onSourceSelect?.(source);
          
          // Fly to source location
          map.current?.flyTo({
            center: source.coordinates,
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
      features: filteredSources.map(source => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: source.coordinates
        },
        properties: {
          id: source.id,
          name: source.name,
          type: source.type,
          brands: source.brands.join(', '),
          location: source.location,
          region: source.region,
          calcium: source.composition.calcium,
          magnesium: source.composition.magnesium,
          sodium: source.composition.sodium
        }
      }))
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
                  {selectedSource.name}
                </CardTitle>
                <Badge className={getTypeColor(selectedSource.type)}>
                  {selectedSource.type}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Localisation</p>
                  <p className="font-medium">{selectedSource.location}</p>
                  <p className="text-sm text-muted-foreground">{selectedSource.region}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Marques</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSource.brands.map((brand, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedSource.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selectedSource.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedSource.depth && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Profondeur</p>
                        <p className="text-sm font-medium">{selectedSource.depth}m</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedSource.flow && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Débit</p>
                        <p className="text-sm font-medium">{selectedSource.flow} L/min</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Composition minérale (mg/L)</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Calcium</p>
                      <p>{selectedSource.composition.calcium}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Magnésium</p>
                      <p>{selectedSource.composition.magnesium}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Sodium</p>
                      <p>{selectedSource.composition.sodium}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Nitrates</p>
                      <p>{selectedSource.composition.nitrates}</p>
                    </div>
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
                    {filteredSources.length} source{filteredSources.length > 1 ? 's' : ''} 
                    {selectedType !== 'all' ? ` de type ${selectedType}` : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sources affichées</span>
                  <span className="font-medium">{filteredSources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Régions couvertes</span>
                  <span className="font-medium">
                    {new Set(filteredSources.map(s => s.region)).size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Marques disponibles</span>
                  <span className="font-medium">
                    {new Set(filteredSources.flatMap(s => s.brands)).size}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WaterSourcesMap;