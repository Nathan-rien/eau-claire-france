import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { getRoutesByRetailer, getRetailerList, DistributorRoute } from '@/data/waterDistributors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Create a curved arc between two points
function createArc(start: [number, number], end: [number, number], steps = 50): [number, number][] {
  const coords: [number, number][] = [];
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offsetLat = midLat + dist * 0.15;
  const offsetLng = midLng - (dy * 0.08);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const lng = u * u * start[0] + 2 * u * t * offsetLng + t * t * end[0];
    const lat = u * u * start[1] + 2 * u * t * offsetLat + t * t * end[1];
    coords.push([lng, lat]);
  }
  return coords;
}

const WaterJourneyMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animFrameRef = useRef<number>(0);
  const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const { t } = useLanguage();

  const retailers = getRetailerList();

  // Initialize map
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

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      markersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render routes when filter or map changes
  const renderRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    cancelAnimationFrame(animFrameRef.current);

    // Remove previous layers/sources
    const existingLayers = map.getStyle().layers || [];
    existingLayers.forEach(layer => {
      if (layer.id.startsWith('journey-')) {
        map.removeLayer(layer.id);
      }
    });
    const sources = Object.keys(map.getStyle().sources || {});
    sources.forEach(src => {
      if (src.startsWith('journey-')) {
        map.removeSource(src);
      }
    });

    // Remove animated drop layers/sources
    if (map.getLayer('journey-drops')) map.removeLayer('journey-drops');
    if (map.getSource('journey-drops')) map.removeSource('journey-drops');

    const routes = getRoutesByRetailer(selectedRetailer);

    // Collect unique sources to avoid duplicate markers
    const addedSources = new Set<string>();
    const allArcs: [number, number][][] = [];

    routes.forEach((route, routeIdx) => {
      const srcKey = `${route.source.name}-${route.source.lat}`;

      // Source marker
      if (!addedSources.has(srcKey)) {
        addedSources.add(srcKey);
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg cursor-pointer';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
        el.title = route.source.name;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold text-sm">${route.source.name}</h3>
            <p class="text-xs text-gray-500">${route.source.category}</p>
            <p class="text-xs mt-1">${route.mddBrand}</p>
            <p class="text-xs text-blue-600 font-medium">${route.retailer}</p>
          </div>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([route.source.lng, route.source.lat])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);
      }

      // Commune markers + arcs
      route.communes.forEach((commune, commIdx) => {
        const communeKey = `commune-${commune.name}-${routeIdx}`;
        
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md cursor-pointer';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>';
        el.title = commune.name;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold text-sm">${commune.name}</h3>
            <p class="text-xs text-gray-500">${commune.context}</p>
            <p class="text-xs mt-1">Source : ${route.source.name}</p>
            <p class="text-xs text-blue-600 font-medium">${route.retailer} — ${route.mddBrand}</p>
          </div>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(commune.coordinates)
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);

        // Arc line
        const arcId = `journey-arc-${routeIdx}-${commIdx}`;
        const arcCoords = createArc(
          [route.source.lng, route.source.lat],
          commune.coordinates,
        );
        allArcs.push(arcCoords);

        map.addSource(arcId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: arcCoords },
          },
        });

        // Background line
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

        // Animated dash line
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
      });
    });

    // Animate dashes
    let dashOffset = 0;
    function animateDash() {
      dashOffset = (dashOffset + 0.15) % 7;
      const phase = dashOffset;

      routes.forEach((route, routeIdx) => {
        route.communes.forEach((_, commIdx) => {
          const layerId = `journey-arc-${routeIdx}-${commIdx}-anim`;
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-dasharray', [
              phase, 4 - phase * 0.3, 3 + phase * 0.3,
            ]);
          }
        });
      });

      animFrameRef.current = requestAnimationFrame(animateDash);
    }

    animateDash();
  }, [selectedRetailer, mapLoaded]);

  useEffect(() => {
    renderRoutes();
  }, [renderRoutes]);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('waterJourney.filterLabel')}</span>
        </div>
        <Select value={selectedRetailer} onValueChange={setSelectedRetailer}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t('waterJourney.allDistributors')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('waterJourney.allDistributors')}</SelectItem>
            {retailers.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          {t('waterJourney.legendSource')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          {t('waterJourney.legendCommune')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-blue-600 inline-block" />
          {t('waterJourney.legendRoute')}
        </span>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-[600px] rounded-xl border overflow-hidden shadow-sm" />
    </div>
  );
};

export default WaterJourneyMap;
