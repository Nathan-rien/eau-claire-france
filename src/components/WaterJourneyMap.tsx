import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { getRoutesByRetailer, getRetailerList, getIndustrialSteps } from '@/data/waterDistributors';
import type { IndustrialStep } from '@/data/waterDistributors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, MapPin, Droplets, FlaskConical, Filter, Package, Warehouse, Truck, Factory, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Journey steps for the timeline (not on the map)
const JOURNEY_STEPS = [
  {
    name: 'Captage',
    description: 'Puisage de l\'eau à la source naturelle',
    duration: 'Continu',
    icon: Droplets,
    color: 'hsl(var(--primary))',
    bgClass: 'bg-primary',
    textClass: 'text-primary',
  },
  {
    name: 'Analyse & contrôle',
    description: 'Analyses bactériologiques et physico-chimiques',
    duration: '24-72h',
    icon: FlaskConical,
    color: '#60a5fa',
    bgClass: 'bg-blue-400',
    textClass: 'text-blue-400',
  },
  {
    name: 'Traitement & filtration',
    description: 'Filtration, ozonation, UV selon la source',
    duration: '2-6h',
    icon: Filter,
    color: '#3b82f6',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-500',
  },
  {
    name: 'Embouteillage',
    description: 'Remplissage, bouchage, étiquetage, mise en pack',
    duration: '~0.5s/bouteille',
    icon: Package,
    color: '#8b5cf6',
    bgClass: 'bg-violet-500',
    textClass: 'text-violet-500',
  },
  {
    name: 'Stockage & expédition',
    description: 'Palettisation, contrôle lot, chargement',
    duration: '1-3 jours',
    icon: Warehouse,
    color: '#f59e0b',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-500',
  },
  {
    name: 'Transport & distribution',
    description: 'Acheminement vers plateformes puis magasins',
    duration: '1-5 jours',
    icon: Truck,
    color: '#22c55e',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
  },
];

// Industrial step types in order, matching JOURNEY_STEPS indices 1-5
const INDUSTRIAL_STEP_TYPES = ['analyse', 'traitement', 'embouteillage', 'stockage', 'logistique'];

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

interface SelectedSource {
  name: string;
  category: string;
  retailers: { retailer: string; brand: string; communeCount: number }[];
}

// SVG icons for industrial markers
const STEP_ICONS: Record<string, { svg: string; color: string }> = {
  analyse: {
    color: '#60a5fa',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/></svg>',
  },
  traitement: {
    color: '#3b82f6',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  },
  embouteillage: {
    color: '#8b5cf6',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  },
  stockage: {
    color: '#f59e0b',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>',
  },
  logistique: {
    color: '#22c55e',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  },
};

// Inject pulse keyframes once
const PULSE_STYLE_ID = 'industrial-pulse-style';
if (typeof document !== 'undefined' && !document.getElementById(PULSE_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes industrialPulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
      50% { transform: scale(1.4); box-shadow: 0 0 0 8px transparent; }
      100% { transform: scale(1.2); box-shadow: 0 0 0 0 transparent; }
    }
    .industrial-pulse .industrial-inner {
      animation: industrialPulse 0.6s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

const WaterJourneyMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sourceMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const communeMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const industrialMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const communesInitRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const showCommunesRef = useRef(false);
  const showIndustrialRef = useRef(false);
  const animTimeoutRefs = useRef<number[]>([]);

  const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
  const [showCommunes, setShowCommunes] = useState(false);
  const [showIndustrial, setShowIndustrial] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [highlightedStepType, setHighlightedStepType] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SelectedSource | null>(null);
  const [animatingSource, setAnimatingSource] = useState<string | null>(null);
  const { t } = useLanguage();

  const retailers = getRetailerList();

  // Cancel any running animation sequence
  const cancelAnimation = useCallback(() => {
    animTimeoutRefs.current.forEach(id => clearTimeout(id));
    animTimeoutRefs.current = [];
    setAnimatingSource(null);
  }, []);

  // Start sequential animation for a given source key
  const startIndustrialAnimation = useCallback((srcKey: string) => {
    cancelAnimation();
    setAnimatingSource(srcKey);

    // Dim all markers for this source initially
    industrialMarkersRef.current.forEach(m => {
      const el = m.getElement();
      if (el.dataset.sourceKey === srcKey) {
        el.style.opacity = '0.3';
        el.classList.remove('industrial-pulse');
        const inner = el.querySelector('.industrial-inner') as HTMLElement | null;
        if (inner) inner.style.transform = '';
      }
    });

    // Animate the source marker (step 0 = Captage)
    setActiveStep(0);

    // Then animate each industrial step sequentially
    INDUSTRIAL_STEP_TYPES.forEach((stepType, i) => {
      const timeoutId = window.setTimeout(() => {
        // Update timeline
        setActiveStep(i + 1);

        // Find and pulse the matching marker
        industrialMarkersRef.current.forEach(m => {
          const el = m.getElement();
          if (el.dataset.sourceKey === srcKey && el.dataset.stepType === stepType) {
            el.style.opacity = '1';
            el.classList.remove('industrial-pulse');
            // Force reflow to restart animation
            void el.offsetWidth;
            el.classList.add('industrial-pulse');
          }
        });

        // Animate line segment: add to the anim GeoJSON source
        const map = mapRef.current;
        if (map) {
          const animSrc = map.getSource('industrial-anim-lines') as mapboxgl.GeoJSONSource | undefined;
          if (animSrc) {
            // Get current features and add the next segment
            const currentData = (animSrc as any)._data as GeoJSON.FeatureCollection;
            const allSegments = (map.getSource('industrial-lines-data') as any)?._segments?.[srcKey];
            if (allSegments && allSegments[i]) {
              const updated: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: [...(currentData?.features || []), allSegments[i]],
              };
              animSrc.setData(updated);
            }
          }
        }
      }, (i + 1) * 600);
      animTimeoutRefs.current.push(timeoutId);
    });

    // End animation after all steps
    const endTimeout = window.setTimeout(() => {
      // Clean up: remove anim layer, reset markers to normal
      const map = mapRef.current;
      if (map) {
        const animSrc = map.getSource('industrial-anim-lines') as mapboxgl.GeoJSONSource | undefined;
        if (animSrc) {
          animSrc.setData({ type: 'FeatureCollection', features: [] });
        }
      }
      industrialMarkersRef.current.forEach(m => {
        const el = m.getElement();
        if (el.dataset.sourceKey === srcKey) {
          el.style.opacity = '1';
          el.classList.remove('industrial-pulse');
        }
      });
      setActiveStep(null);
      setAnimatingSource(null);
    }, (INDUSTRIAL_STEP_TYPES.length + 1) * 600 + 400);
    animTimeoutRefs.current.push(endTimeout);
  }, [cancelAnimation]);

  useEffect(() => {
    showCommunesRef.current = showCommunes;
  }, [showCommunes]);

  useEffect(() => {
    showIndustrialRef.current = showIndustrial;
  }, [showIndustrial]);

  // Cancel animation when toggling industrial off or changing retailer
  useEffect(() => {
    cancelAnimation();
    setActiveStep(null);
  }, [showIndustrial, selectedRetailer, cancelAnimation]);

  // Toggle commune markers + arc layers visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (showCommunes && !communesInitRef.current) {
      communesInitRef.current = true;
      const routes = getRoutesByRetailer(selectedRetailer);
      routes.forEach((route) => {
        route.communes.forEach((commune) => {
          const el = document.createElement('div');
          el.className = 'flex items-center justify-center w-4 h-4';
          const communeInner = document.createElement('div');
          communeInner.className = 'w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md cursor-pointer transition-shadow hover:shadow-lg hover:shadow-emerald-500/30';
          communeInner.style.transformOrigin = 'center center';
          el.appendChild(communeInner);
          el.title = commune.name;

          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold text-sm">${commune.name}</h3>
              <p class="text-xs text-gray-500">${commune.context}</p>
              <p class="text-xs mt-1">Source : ${route.source.name}</p>
              <p class="text-xs text-blue-600 font-medium">${route.retailer} — ${route.mddBrand}</p>
            </div>`
          );

         const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat(commune.coordinates)
            .setPopup(popup)
            .addTo(map);
          communeMarkersRef.current.push(marker);
        });
      });
    }

    communeMarkersRef.current.forEach(m => {
      m.getElement().style.display = showCommunes ? '' : 'none';
    });

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
    map.on('load', () => setMapLoaded(true));
    mapRef.current = map;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimation();
      sourceMarkersRef.current.forEach(m => m.remove());
      communeMarkersRef.current.forEach(m => m.remove());
      industrialMarkersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render routes
  const renderRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    sourceMarkersRef.current.forEach(m => m.remove());
    sourceMarkersRef.current = [];
    communeMarkersRef.current.forEach(m => m.remove());
    communeMarkersRef.current = [];
    communesInitRef.current = false;
    cancelAnimationFrame(animFrameRef.current);

    ['journey-arcs-bg', 'journey-arcs-anim'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['journey-arcs'].forEach(id => {
      if (map.getSource(id)) map.removeSource(id);
    });

    const routes = getRoutesByRetailer(selectedRetailer);
    const addedSources = new Set<string>();
    const arcFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    routes.forEach((route) => {
      const srcKey = `${route.source.name}-${route.source.lat}`;

      if (!addedSources.has(srcKey)) {
        addedSources.add(srcKey);

        // Source marker — stable root + animated inner
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-8 h-8';
        el.style.zIndex = '10';
        const sourceInner = document.createElement('div');
        sourceInner.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-primary border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-primary/40';
        sourceInner.style.transformOrigin = 'center center';
        sourceInner.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
        el.appendChild(sourceInner);
        el.title = route.source.name;

        const retailersAtSource = routes
          .filter(r => `${r.source.name}-${r.source.lat}` === srcKey)
          .map(r => ({ retailer: r.retailer, brand: r.mddBrand, communeCount: r.communes.length }));

        // Capture srcKey for animation
        const capturedSrcKey = srcKey;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedSource({
            name: route.source.name,
            category: route.source.category,
            retailers: retailersAtSource,
          });
          // Trigger industrial animation if toggle is active
          if (showIndustrial) {
            startIndustrialAnimation(capturedSrcKey);
          }
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([route.source.lng, route.source.lat])
          .addTo(map);
        sourceMarkersRef.current.push(marker);
      }

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

    // Arc source + layers
    map.addSource('journey-arcs', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: arcFeatures },
    });

    map.addLayer({
      id: 'journey-arcs-bg',
      type: 'line',
      source: 'journey-arcs',
      layout: { visibility: showCommunes ? 'visible' : 'none' },
      paint: { 'line-color': '#93c5fd', 'line-width': 2, 'line-opacity': 0.3 },
    });

    map.addLayer({
      id: 'journey-arcs-anim',
      type: 'line',
      source: 'journey-arcs',
      layout: { visibility: showCommunes ? 'visible' : 'none' },
      paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-dasharray': [0, 4, 3] },
    });

    // Throttled animation ~7fps
    let dashOffset = 0;
    function animateDash(timestamp: number) {
      if (timestamp - lastFrameRef.current < 150) {
        animFrameRef.current = requestAnimationFrame(animateDash);
        return;
      }
      lastFrameRef.current = timestamp;
      dashOffset = (dashOffset + 0.15) % 7;
      const da: [number, number, number] = [dashOffset, 4 - dashOffset * 0.3, 3 + dashOffset * 0.3];
      if (showCommunesRef.current && map.getLayer('journey-arcs-anim')) {
        map.setPaintProperty('journey-arcs-anim', 'line-dasharray', da);
      }
      animFrameRef.current = requestAnimationFrame(animateDash);
    }
    animFrameRef.current = requestAnimationFrame(animateDash);
  }, [selectedRetailer, mapLoaded, showCommunes, showIndustrial, startIndustrialAnimation]);

  useEffect(() => {
    renderRoutes();
  }, [renderRoutes]);

  // ── Industrial markers effect ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clean previous industrial markers + layers
    industrialMarkersRef.current.forEach(m => m.remove());
    industrialMarkersRef.current = [];
    ['industrial-lines-bg', 'industrial-anim-line'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['industrial-lines', 'industrial-anim-lines'].forEach(id => {
      if (map.getSource(id)) map.removeSource(id);
    });

    if (!showIndustrial) return;

    const routes = getRoutesByRetailer(selectedRetailer);
    const processedSources = new Set<string>();
    const lineFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    // Store segments per source key for animation
    const segmentsBySource: Record<string, GeoJSON.Feature<GeoJSON.LineString>[]> = {};
    const SEGMENT_COLORS = ['#60a5fa', '#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e'];

    routes.forEach((route) => {
      const srcKey = `${route.source.name}-${route.source.lat}`;
      if (processedSources.has(srcKey)) return;
      processedSources.add(srcKey);

      const steps = getIndustrialSteps(route.source.name, route.retailer);
      if (steps.length === 0) return;

      const lineCoords: [number, number][] = [[route.source.lng, route.source.lat]];
      const sourceSegments: GeoJSON.Feature<GeoJSON.LineString>[] = [];

      steps.forEach((step, stepIdx) => {
        lineCoords.push(step.coordinates);

        const icon = STEP_ICONS[step.type];
        if (!icon) return;

        const el = document.createElement('div');
        el.className = 'industrial-marker flex items-center justify-center w-6 h-6';
        el.dataset.stepType = step.type;
        el.dataset.sourceKey = srcKey;
        el.title = step.name;
        const inner = document.createElement('div');
        inner.className = 'industrial-inner flex items-center justify-center w-6 h-6 rounded-full border border-white/80 shadow-md cursor-pointer transition-all duration-200 hover:scale-125 hover:shadow-lg';
        inner.style.backgroundColor = icon.color;
        inner.style.transformOrigin = 'center center';
        inner.innerHTML = icon.svg;
        el.appendChild(inner);

        const popup = new mapboxgl.Popup({ offset: 12, maxWidth: '220px' }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold text-sm">${step.name}</h3>
            <p class="text-xs text-gray-500 mt-1">${step.description}</p>
            <p class="text-xs mt-1 font-medium" style="color:${icon.color}">${route.retailer} — ${route.mddBrand}</p>
          </div>`
        );

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(step.coordinates)
          .setPopup(popup)
          .addTo(map);
        industrialMarkersRef.current.push(marker);
      });

      // Build individual colored segments
      for (let i = 0; i < lineCoords.length - 1; i++) {
        const feature: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: { color: SEGMENT_COLORS[i] || '#a78bfa', sourceKey: srcKey },
          geometry: { type: 'LineString', coordinates: [lineCoords[i], lineCoords[i + 1]] },
        };
        lineFeatures.push(feature);
        sourceSegments.push(feature);
      }
      segmentsBySource[srcKey] = sourceSegments;
    });

    // Industrial connection lines (static dashed)
    if (lineFeatures.length > 0) {
      map.addSource('industrial-lines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: lineFeatures },
      });
      // Store segments for animation access
      (map.getSource('industrial-lines') as any)._segments = segmentsBySource;

      map.addLayer({
        id: 'industrial-lines-bg',
        type: 'line',
        source: 'industrial-lines',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.5,
          'line-opacity': 0.5,
          'line-dasharray': [4, 4],
        },
      });
    }

    // Animation overlay source + layer (initially empty)
    map.addSource('industrial-anim-lines', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    // Store ref for segment lookup
    (map.getSource('industrial-anim-lines') as any)._data = { type: 'FeatureCollection', features: [] };

    map.addLayer({
      id: 'industrial-anim-line',
      type: 'line',
      source: 'industrial-anim-lines',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3,
        'line-opacity': 0.8,
      },
    });
  }, [showIndustrial, selectedRetailer, mapLoaded]);

  // ── Highlight industrial markers when hovering timeline (only when not animating) ──
  useEffect(() => {
    if (animatingSource) return; // Don't override animation highlights
    const stepTypeMap: Record<number, string> = {
      1: 'analyse',
      2: 'traitement',
      3: 'embouteillage',
      4: 'stockage',
      5: 'logistique',
    };
    const newType = activeStep !== null ? stepTypeMap[activeStep] || null : null;
    setHighlightedStepType(newType);
  }, [activeStep, animatingSource]);

  useEffect(() => {
    if (animatingSource) return; // Animation manages its own marker styles
    industrialMarkersRef.current.forEach(m => {
      const el = m.getElement();
      const inner = el.querySelector('.industrial-inner') as HTMLElement | null;
      const type = el.dataset.stepType;
      if (!highlightedStepType) {
        el.style.opacity = '1';
        if (inner) inner.style.transform = '';
      } else if (type === highlightedStepType) {
        el.style.opacity = '1';
        if (inner) inner.style.transform = 'scale(1.3)';
      } else {
        el.style.opacity = '0.3';
        if (inner) inner.style.transform = '';
      }
    });
  }, [highlightedStepType, animatingSource]);

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-4 ml-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-muted-foreground" />
            <label htmlFor="toggle-industrial" className="text-sm font-medium cursor-pointer">
              Étapes industrielles
            </label>
            <Switch id="toggle-industrial" checked={showIndustrial} onCheckedChange={setShowIndustrial} />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <label htmlFor="toggle-communes" className="text-sm font-medium cursor-pointer">
              Communes desservies
            </label>
            <Switch id="toggle-communes" checked={showCommunes} onCheckedChange={setShowCommunes} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" />
          {t('bottleJourney.legendSource')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          {t('bottleJourney.legendStore')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-blue-500 inline-block" />
          {t('bottleJourney.legendRoute')}
        </span>
        {showIndustrial && (
          <>
            <span className="border-l border-border pl-4 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#60a5fa' }} />
              Analyse
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#3b82f6' }} />
              Traitement
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#8b5cf6' }} />
              Embouteillage
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#f59e0b' }} />
              Stockage
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#22c55e' }} />
              Logistique
            </span>
          </>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <div ref={mapContainer} className="w-full h-[600px] rounded-xl border overflow-hidden shadow-sm" />

        {/* Source detail panel */}
        {selectedSource && (
          <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border rounded-xl shadow-lg p-4 max-w-[280px] z-10 animate-in slide-in-from-left-2 fade-in duration-200">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground">{selectedSource.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedSource.category}</p>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {selectedSource.retailers.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium text-foreground">{r.retailer}</span>
                    <span className="text-muted-foreground ml-1">— {r.brand}</span>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap ml-2">
                    {r.communeCount} commune{r.communeCount > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Journey Timeline */}
      <TooltipProvider delayDuration={0}>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            Parcours de l'eau en bouteille
            {showIndustrial && !animatingSource && (
              <span className="text-[10px] font-normal text-muted-foreground ml-2">
                — survolez une étape pour la mettre en surbrillance sur la carte
              </span>
            )}
            {animatingSource && (
              <span className="text-[10px] font-normal text-primary ml-2 animate-pulse">
                — animation en cours…
              </span>
            )}
          </h3>
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-gradient-to-r from-primary via-violet-500 to-emerald-500 opacity-30" />

            {JOURNEY_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              return (
                <Tooltip key={step.name}>
                  <TooltipTrigger asChild>
                    <button
                      className="relative z-10 flex flex-col items-center gap-2 group focus:outline-none"
                      onMouseEnter={() => { if (!animatingSource) setActiveStep(index); }}
                      onMouseLeave={() => { if (!animatingSource) setActiveStep(null); }}
                      onClick={() => { if (!animatingSource) setActiveStep(isActive ? null : index); }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          isActive
                            ? 'scale-110 shadow-lg border-white'
                            : 'border-background hover:scale-105'
                        }`}
                        style={{ backgroundColor: step.color }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-medium text-center max-w-[90px] leading-tight transition-colors ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.name}
                      </span>
                      {isActive && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white animate-in fade-in zoom-in-95 duration-150"
                          style={{ backgroundColor: step.color }}
                        >
                          {step.duration}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    <p className="text-xs font-medium mt-1" style={{ color: step.color }}>{step.duration}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default WaterJourneyMap;
