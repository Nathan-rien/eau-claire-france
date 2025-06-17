
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

const PollutantMap = () => {
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

    // Pollutant data by city
    const pollutantData = [
      { 
        name: 'Paris', 
        coords: [2.3522, 48.8566], 
        pollutants: ['Nitrates', 'Chlore résiduel', 'Trihalométhanes'],
        riskLevel: 'medium'
      },
      { 
        name: 'Lyon', 
        coords: [4.8357, 45.7640], 
        pollutants: ['Nitrates', 'Pesticides'],
        riskLevel: 'low'
      },
      { 
        name: 'Marseille', 
        coords: [5.3698, 43.2965], 
        pollutants: ['Nitrates', 'Arsenic', 'Fluorures'],
        riskLevel: 'high'
      },
      { 
        name: 'Toulouse', 
        coords: [1.4442, 43.6047], 
        pollutants: ['Pesticides', 'Nitrates', 'Plomb'],
        riskLevel: 'high'
      },
      { 
        name: 'Nice', 
        coords: [7.2619, 43.7102], 
        pollutants: ['Nitrates', 'Chlore résiduel'],
        riskLevel: 'low'
      },
      { 
        name: 'Nantes', 
        coords: [-1.5534, 47.2184], 
        pollutants: ['Pesticides', 'Nitrates'],
        riskLevel: 'medium'
      },
      { 
        name: 'Strasbourg', 
        coords: [7.7521, 48.5734], 
        pollutants: ['Nitrates'],
        riskLevel: 'low'
      },
      { 
        name: 'Montpellier', 
        coords: [3.8767, 43.6108], 
        pollutants: ['Pesticides', 'Arsenic', 'Nitrates', 'Fluorures'],
        riskLevel: 'high'
      },
      { 
        name: 'Bordeaux', 
        coords: [-0.5792, 44.8378], 
        pollutants: ['Pesticides', 'Nitrates'],
        riskLevel: 'medium'
      },
      { 
        name: 'Lille', 
        coords: [3.0573, 50.6292], 
        pollutants: ['Nitrates', 'Chlore résiduel', 'Trihalométhanes'],
        riskLevel: 'medium'
      }
    ];

    const getRiskColor = (riskLevel: string) => {
      switch (riskLevel) {
        case 'low': return '#10b981'; // green
        case 'medium': return '#f59e0b'; // yellow
        case 'high': return '#ef4444'; // red
        default: return '#6b7280'; // gray
      }
    };

    const getRiskSize = (riskLevel: string) => {
      switch (riskLevel) {
        case 'low': return '16px';
        case 'medium': return '20px';
        case 'high': return '24px';
        default: return '16px';
      }
    };

    // Add markers for pollutants
    pollutantData.forEach(city => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'pollutant-marker';
      el.style.backgroundColor = getRiskColor(city.riskLevel);
      el.style.width = getRiskSize(city.riskLevel);
      el.style.height = getRiskSize(city.riskLevel);
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      // Add warning icon for high risk
      if (city.riskLevel === 'high') {
        el.innerHTML = '⚠️';
        el.style.fontSize = '12px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
      }

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-3">
          <h3 class="font-bold text-lg mb-2">${city.name}</h3>
          <p class="text-sm text-gray-600 mb-2">Niveau de risque: 
            <span class="font-medium" style="color: ${getRiskColor(city.riskLevel)}">
              ${city.riskLevel === 'low' ? 'Faible' : city.riskLevel === 'medium' ? 'Modéré' : 'Élevé'}
            </span>
          </p>
          <div class="text-sm">
            <p class="font-medium text-gray-700 mb-1">Polluants détectés:</p>
            <ul class="list-disc list-inside text-gray-600">
              ${city.pollutants.map(pollutant => `<li>${pollutant}</li>`).join('')}
            </ul>
          </div>
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

  // Mock data for regional pollutant overview
  const pollutantRegions = [
    { id: 'ile-de-france', name: 'Île-de-France', mainPollutants: ['Nitrates', 'Trihalométhanes'], riskLevel: 'medium', cities: 1276 },
    { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', mainPollutants: ['Nitrates', 'Pesticides'], riskLevel: 'low', cities: 4032 },
    { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', mainPollutants: ['Pesticides', 'Nitrates'], riskLevel: 'medium', cities: 4356 },
    { id: 'occitanie', name: 'Occitanie', mainPollutants: ['Pesticides', 'Arsenic'], riskLevel: 'high', cities: 4448 },
    { id: 'hauts-de-france', name: 'Hauts-de-France', mainPollutants: ['Nitrates', 'Chlore résiduel'], riskLevel: 'medium', cities: 3789 },
    { id: 'grand-est', name: 'Grand Est', mainPollutants: ['Nitrates'], riskLevel: 'low', cities: 5133 },
  ];

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Faible';
      case 'medium': return 'Modéré';
      case 'high': return 'Élevé';
      default: return 'Non évalué';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Légende des niveaux de risque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { level: 'low', label: 'Faible', desc: 'Polluants sous les seuils réglementaires', color: 'bg-green-500' },
              { level: 'medium', label: 'Modéré', desc: 'Présence de polluants à surveiller', color: 'bg-yellow-500' },
              { level: 'high', label: 'Élevé', desc: 'Dépassements ou polluants préoccupants', color: 'bg-red-500' },
            ].map(item => (
              <div key={item.level} className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {item.level === 'high' ? '⚠️' : '●'}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
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

      {/* Regional Pollutant Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pollutantRegions.map(region => (
          <Card key={region.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{region.name}</CardTitle>
                <Badge className={`${getRiskColor(region.riskLevel)} text-white`}>
                  {getRiskLabel(region.riskLevel)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Niveau de risque</span>
                  <span className="font-medium">{getRiskLabel(region.riskLevel)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Polluants principaux:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {region.mainPollutants.map(pollutant => (
                      <Badge key={pollutant} variant="outline" className="text-xs">
                        {pollutant}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Communes concernées</span>
                  <span className="font-medium">{region.cities.toLocaleString()}</span>
                </div>
                {region.riskLevel === 'high' && (
                  <div className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Zone à surveiller</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PollutantMap;
