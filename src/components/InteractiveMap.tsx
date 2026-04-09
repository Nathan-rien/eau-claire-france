import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';

interface CityData {
  name: string;
  coords: [number, number];
  quality: string;
  score: number;
  source: string;
  region: string;
  population: number;
  conformityRate: number;
  lastAnalysis: string;
  waterSource: string;
  nitrates: number;
  pesticides: number;
  lead: number;
}

interface InteractiveMapProps {
  showWaterSources?: boolean;
}

const waterQualityData: CityData[] = [
  { name: 'Paris', coords: [2.3522, 48.8566], quality: 'B', score: 85, source: 'Seine et Marne', region: 'ile-de-france', population: 2161000, conformityRate: 98.2, lastAnalysis: 'Mars 2025', waterSource: 'Eaux de surface + souterraines', nitrates: 28, pesticides: 0.08, lead: 3.2 },
  { name: 'Lyon', coords: [4.8357, 45.7640], quality: 'A', score: 92, source: 'Sources montagne', region: 'auvergne-rhone-alpes', population: 516092, conformityRate: 99.1, lastAnalysis: 'Février 2025', waterSource: 'Nappe alluviale du Rhône', nitrates: 12, pesticides: 0.03, lead: 1.8 },
  { name: 'Marseille', coords: [5.3698, 43.2965], quality: 'B', score: 78, source: 'Canal de Marseille', region: 'provence-alpes-cote-dazur', population: 870731, conformityRate: 98.5, lastAnalysis: 'Mars 2025', waterSource: 'Durance via canal', nitrates: 15, pesticides: 0.04, lead: 2.5 },
  { name: 'Toulouse', coords: [1.4442, 43.6047], quality: 'C', score: 72, source: 'Eaux souterraines', region: 'occitanie', population: 493465, conformityRate: 97.2, lastAnalysis: 'Janvier 2025', waterSource: 'Garonne + nappes', nitrates: 35, pesticides: 0.09, lead: 4.1 },
  { name: 'Nice', coords: [7.2619, 43.7102], quality: 'B', score: 81, source: 'Sources montagne', region: 'provence-alpes-cote-dazur', population: 342669, conformityRate: 98.7, lastAnalysis: 'Février 2025', waterSource: 'Sources karstiques Vésubie', nitrates: 10, pesticides: 0.02, lead: 1.9 },
  { name: 'Nantes', coords: [-1.5534, 47.2184], quality: 'A', score: 90, source: 'Nappes phréatiques', region: 'pays-de-la-loire', population: 318808, conformityRate: 98.8, lastAnalysis: 'Mars 2025', waterSource: 'Loire + nappes alluviales', nitrates: 22, pesticides: 0.05, lead: 2.0 },
  { name: 'Strasbourg', coords: [7.7521, 48.5734], quality: 'A', score: 89, source: 'Nappe phréatique rhénane', region: 'grand-est', population: 287228, conformityRate: 99.0, lastAnalysis: 'Février 2025', waterSource: 'Nappe phréatique rhénane', nitrates: 18, pesticides: 0.03, lead: 1.5 },
  { name: 'Montpellier', coords: [3.8767, 43.6108], quality: 'C', score: 75, source: 'Eaux souterraines', region: 'occitanie', population: 295542, conformityRate: 97.0, lastAnalysis: 'Janvier 2025', waterSource: 'Source du Lez', nitrates: 38, pesticides: 0.08, lead: 3.5 },
  { name: 'Bordeaux', coords: [-0.5792, 44.8378], quality: 'A', score: 88, source: 'Nappes profondes', region: 'nouvelle-aquitaine', population: 260958, conformityRate: 98.9, lastAnalysis: 'Mars 2025', waterSource: 'Nappes profondes Éocène', nitrates: 8, pesticides: 0.02, lead: 1.4 },
  { name: 'Lille', coords: [3.0573, 50.6292], quality: 'B', score: 83, source: 'Nappes de craie', region: 'hauts-de-france', population: 236234, conformityRate: 97.9, lastAnalysis: 'Février 2025', waterSource: 'Nappes de craie', nitrates: 38, pesticides: 0.06, lead: 3.8 },
  // 15 villes supplémentaires
  { name: 'Rennes', coords: [-1.6777, 48.1173], quality: 'B', score: 82, source: 'Eaux de surface', region: 'bretagne', population: 222485, conformityRate: 97.5, lastAnalysis: 'Mars 2025', waterSource: 'Vilaine + retenues', nitrates: 36, pesticides: 0.07, lead: 2.8 },
  { name: 'Rouen', coords: [1.0993, 49.4432], quality: 'B', score: 80, source: 'Nappes calcaires', region: 'normandie', population: 113368, conformityRate: 97.6, lastAnalysis: 'Février 2025', waterSource: 'Nappes de craie Seine', nitrates: 33, pesticides: 0.07, lead: 3.0 },
  { name: 'Dijon', coords: [5.0415, 47.3220], quality: 'A', score: 91, source: 'Sources karstiques', region: 'bourgogne-franche-comte', population: 159346, conformityRate: 99.2, lastAnalysis: 'Mars 2025', waterSource: 'Sources karstiques Suzon', nitrates: 14, pesticides: 0.03, lead: 1.3 },
  { name: 'Clermont-Ferrand', coords: [3.0870, 45.7772], quality: 'A', score: 93, source: 'Sources volcaniques', region: 'auvergne-rhone-alpes', population: 147865, conformityRate: 99.4, lastAnalysis: 'Mars 2025', waterSource: 'Sources volcaniques Chaîne des Puys', nitrates: 6, pesticides: 0.01, lead: 1.0 },
  { name: 'Grenoble', coords: [5.7245, 45.1885], quality: 'A', score: 94, source: 'Nappes glaciaires', region: 'auvergne-rhone-alpes', population: 160649, conformityRate: 99.5, lastAnalysis: 'Février 2025', waterSource: 'Nappe alluviale Drac-Isère', nitrates: 5, pesticides: 0.01, lead: 0.8 },
  { name: 'Toulon', coords: [5.9280, 43.1242], quality: 'B', score: 79, source: 'Sources karstiques', region: 'provence-alpes-cote-dazur', population: 178745, conformityRate: 98.3, lastAnalysis: 'Janvier 2025', waterSource: 'Sources et Verdon', nitrates: 18, pesticides: 0.04, lead: 2.6 },
  { name: 'Metz', coords: [6.1757, 49.1193], quality: 'A', score: 88, source: 'Eaux de surface', region: 'grand-est', population: 120205, conformityRate: 98.7, lastAnalysis: 'Mars 2025', waterSource: 'Moselle + nappes alluviales', nitrates: 20, pesticides: 0.04, lead: 2.0 },
  { name: 'Reims', coords: [3.9340, 49.2583], quality: 'B', score: 84, source: 'Nappes de craie', region: 'grand-est', population: 183042, conformityRate: 98.4, lastAnalysis: 'Février 2025', waterSource: 'Nappes de craie champenoises', nitrates: 25, pesticides: 0.05, lead: 2.2 },
  { name: 'Orléans', coords: [1.9039, 47.9029], quality: 'B', score: 81, source: 'Nappes alluviales', region: 'centre-val-de-loire', population: 116685, conformityRate: 97.8, lastAnalysis: 'Mars 2025', waterSource: 'Nappe alluviale Loire', nitrates: 32, pesticides: 0.07, lead: 2.9 },
  { name: 'Angers', coords: [-0.5632, 47.4784], quality: 'B', score: 83, source: 'Loire et affluents', region: 'pays-de-la-loire', population: 157175, conformityRate: 98.1, lastAnalysis: 'Février 2025', waterSource: 'Maine + nappes', nitrates: 28, pesticides: 0.06, lead: 2.3 },
  { name: 'Brest', coords: [-4.4860, 48.3904], quality: 'C', score: 74, source: 'Eaux de surface', region: 'bretagne', population: 142722, conformityRate: 96.5, lastAnalysis: 'Mars 2025', waterSource: 'Retenues Élorn', nitrates: 44, pesticides: 0.09, lead: 3.2 },
  { name: 'Limoges', coords: [1.2611, 45.8336], quality: 'A', score: 90, source: 'Barrages', region: 'nouvelle-aquitaine', population: 132175, conformityRate: 99.0, lastAnalysis: 'Mars 2025', waterSource: 'Barrages granitiques Vienne', nitrates: 10, pesticides: 0.02, lead: 1.5 },
  { name: 'Ajaccio', coords: [8.7369, 41.9263], quality: 'A', score: 92, source: 'Sources montagneuses', region: 'corse', population: 72745, conformityRate: 99.3, lastAnalysis: 'Janvier 2025', waterSource: 'Sources Gravona', nitrates: 6, pesticides: 0.01, lead: 1.1 },
  { name: 'Amiens', coords: [2.2951, 49.8941], quality: 'B', score: 85, source: 'Nappes de craie', region: 'hauts-de-france', population: 135501, conformityRate: 98.0, lastAnalysis: 'Février 2025', waterSource: 'Nappe de craie Somme', nitrates: 30, pesticides: 0.05, lead: 2.4 },
  { name: 'Pau', coords: [-0.3708, 43.2951], quality: 'A', score: 91, source: 'Sources pyrénéennes', region: 'nouvelle-aquitaine', population: 77251, conformityRate: 99.2, lastAnalysis: 'Mars 2025', waterSource: 'Sources pyrénéennes Gave', nitrates: 7, pesticides: 0.01, lead: 1.2 },
];

const waterSourceZones = [
  { name: 'Seine et Marne', coordinates: [[[1.5, 48.2], [3.5, 48.2], [3.5, 49.2], [1.5, 49.2], [1.5, 48.2]]], color: '#3b82f6' },
  { name: 'Sources montagne', coordinates: [[[4.0, 44.5], [8.0, 44.5], [8.0, 47.0], [4.0, 47.0], [4.0, 44.5]]], color: '#10b981' },
  { name: 'Nappes phréatiques', coordinates: [[[-2.0, 43.0], [2.0, 43.0], [2.0, 47.5], [-2.0, 47.5], [-2.0, 43.0]]], color: '#f59e0b' },
  { name: 'Eaux souterraines', coordinates: [[[0.5, 42.0], [4.5, 42.0], [4.5, 45.0], [0.5, 45.0], [0.5, 42.0]]], color: '#8b5cf6' },
  { name: 'Nappes de craie', coordinates: [[[1.5, 49.2], [5.0, 49.2], [5.0, 51.5], [1.5, 51.5], [1.5, 49.2]]], color: '#06b6d4' },
  { name: 'Eaux de surface', coordinates: [[[5.0, 47.0], [8.5, 47.0], [8.5, 50.0], [5.0, 50.0], [5.0, 47.0]]], color: '#ec4899' },
];

const getMarkerColor = (quality: string) => {
  switch (quality) {
    case 'A': return '#10b981';
    case 'B': return '#3b82f6';
    case 'C': return '#f59e0b';
    case 'D': return '#f97316';
    case 'E': return '#ef4444';
    default: return '#6b7280';
  }
};

const getConformityColor = (rate: number) => {
  if (rate >= 99) return '#10b981';
  if (rate >= 98) return '#3b82f6';
  if (rate >= 97) return '#f59e0b';
  return '#ef4444';
};

const getPollutantStatus = (value: number, limit: number) => {
  const ratio = value / limit;
  if (ratio < 0.5) return { color: '#10b981', label: '✓' };
  if (ratio < 0.8) return { color: '#f59e0b', label: '⚠' };
  return { color: '#ef4444', label: '✗' };
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ showWaterSources = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(2.3488);
  const [lat, setLat] = useState(46.6034);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    if (!mapContainer.current) return;

    MapboxSecurityService.configureMapbox(mapboxgl);
    
    map.current = new mapboxgl.Map(
      MapboxSecurityService.createSecureMapOptions(mapContainer.current)
    );

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (showWaterSources) {
        waterSourceZones.forEach((zone, index) => {
          map.current!.addSource(`water-zone-${index}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { name: zone.name },
              geometry: { type: 'Polygon', coordinates: zone.coordinates }
            }
          });

          map.current!.addLayer({
            id: `water-zone-fill-${index}`,
            type: 'fill',
            source: `water-zone-${index}`,
            paint: { 'fill-color': zone.color, 'fill-opacity': 0.2 }
          });

          map.current!.addLayer({
            id: `water-zone-border-${index}`,
            type: 'line',
            source: `water-zone-${index}`,
            paint: { 'line-color': zone.color, 'line-width': 2, 'line-opacity': 0.8 }
          });

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

    // Add markers for all cities
    waterQualityData.forEach(city => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getMarkerColor(city.quality);
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Voir la qualité de l'eau à ${city.name} (note ${city.quality})`);
      el.setAttribute('tabindex', '0');
      
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });

      const nitrateStatus = getPollutantStatus(city.nitrates, 50);
      const pesticideStatus = getPollutantStatus(city.pesticides, 0.1);
      const leadStatus = getPollutantStatus(city.lead, 10);
      const conformColor = getConformityColor(city.conformityRate);

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '320px' }).setHTML(
        `<div style="font-family: system-ui, sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${getMarkerColor(city.quality)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">${city.quality}</div>
            <div>
              <div style="font-weight: 700; font-size: 15px;">${city.name}</div>
              <div style="font-size: 11px; color: #6b7280;">${city.waterSource}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 12px; margin-bottom: 8px;">
            <div style="color: #6b7280;">Score</div>
            <div style="font-weight: 600; text-align: right;">
              <span style="display: inline-block; width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; vertical-align: middle; margin-right: 4px; position: relative; overflow: hidden;">
                <span style="display: block; height: 100%; width: ${city.score}%; background: ${getMarkerColor(city.quality)}; border-radius: 3px;"></span>
              </span>
              ${city.score}/100
            </div>
            <div style="color: #6b7280;">Population</div>
            <div style="font-weight: 600; text-align: right;">${city.population.toLocaleString('fr-FR')}</div>
            <div style="color: #6b7280;">Conformité</div>
            <div style="font-weight: 600; text-align: right; color: ${conformColor};">${city.conformityRate} %</div>
            <div style="color: #6b7280;">Dernier contrôle</div>
            <div style="font-weight: 600; text-align: right;">${city.lastAnalysis}</div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 6px;">
            <div style="font-weight: 600; font-size: 11px; color: #374151; margin-bottom: 4px;">Polluants clés</div>
            <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
              <thead>
                <tr style="color: #9ca3af;">
                  <th style="text-align: left; padding: 2px 0; font-weight: 500;">Param.</th>
                  <th style="text-align: right; padding: 2px 0; font-weight: 500;">Mesuré</th>
                  <th style="text-align: right; padding: 2px 0; font-weight: 500;">Limite</th>
                  <th style="text-align: center; padding: 2px 0; font-weight: 500;"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 2px 0;">Nitrates</td>
                  <td style="text-align: right; padding: 2px 0; font-weight: 600;">${city.nitrates} mg/L</td>
                  <td style="text-align: right; padding: 2px 0; color: #9ca3af;">50</td>
                  <td style="text-align: center; padding: 2px 0; color: ${nitrateStatus.color};">${nitrateStatus.label}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">Pesticides</td>
                  <td style="text-align: right; padding: 2px 0; font-weight: 600;">${city.pesticides} µg/L</td>
                  <td style="text-align: right; padding: 2px 0; color: #9ca3af;">0.1</td>
                  <td style="text-align: center; padding: 2px 0; color: ${pesticideStatus.color};">${pesticideStatus.label}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">Plomb</td>
                  <td style="text-align: right; padding: 2px 0; font-weight: 600;">${city.lead} µg/L</td>
                  <td style="text-align: right; padding: 2px 0; color: #9ca3af;">10</td>
                  <td style="text-align: center; padding: 2px 0; color: ${leadStatus.color};">${leadStatus.label}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>`
      );

      new mapboxgl.Marker(el)
        .setLngLat(city.coords)
        .setPopup(popup)
        .addTo(map.current!);
    });

    map.current.on('move', () => {
      if (map.current) {
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setZoom(Number(map.current.getZoom().toFixed(2)));
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [showWaterSources]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapContainer} className="h-[50vh] md:h-[70vh] w-full rounded-lg" />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-gray-700">
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="text-xs font-medium text-gray-700">{waterQualityData.length} villes surveillées</div>
          </div>
          {!showWaterSources && (
            <div className="absolute bottom-4 right-4 bg-gray-600/90 backdrop-blur-sm rounded-lg p-2 shadow-lg text-white">
              <div className="text-xs">Zones masquées</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
