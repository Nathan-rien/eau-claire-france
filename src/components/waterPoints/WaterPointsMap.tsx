import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import {
  WaterPoint,
  WATER_POINT_TYPE_META,
  POTABILITE_META,
} from '@/data/waterPoints';

interface WaterPointsMapProps {
  points: WaterPoint[];
  photoUrls?: Record<string, string>;
  height?: number;
}

const SOURCE_ID = 'water-points';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const WaterPointsMap: React.FC<WaterPointsMapProps> = ({
  points,
  photoUrls = {},
  height = 560,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);

  const toGeoJson = (list: WaterPoint[]) => ({
    type: 'FeatureCollection' as const,
    features: list.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        type: p.type,
        color: WATER_POINT_TYPE_META[p.type]?.color ?? '#64748b',
        typeLabel: WATER_POINT_TYPE_META[p.type]?.label ?? 'Point d\u2019eau',
        description: p.description ?? '',
        accessibilite: p.accessibilite ?? '',
        potabilite: POTABILITE_META[p.statut_potabilite]?.label ?? '',
        photo: photoUrls[p.id] ?? '',
      },
    })),
  });

  // Init map once
  useEffect(() => {
    if (!mapContainer.current) return;

    MapboxSecurityService.configureMapbox(mapboxgl);
    map.current = new mapboxgl.Map(
      MapboxSecurityService.createSecureMapOptions(mapContainer.current)
    );
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource(SOURCE_ID, {
        type: 'geojson',
        data: toGeoJson(points),
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      map.current.addLayer({
        id: 'wp-clusters',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3b82f6',
          'circle-opacity': 0.85,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            22,
            50,
            30,
          ],
        },
      });

      map.current.addLayer({
        id: 'wp-cluster-count',
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      });

      map.current.addLayer({
        id: 'wp-unclustered',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 9,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Zoom into a cluster on click
      map.current.on('click', 'wp-clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['wp-clusters'],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId == null) return;
        const source = map.current!.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return;
          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point)
              .coordinates as [number, number],
            zoom,
          });
        });
      });

      map.current.on('click', 'wp-unclustered', (e) => {
        const f = e.features?.[0];
        if (!f || !map.current) return;
        const p = f.properties as Record<string, string>;
        const coords = (f.geometry as GeoJSON.Point).coordinates as [
          number,
          number
        ];
        const html = `
          <div style="padding:8px;min-width:210px;max-width:260px">
            <h3 style="font-weight:700;font-size:14px;margin:0 0 6px">${escapeHtml(
              p.typeLabel || ''
            )}</h3>
            ${
              p.photo
                ? `<img src="${p.photo}" alt="" style="width:100%;border-radius:6px;margin-bottom:6px" />`
                : ''
            }
            ${
              p.description
                ? `<p style="font-size:12px;color:#334155;margin:0 0 6px">${escapeHtml(
                    p.description
                  )}</p>`
                : ''
            }
            ${
              p.accessibilite
                ? `<p style="font-size:11px;color:#64748b;margin:0 0 6px"><strong>Accès :</strong> ${escapeHtml(
                    p.accessibilite
                  )}</p>`
                : ''
            }
            <p style="font-size:11px;color:#64748b;margin:0">${escapeHtml(
              p.potabilite || ''
            )}</p>
            <p style="font-size:10px;color:#94a3b8;margin:6px 0 0">Signalement communautaire, non vérifié officiellement.</p>
          </div>
        `;
        new mapboxgl.Popup({ offset: 14, maxWidth: '280px' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map.current);
      });

      ['wp-clusters', 'wp-unclustered'].forEach((layer) => {
        map.current!.on('mouseenter', layer, () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        map.current!.on('mouseleave', layer, () => {
          map.current!.getCanvas().style.cursor = '';
        });
      });

      loadedRef.current = true;
    });

    return () => {
      loadedRef.current = false;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep data in sync with filters
  useEffect(() => {
    if (!map.current || !loadedRef.current) return;
    const source = map.current.getSource(SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;
    source?.setData(toGeoJson(points) as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, photoUrls]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="w-full rounded-lg overflow-hidden shadow-lg"
        style={{ height: `${height}px` }}
      />
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-[220px]">
        <p className="text-xs font-semibold text-gray-700 mb-2">
          Types de points
        </p>
        <ul className="space-y-1">
          {Object.entries(WATER_POINT_TYPE_META).map(([key, meta]) => (
            <li key={key} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: meta.color }}
              />
              <span className="text-gray-700">{meta.short}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WaterPointsMap;
