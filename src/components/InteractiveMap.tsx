import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';

interface InteractiveMapProps {
  showWaterSources?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ showWaterSources = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(2.3488);
  const [lat, setLat] = useState(46.6034);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configure Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoidGh1cnphciIsImEiOiJjbWJ1eG9xMmQwOTc5MnZzYTluODUxMmp3In0.LTG70XIWIvpzLVq8FVXUbw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: 4
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Water quality data
    const waterQualityData = [
      { 
        name: 'Paris', 
        coords: [2.3522, 48.8566], 
        quality: 'B', 
        score: 85, 
        source: 'Seine et Marne', 
        region: 'ile-de-france'
      },
      { 
        name: 'Lyon', 
        coords: [4.8357, 45.7640], 
        quality: 'A', 
        score: 92, 
        source: 'Sources montagne', 
        region: 'auvergne-rhone-alpes'
      },
      { 
        name: 'Marseille', 
        coords: [5.3698, 43.2965], 
        quality: 'B', 
        score: 78, 
        source: 'Eaux souterraines', 
        region: 'occitanie'
      },
      { 
        name: 'Toulouse', 
        coords: [1.4442, 43.6047], 
        quality: 'C', 
        score: 72, 
        source: 'Eaux souterraines', 
        region: 'occitanie'
      },
      { 
        name: 'Nice', 
        coords: [7.2619, 43.7102], 
        quality: 'B', 
        score: 81, 
        source: 'Sources montagne', 
        region: 'auvergne-rhone-alpes'
      },
      { 
        name: 'Nantes', 
        coords: [-1.5534, 47.2184], 
        quality: 'A', 
        score: 90, 
        source: 'Nappes phréatiques', 
        region: 'nouvelle-aquitaine'
      },
      { 
        name: 'Strasbourg', 
        coords: [7.7521, 48.5734], 
        quality: 'A', 
        score: 89, 
        source: 'Eaux de surface', 
        region: 'grand-est'
      },
      { 
        name: 'Montpellier', 
        coords: [3.8767, 43.6108], 
        quality: 'C', 
        score: 75, 
        source: 'Eaux souterraines', 
        region: 'occitanie'
      },
      { 
        name: 'Bordeaux', 
        coords: [-0.5792, 44.8378], 
        quality: 'A', 
        score: 88, 
        source: 'Nappes phréatiques', 
        region: 'nouvelle-aquitaine'
      },
      { 
        name: 'Lille', 
        coords: [3.0573, 50.6292], 
        quality: 'B', 
        score: 83, 
        source: 'Nappes de craie', 
        region: 'hauts-de-france'
      }
    ];

    // Define water source zones with polygons
    const waterSourceZones = [
      {
        name: 'Seine et Marne',
        coordinates: [[[1.5, 48.2], [3.5, 48.2], [3.5, 49.2], [1.5, 49.2], [1.5, 48.2]]],
        color: '#3b82f6'
      },
      {
        name: 'Sources montagne',
        coordinates: [[[4.0, 44.5], [8.0, 44.5], [8.0, 47.0], [4.0, 47.0], [4.0, 44.5]]],
        color: '#10b981'
      },
      {
        name: 'Nappes phréatiques',
        coordinates: [[[-2.0, 43.0], [2.0, 43.0], [2.0, 47.5], [-2.0, 47.5], [-2.0, 43.0]]],
        color: '#f59e0b'
      },
      {
        name: 'Eaux souterraines',
        coordinates: [[[0.5, 42.0], [4.5, 42.0], [4.5, 45.0], [0.5, 45.0], [0.5, 42.0]]],
        color: '#8b5cf6'
      },
      {
        name: 'Nappes de craie',
        coordinates: [[[1.5, 49.2], [5.0, 49.2], [5.0, 51.5], [1.5, 51.5], [1.5, 49.2]]],
        color: '#06b6d4'
      },
      {
        name: 'Eaux de surface',
        coordinates: [[[5.0, 47.0], [8.5, 47.0], [8.5, 50.0], [5.0, 50.0], [5.0, 47.0]]],
        color: '#ec4899'
      }
    ];

    map.current.on('load', () => {
      // Add water source zones only if showWaterSources is true
      if (showWaterSources) {
        waterSourceZones.forEach((zone, index) => {
          map.current!.addSource(`water-zone-${index}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { name: zone.name },
              geometry: {
                type: 'Polygon',
                coordinates: zone.coordinates
              }
            }
          });

          map.current!.addLayer({
            id: `water-zone-fill-${index}`,
            type: 'fill',
            source: `water-zone-${index}`,
            paint: {
              'fill-color': zone.color,
              'fill-opacity': 0.2
            }
          });

          map.current!.addLayer({
            id: `water-zone-border-${index}`,
            type: 'line',
            source: `water-zone-${index}`,
            paint: {
              'line-color': zone.color,
              'line-width': 2,
              'line-opacity': 0.8
            }
          });

          // Add zone label
          const bounds = new mapboxgl.LngLatBounds();
          zone.coordinates[0].forEach((coord: number[]) => {
            bounds.extend(coord as [number, number]);
          });
          const center = bounds.getCenter();

          new mapboxgl.Marker({
            element: (() => {
              const el = document.createElement('div');
              el.className = 'zone-label';
              el.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              el.style.padding = '4px 8px';
              el.style.borderRadius = '4px';
              el.style.fontSize = '12px';
              el.style.fontWeight = 'bold';
              el.style.color = zone.color;
              el.style.border = `1px solid ${zone.color}`;
              el.textContent = zone.name;
              return el;
            })()
          })
          .setLngLat([center.lng, center.lat])
          .addTo(map.current!);
        });
      }
    });

    const getMarkerColor = (quality: string) => {
      switch (quality) {
        case 'A': return '#10b981'; // green
        case 'B': return '#3b82f6'; // blue
        case 'C': return '#f59e0b'; // yellow
        case 'D': return '#f97316'; // orange
        case 'E': return '#ef4444'; // red
        default: return '#6b7280'; // gray
      }
    };

    // Add markers for all cities
    waterQualityData.forEach(city => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getMarkerColor(city.quality);
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold text-lg">${city.name}</h3>
          <p class="text-sm text-gray-600">Qualité: <span class="font-medium" style="color: ${getMarkerColor(city.quality)}">${city.quality}</span></p>
          <p class="text-sm text-gray-600">Score: ${city.score}/100</p>
          <p class="text-sm text-gray-600">Source: ${city.source}</p>
        </div>`
      );

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat(city.coords as [number, number])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Update coordinates on move
    map.current.on('move', () => {
      if (map.current) {
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setZoom(Number(map.current.getZoom().toFixed(2)));
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [showWaterSources]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapContainer} className="h-96 w-full rounded-lg" />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-gray-700">
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
          </div>
          {!showWaterSources && (
            <div className="absolute bottom-4 right-4 bg-gray-600/90 backdrop-blur-sm rounded-lg p-2 shadow-lg text-white">
              <div className="text-xs">
                Zones masquées
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
