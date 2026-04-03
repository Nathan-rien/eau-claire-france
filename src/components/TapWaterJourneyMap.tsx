import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { getTapRoutesBySourceType, getUniqueSourceTypes, SOURCE_TYPE_LABELS, TAP_WATER_ROUTES, TapWaterRoute } from '@/data/tapWaterSources';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

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

const SOURCE_TYPE_COLORS: Record<string, string> = {
  nappe: '#2563eb',
  riviere: '#0891b2',
  lac: '#7c3aed',
  canal: '#ea580c',
};

const TapWaterJourneyMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
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
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      markersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const clearMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }

    try {
      const existingLayers = map.getStyle().layers || [];
      existingLayers.forEach(layer => {
        if (layer.id.startsWith('tap-')) map.removeLayer(layer.id);
      });
      const sources = Object.keys(map.getStyle().sources || {});
      sources.forEach(src => {
        if (src.startsWith('tap-')) map.removeSource(src);
      });
    } catch {
      // style may not be loaded
    }
  }, []);

  const renderOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    clearMap();

    const routes = getTapRoutesBySourceType(selectedType);

    routes.forEach((route) => {
      const commune = route.steps.find(s => s.type === 'commune') || route.steps[route.steps.length - 1];
      const sourceTypeColor = SOURCE_TYPE_COLORS[route.sourceType] || '#10b981';

      const el = document.createElement('div');
      el.className = 'flex flex-col items-center cursor-pointer group';
      el.style.cssText = 'pointer-events: auto;';

      const dot = document.createElement('div');
      dot.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-shadow duration-200';
      dot.style.backgroundColor = sourceTypeColor;
      dot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;

      const label = document.createElement('div');
      label.className = 'text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded bg-background/80 text-foreground shadow-sm whitespace-nowrap';
      label.textContent = route.city;

      el.appendChild(dot);
      el.appendChild(label);

      el.addEventListener('mouseenter', () => {
        dot.style.boxShadow = `0 0 0 4px ${sourceTypeColor}40`;
      });
      el.addEventListener('mouseleave', () => {
        dot.style.boxShadow = '';
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedRoute(route.id);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([commune.lng, commune.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [selectedType, mapLoaded, clearMap]);

  const renderDetail = useCallback((routeId: string) => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    clearMap();

    const route = TAP_WATER_ROUTES.find(r => r.id === routeId);
    if (!route) return;

    const { steps } = route;

    // Fit bounds to route
    const bounds = new mapboxgl.LngLatBounds();
    steps.forEach(s => bounds.extend([s.lng, s.lat]));
    map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 1200 });

    // Add markers
    steps.forEach((step, stepIdx) => {
      const color = STEP_COLORS[step.type];
      const size = step.type === 'commune' ? 'w-7 h-7' : 'w-5 h-5';
      const iconSize = step.type === 'commune' ? 14 : 12;

      const el = document.createElement('div');
      el.className = `flex items-center justify-center ${size} rounded-full border-2 border-white shadow-lg cursor-pointer`;
      el.style.backgroundColor = color;
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${STEP_ICONS[step.type]}</svg>`;

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
        const arcId = `tap-arc-${stepIdx}`;
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

    // Throttled animation at ~15fps
    let dashOffset = 0;
    animIntervalRef.current = setInterval(() => {
      dashOffset = (dashOffset + 0.15) % 7;
      steps.forEach((_, stepIdx) => {
        if (stepIdx >= steps.length - 1) return;
        const layerId = `tap-arc-${stepIdx}-anim`;
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-dasharray', [
            dashOffset, 4 - dashOffset * 0.3, 3 + dashOffset * 0.3,
          ]);
        }
      });
    }, 66);
  }, [mapLoaded, clearMap, language]);

  useEffect(() => {
    if (!mapLoaded) return;
    if (selectedRoute) {
      renderDetail(selectedRoute);
    } else {
      renderOverview();
      mapRef.current?.flyTo({ center: [2.5, 46.8], zoom: 5.2, duration: 800 });
    }
  }, [selectedRoute, renderOverview, renderDetail, mapLoaded]);

  // Re-render overview when filter changes (only in overview mode)
  useEffect(() => {
    if (!mapLoaded || selectedRoute) return;
    renderOverview();
  }, [selectedType, renderOverview, mapLoaded, selectedRoute]);

  const handleBack = () => setSelectedRoute(null);

  const activeRoute = selectedRoute ? TAP_WATER_ROUTES.find(r => r.id === selectedRoute) : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {selectedRoute ? (
          <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('tapJourney.backToOverview')}
          </Button>
        ) : (
          <>
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
          </>
        )}

        {activeRoute && (
          <span className="text-sm font-medium text-muted-foreground">
            {activeRoute.city} — {activeRoute.region}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        {selectedRoute ? (
          Object.entries(STEP_LABELS).map(([key, labels]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: STEP_COLORS[key] }} />
              {labels[language === 'en' ? 'en' : 'fr']}
            </span>
          ))
        ) : (
          Object.entries(SOURCE_TYPE_LABELS)
            .filter(([key]) => selectedType === 'all' || key === selectedType)
            .map(([key, labels]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: SOURCE_TYPE_COLORS[key] || '#10b981' }} />
                {labels[language === 'en' ? 'en' : 'fr']}
              </span>
            ))
        )}
        {selectedRoute && (
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-blue-600 inline-block" />
            {t('tapJourney.legendRoute')}
          </span>
        )}
      </div>

      {/* Hint */}
      {!selectedRoute && (
        <p className="text-xs text-muted-foreground italic">
          {language === 'en' ? 'Click a city to see its water journey' : 'Cliquez sur une ville pour voir le parcours de son eau'}
        </p>
      )}

      {/* Map */}
      <div ref={mapContainer} className="w-full h-[600px] rounded-xl border overflow-hidden shadow-sm" />
    </div>
  );
};

export default TapWaterJourneyMap;
