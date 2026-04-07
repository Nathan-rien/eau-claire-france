import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { getRoutesByRetailer, getRetailerList } from '@/data/waterDistributors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Journey steps definition
const JOURNEY_STEPS = [
  {
    name: 'Analyse & contrôle',
    description: 'Analyses bactériologiques et physico-chimiques',
    duration: '24-72h',
    color: '#60a5fa', // blue-400
    fraction: 0.10,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>',
  },
  {
    name: 'Traitement & filtration',
    description: 'Filtration, ozonation, UV selon la source',
    duration: '2-6h',
    color: '#3b82f6', // blue-500
    fraction: 0.25,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3 2 13l6 3"/><path d="M22 3 12 22l-4-6"/></svg>',
  },
  {
    name: 'Embouteillage',
    description: 'Remplissage, bouchage, étiquetage, mise en pack',
    duration: '~0.5s/bouteille',
    color: '#8b5cf6', // violet-500
    fraction: 0.40,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  },
  {
    name: 'Stockage & expédition',
    description: 'Palettisation, contrôle lot, chargement',
    duration: '1-3 jours',
    color: '#f59e0b', // amber-500
    fraction: 0.60,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  },
  {
    name: 'Transport & distribution',
    description: 'Acheminement vers plateformes puis magasins',
    duration: '1-5 jours',
    color: '#22c55e', // green-500
    fraction: 0.80,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  },
];

// Compute a point at fraction t along a short arc from source (north-east offset)
function getStepPosition(source: [number, number], t: number): [number, number] {
  const offsetDir: [number, number] = [0.6, 0.4]; // lng, lat offset direction
  const maxDist = 0.35; // degrees
  const lng = source[0] + offsetDir[0] * maxDist * t;
  const lat = source[1] + offsetDir[1] * maxDist * t;
  return [lng, lat];
}

// Optimised arc — 15 points for commune arcs
function createArc(start: [number, number], end: [number, number], steps = 15): [number, number][] {
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
  const sourceMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const stepMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const communeMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const communesInitRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const showCommunesRef = useRef(false);
  const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
  const [showCommunes, setShowCommunes] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { t } = useLanguage();

  const retailers = getRetailerList();

  // Keep ref in sync for animation loop access
  useEffect(() => {
    showCommunesRef.current = showCommunes;
  }, [showCommunes]);

  // Toggle commune markers + arc layers visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Lazy-create commune markers on first toggle
    if (showCommunes && !communesInitRef.current) {
      communesInitRef.current = true;
      const routes = getRoutesByRetailer(selectedRetailer);
      routes.forEach((route) => {
        route.communes.forEach((commune) => {
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
          communeMarkersRef.current.push(marker);
        });
      });
    }

    // Toggle marker visibility
    communeMarkersRef.current.forEach(m => {
      m.getElement().style.display = showCommunes ? '' : 'none';
    });

    // Toggle arc layers
    if (map.getLayer('journey-arcs-bg')) {
      map.setLayoutProperty('journey-arcs-bg', 'visibility', showCommunes ? 'visible' : 'none');
    }
    if (map.getLayer('journey-arcs-anim')) {
      map.setLayoutProperty('journey-arcs-anim', 'visibility', showCommunes ? 'visible' : 'none');
    }
  }, [showCommunes, mapLoaded, selectedRetailer]);

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
      sourceMarkersRef.current.forEach(m => m.remove());
      stepMarkersRef.current.forEach(m => m.remove());
      communeMarkersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render routes when filter or map changes
  const renderRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear previous markers
    sourceMarkersRef.current.forEach(m => m.remove());
    sourceMarkersRef.current = [];
    stepMarkersRef.current.forEach(m => m.remove());
    stepMarkersRef.current = [];
    communeMarkersRef.current.forEach(m => m.remove());
    communeMarkersRef.current = [];
    communesInitRef.current = false;
    cancelAnimationFrame(animFrameRef.current);

    // Remove previous layers/sources
    ['journey-arcs-bg', 'journey-arcs-anim', 'journey-steps-line'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['journey-arcs', 'journey-steps-lines'].forEach(id => {
      if (map.getSource(id)) map.removeSource(id);
    });

    const routes = getRoutesByRetailer(selectedRetailer);

    // Collect unique sources to avoid duplicate markers
    const addedSources = new Set<string>();
    // Build single FeatureCollection for ALL arcs
    const arcFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    routes.forEach((route) => {
      const srcKey = `${route.source.name}-${route.source.lat}`;

      // Source marker
      if (!addedSources.has(srcKey)) {
        addedSources.add(srcKey);
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg cursor-pointer';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
        el.title = route.source.name;

        const brandsAtSource = routes
          .filter(r => `${r.source.name}-${r.source.lat}` === srcKey)
          .map(r => `<p class="text-xs"><span class="text-blue-600 font-medium">${r.retailer}</span> — ${r.mddBrand}</p>`)
          .join('');

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold text-sm">${route.source.name}</h3>
            <p class="text-xs text-gray-500 mb-1">${route.source.category}</p>
            ${brandsAtSource}
          </div>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([route.source.lng, route.source.lat])
          .setPopup(popup)
          .addTo(map);
        sourceMarkersRef.current.push(marker);

        // Add journey step markers for this source
        const srcCoord: [number, number] = [route.source.lng, route.source.lat];
        JOURNEY_STEPS.forEach((step) => {
          const pos = getStepPosition(srcCoord, step.fraction);
          const stepEl = document.createElement('div');
          stepEl.className = 'flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-md cursor-pointer';
          stepEl.style.backgroundColor = step.color;
          stepEl.innerHTML = step.icon;
          stepEl.title = step.name;
          stepEl.addEventListener('click', (e) => e.stopPropagation());

          const stepPopup = new mapboxgl.Popup({ offset: 20 }).setHTML(
            `<div class="p-2 min-w-[180px]">
              <h3 class="font-bold text-sm">${step.name}</h3>
              <p class="text-xs text-gray-500 mt-1">${step.description}</p>
              <span class="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium text-white" style="background-color:${step.color}">${step.duration}</span>
            </div>`
          );

          const stepMarker = new mapboxgl.Marker({ element: stepEl })
            .setLngLat(pos)
            .setPopup(stepPopup)
            .addTo(map);
          stepMarkersRef.current.push(stepMarker);
        });
      }

      // Collect arc geometries (no markers yet — lazy)
      route.communes.forEach((commune) => {
        const arcCoords = createArc(
          [route.source.lng, route.source.lat],
          commune.coordinates,
        );
        arcFeatures.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: arcCoords },
        });
      });
    });

    // Single GeoJSON source for all arcs
    map.addSource('journey-arcs', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: arcFeatures },
    });

    // Background layer
    map.addLayer({
      id: 'journey-arcs-bg',
      type: 'line',
      source: 'journey-arcs',
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#93c5fd',
        'line-width': 2,
        'line-opacity': 0.3,
      },
    });

    // Animated layer
    map.addLayer({
      id: 'journey-arcs-anim',
      type: 'line',
      source: 'journey-arcs',
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#2563eb',
        'line-width': 3,
        'line-dasharray': [0, 4, 3],
      },
    });

    // Throttled RAF animation — ~7fps (150ms)
    let dashOffset = 0;
    function animateDash(timestamp: number) {
      if (timestamp - lastFrameRef.current < 150) {
        animFrameRef.current = requestAnimationFrame(animateDash);
        return;
      }
      lastFrameRef.current = timestamp;

      dashOffset = (dashOffset + 0.15) % 7;
      const da: [number, number, number] = [
        dashOffset,
        4 - dashOffset * 0.3,
        3 + dashOffset * 0.3,
      ];

      if (showCommunesRef.current && map.getLayer('journey-arcs-anim')) {
        map.setPaintProperty('journey-arcs-anim', 'line-dasharray', da);
      }

      animFrameRef.current = requestAnimationFrame(animateDash);
    }

    animFrameRef.current = requestAnimationFrame(animateDash);
  }, [selectedRetailer, mapLoaded]);

  useEffect(() => {
    renderRoutes();
  }, [renderRoutes]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('bottleJourney.filterLabel')}</span>
        </div>
        <Select value={selectedRetailer} onValueChange={setSelectedRetailer}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t('bottleJourney.allDistributors')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('bottleJourney.allDistributors')}</SelectItem>
            {retailers.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <label htmlFor="toggle-communes" className="text-sm font-medium cursor-pointer">
            Communes desservies
          </label>
          <Switch
            id="toggle-communes"
            checked={showCommunes}
            onCheckedChange={setShowCommunes}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          {t('bottleJourney.legendSource')}
        </span>
        {JOURNEY_STEPS.map((step) => (
          <span key={step.name} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: step.color }} />
            {step.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          {t('bottleJourney.legendStore')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-blue-600 inline-block" />
          {t('bottleJourney.legendRoute')}
        </span>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-[600px] rounded-xl border overflow-hidden shadow-sm" />
    </div>
  );
};

export default WaterJourneyMap;
