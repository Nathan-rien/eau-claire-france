
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';

const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(2.3488);
  const [lat, setLat] = useState(48.8534);
  const [zoom, setZoom] = useState(5.5);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configure Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoidGh1cnphciIsImEiOiJjbWJ1eG9xMmQwOTc5MnZzYTluODUxMmp3In0.LTG70XIWIvpzLVq8FVXUbw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Mock water quality data for different regions
    const waterQualityData = [
      { name: 'Paris', coords: [2.3522, 48.8566], quality: 'B', score: 85 },
      { name: 'Lyon', coords: [4.8357, 45.7640], quality: 'A', score: 92 },
      { name: 'Marseille', coords: [5.3698, 43.2965], quality: 'B', score: 78 },
      { name: 'Toulouse', coords: [1.4442, 43.6047], quality: 'A', score: 88 },
      { name: 'Nice', coords: [7.2619, 43.7102], quality: 'C', score: 72 },
      { name: 'Nantes', coords: [-1.5534, 47.2184], quality: 'A', score: 90 },
      { name: 'Strasbourg', coords: [7.7521, 48.5734], quality: 'B', score: 81 },
      { name: 'Montpellier', coords: [3.8767, 43.6108], quality: 'B', score: 83 },
      { name: 'Bordeaux', coords: [-0.5792, 44.8378], quality: 'A', score: 89 },
      { name: 'Lille', coords: [3.0573, 50.6292], quality: 'C', score: 75 }
    ];

    // Add markers for each city
    waterQualityData.forEach(city => {
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
  }, []);

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
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
