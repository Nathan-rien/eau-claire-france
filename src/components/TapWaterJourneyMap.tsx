import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { getTapRoutesBySourceType, getUniqueSourceTypes, SOURCE_TYPE_LABELS, TapWaterRoute } from '@/data/tapWaterSources';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function createArc(start: [number, number], end: [number, number], steps = 50): [number, number][] {
  const coords: [number, number][] = [];
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offsetLat = midLat + dist * 0.12;
  const offsetLng = midLng - (dy * 0.06);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const lng = u * u * start[0] + 2 * u * t * offsetLng + t * t * end[0];
    const lat = u * u * start[1] + 2 * u * t * offsetLat + t * t * end[1];
    coords.push([lng, lat]);
  }
  return coords;
}

const STEP_COLORS: Record<string, string> = {
  captage: '#2563eb',
  traitement: '#f59e0b',
  reservoir: '#8b5cf6',
  commune: '#10b981',
};

const STEP_ICONS: Record<string, string> = {
  captage: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  traitement: '<rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  reservoir: '<path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 22h20"/><path d="M6 12h12"/>',
  commune: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
};

const STEP_LABELS: Record<string, { fr: string; en: string }> = {
  captage: { fr: 'Captage', en: 'Collection' },
  traitement: { fr: 'Traitement', en: 'Treatment' },
  reservoir: { fr: 'Réservoir', en: 'Reservoir' },
  commune: { fr: 'Commune', en: 'City' },
};

const TapWaterJourneyMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animFrameRef = useRef<number>(0);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const { t, language } = useLanguage();

  const sourceTypes = getUniqueSourceTypes();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    MapboxSecurityService.configureMapbox(mapboxgl);
    const config = MapboxSecurityService.getSecureMapConfig();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: config.style,
      center: [2.5, 46.8],
      zoom: 5.2,
      maxZoom: config.maxZoom,
      minZoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('load', () => setMapLoaded(true));
    mapRef.current = map;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      markersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const renderRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    cancelAnimationFrame(animFrameRef.current);

    const existingLayers = map.getStyle().layers || [];
    existingLayers.forEach(layer => {
      if (layer.id.startsWith('tap-')) map.removeLayer(layer.id);
    });
    const sources = Object.keys(map.getStyle().sources || {});
    sources.forEach(src => {
      if (src.startsWith('tap-')) map.removeSource(src);
    });

    const routes = getTapRoutesBySourceType(selectedType);

    routes.forEach((route, routeIdx) => {
      const { steps } = route;

      // Add markers for each step
      steps.forEach((step, stepIdx) => {
        const color = STEP_COLORS[step.type];
        const size = step.type === 'commune' ? 'w-7 h-7' : 'w-6 h-6';

        const el = document.createElement('div');
        el.className = `flex items-center justify-center ${size} rounded-full border-2 border-white shadow-lg cursor-pointer`;
        el.style.backgroundColor = color;
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${STEP_ICONS[step.type]}</svg>`;
        el.title = step.name;

        const stepLabel = STEP_LABELS[step.type][language === 'en' ? 'en' : 'fr'];
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:${color}">${stepLabel}</span>
            <h3 class="font-bold text-sm mt-0.5">${step.name}</h3>
            <p class="text-xs text-gray-500 mt-1">${step.description}</p>
            <p class="text-xs mt-1 font-medium">${route.city} — ${route.region}</p>
          </div>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([step.lng, step.lat])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);

        // Draw arc to next step
        if (stepIdx < steps.length - 1) {
          const next = steps[stepIdx + 1];
          const arcId = `tap-arc-${routeIdx}-${stepIdx}`;
          const arcCoords = createArc([step.lng, step.lat], [next.lng, next.lat]);

          map.addSource(arcId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: arcCoords },
            },
          });

          map.addLayer({
            id: `${arcId}-bg`,
            type: 'line',
            source: arcId,
            paint: {
              'line-color': '#93c5fd',
              'line-width': 2,
              'line-opacity': 0.3,
            },
          });

          map.addLayer({
            id: `${arcId}-anim`,
            type: 'line',
            source: arcId,
            paint: {
              'line-color': '#2563eb',
              'line-width': 3,
              'line-dasharray': [0, 4, 3],
            },
          });
        }
      });
    });

    // Animate
    let dashOffset = 0;
    function animateDash() {
      dashOffset = (dashOffset + 0.15) % 7;
      routes.forEach((route, routeIdx) => {
        route.steps.forEach((_, stepIdx) => {
          if (stepIdx >= route.steps.length - 1) return;
          const layerId = `tap-arc-${routeIdx}-${stepIdx}-anim`;
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-dasharray', [
              dashOffset, 4 - dashOffset * 0.3, 3 + dashOffset * 0.3,
            ]);
          }
        });
      });
      animFrameRef.current = requestAnimationFrame(animateDash);
    }
    animateDash();
  }, [selectedType, mapLoaded, language]);

  useEffect(() => {
    renderRoutes();
  }, [renderRoutes]);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('tapJourney.filterLabel')}</span>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t('tapJourney.allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tapJourney.allTypes')}</SelectItem>
            {sourceTypes.map(st => (
              <SelectItem key={st} value={st}>
                {SOURCE_TYPE_LABELS[st][language === 'en' ? 'en' : 'fr']}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        {Object.entries(STEP_LABELS).map(([key, labels]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: STEP_COLORS[key] }} />
            {labels[language === 'en' ? 'en' : 'fr']}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-blue-600 inline-block" />
          {t('tapJourney.legendRoute')}
        </span>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-[600px] rounded-xl border overflow-hidden shadow-sm" />
    </div>
  );
};

export default TapWaterJourneyMap;
