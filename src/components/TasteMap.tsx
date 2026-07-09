import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import {
  REGION_CENTERS,
  TASTE_TAG_META,
  TasteTag,
  getDominantTag,
  getReportsForRegion,
  TASTE_REPORTS,
} from '@/data/tasteReports';


interface TasteMapProps {
  onSelectRegion?: (region: string | null) => void;
  selectedRegion?: string | null;
}

const TasteMap: React.FC<TasteMapProps> = ({ onSelectRegion, selectedRegion }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    MapboxSecurityService.configureMapbox(mapboxgl);
    map.current = new mapboxgl.Map(
      MapboxSecurityService.createSecureMapOptions(mapContainer.current)
    );
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => setReady(true));

    Object.entries(REGION_CENTERS).forEach(([region, coords]) => {
      const tag: TasteTag | null = getDominantTag(region);
      const reports = getReportsForRegion(region);
      const meta = tag ? TASTE_TAG_META[tag] : null;
      const color = meta ? meta.color : '#9ca3af';
      const bg = meta ? meta.bg : '#e5e7eb';

      const el = document.createElement('div');
      el.style.cssText = `
        width:34px;height:34px;cursor:pointer;
      `;
      const inner = document.createElement('div');
      inner.className = 'marker-inner';
      inner.style.cssText = `
        width:100%;height:100%;border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:700;font-size:12px;
        transition:transform .15s;
      `;
      inner.textContent = String(reports.length || '·');
      el.appendChild(inner);
      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.15)';
      });
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
      });


      const popupContent = `
        <div style="padding:8px;min-width:200px">
          <h3 style="font-weight:700;font-size:14px;margin:0 0 6px">${region}</h3>
          ${
            meta
              ? `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${bg};color:${color};font-size:11px;font-weight:600;margin-bottom:6px">${meta.label}</span>`
              : `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:600;margin-bottom:6px">Pas de tag dominant</span>`
          }
          <p style="font-size:12px;color:#475569;margin:4px 0 0">
            ${
              reports.length > 0
                ? `${reports.length} retour${reports.length > 1 ? 's' : ''} référencé${reports.length > 1 ? 's' : ''}`
                : 'Pas encore de retour référencé.'
            }
          </p>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 22, maxWidth: '280px' }).setHTML(
        popupContent
      );

      const marker = new mapboxgl.Marker(el, { anchor: 'center' })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectRegion) onSelectRegion(region);
      });

      // silence unused var warning
      void marker;
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="w-full rounded-lg overflow-hidden shadow-lg"
        style={{ height: '520px' }}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-xs font-semibold text-gray-700 mb-2">Perception dominante</p>
        <ul className="space-y-1">
          {(Object.keys(TASTE_TAG_META) as TasteTag[])
            .filter((t) => t !== 'national')
            .map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: TASTE_TAG_META[t].color }}
                />
                <span className="text-gray-700">{TASTE_TAG_META[t].label}</span>
              </li>
            ))}
          <li className="flex items-center gap-2 text-xs">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: '#9ca3af' }}
            />
            <span className="text-gray-700">Pas de donnée</span>
          </li>
        </ul>
      </div>

      {selectedRegion && (
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow-lg px-3 py-2 text-xs">
          <span className="text-gray-500">Région sélectionnée : </span>
          <span className="font-semibold text-gray-900">{selectedRegion}</span>
        </div>
      )}

      {(() => {
        const nationalCount = TASTE_REPORTS.filter((r) => r.region === null).length;
        const regionalCount = TASTE_REPORTS.filter((r) => r.region !== null).length;
        return (
          <div className="absolute top-3 right-14 bg-white/95 backdrop-blur rounded-lg shadow-lg px-3 py-2 text-xs max-w-[220px]">
            <p className="font-semibold text-gray-800 mb-1">
              {TASTE_REPORTS.length} retours référencés
            </p>
            <p className="text-gray-600">
              {regionalCount} régionaux · {nationalCount} études nationales
            </p>
            <p className="text-gray-400 mt-1 text-[10px] leading-tight">
              Les études nationales apparaissent dans le mur ci-dessous.
            </p>
          </div>
        );
      })()}

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 pointer-events-none">
          <span className="text-sm text-gray-500">Chargement…</span>
        </div>
      )}
    </div>
  );
};


export default TasteMap;
