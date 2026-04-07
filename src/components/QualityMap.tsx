import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import {
  getFRRegionQuality,
  getFRPollutants,
  FR_REGION_COORDS,
  type FRRegionWaterQuality,
  type FRRegionPollutant,
} from '@/services/franceWaterApi';

interface RegionMapData {
  code: string;
  name: string;
  coords: [number, number];
  riskLevel: 'low' | 'medium' | 'high';
  qualityScore: string;
  complianceRate: number;
  populationMillions: number;
  communes: number;
  waterSupplyZones: number;
  pollutants: FRRegionPollutant[];
}

const QualityMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [regions, setRegions] = useState<RegionMapData[]>([]);

  useEffect(() => {
    Promise.all([getFRRegionQuality(), getFRPollutants()]).then(
      ([quality, pollutants]) => {
        const mapped: RegionMapData[] = quality
          .filter((q) => FR_REGION_COORDS[q.regionCode])
          .map((q) => {
            const risk: 'low' | 'medium' | 'high' =
              q.qualityScore === 'A'
                ? 'low'
                : q.qualityScore === 'B'
                ? 'medium'
                : 'high';
            return {
              code: q.regionCode,
              name: q.regionName,
              coords: FR_REGION_COORDS[q.regionCode],
              riskLevel: risk,
              qualityScore: q.qualityScore,
              complianceRate: q.complianceRate,
              populationMillions: q.populationMillions,
              communes: q.communes,
              waterSupplyZones: q.waterSupplyZones,
              pollutants: pollutants.filter(
                (p) => p.regionCode === q.regionCode
              ),
            };
          });
        setRegions(mapped);
      }
    );
  }, []);

  useEffect(() => {
    if (!mapContainer.current || regions.length === 0) return;

    MapboxSecurityService.configureMapbox(mapboxgl);

    const baseOpts = MapboxSecurityService.createSecureMapOptions(
      mapContainer.current
    );
    map.current = new mapboxgl.Map({
      ...baseOpts,
      center: [2.5, 46.5],
      zoom: 5.2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const getRiskColor = (r: string) =>
      r === 'low' ? '#10b981' : r === 'medium' ? '#f59e0b' : '#ef4444';

    regions.forEach((c) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width:32px;height:32px;border-radius:50%;
        background:${getRiskColor(c.riskLevel)};
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:10px;font-weight:700;color:white;
        transition:box-shadow .2s;
      `;
      el.textContent = c.code;
      el.addEventListener('mouseenter', () => {
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      });

      const riskLabel =
        c.riskLevel === 'low'
          ? 'Faible'
          : c.riskLevel === 'medium'
          ? 'Modéré'
          : 'Élevé';

      const pollutantRows = c.pollutants
        .sort((a, b) => b.exceedanceRatePct - a.exceedanceRatePct)
        .map(
          (p) =>
            `<tr>
              <td style="padding:2px 6px;font-size:12px">${p.pollutant}</td>
              <td style="padding:2px 6px;font-size:12px;text-align:right">${p.avgValue} ${p.unit}</td>
              <td style="padding:2px 6px;font-size:12px;text-align:right">${p.limitValue}</td>
              <td style="padding:2px 6px;font-size:12px;text-align:right;color:${p.exceedanceRatePct > 2 ? '#ef4444' : p.exceedanceRatePct > 1 ? '#f59e0b' : '#10b981'}">${p.exceedanceRatePct}%</td>
            </tr>`
        )
        .join('');

      const popup = new mapboxgl.Popup({ offset: 20, maxWidth: '340px' }).setHTML(
        `<div style="padding:8px">
          <h3 style="font-weight:700;font-size:15px;margin-bottom:4px">${c.name}</h3>
          <p style="font-size:12px;color:#666;margin-bottom:6px">
            Risque : <span style="color:${getRiskColor(c.riskLevel)};font-weight:600">${riskLabel}</span>
            · Conformité : ${c.complianceRate}%
          </p>
          ${
            c.pollutants.length > 0
              ? `<table style="width:100%;border-collapse:collapse">
                  <thead><tr style="border-bottom:1px solid #e5e7eb">
                    <th style="text-align:left;padding:2px 6px;font-size:11px;color:#888">Polluant</th>
                    <th style="text-align:right;padding:2px 6px;font-size:11px;color:#888">Moy.</th>
                    <th style="text-align:right;padding:2px 6px;font-size:11px;color:#888">Limite</th>
                    <th style="text-align:right;padding:2px 6px;font-size:11px;color:#888">Dép.</th>
                  </tr></thead>
                  <tbody>${pollutantRows}</tbody>
                </table>`
              : '<p style="font-size:12px;color:#999">Aucun polluant référencé</p>'
          }
        </div>`
      );

      el.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      new mapboxgl.Marker(el)
        .setLngLat([c.coords[1], c.coords[0]])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [regions]);

  const getRiskBadgeClass = (r: string) =>
    r === 'low'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : r === 'medium'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  const getRiskLabel = (r: string) =>
    r === 'low' ? 'Faible' : r === 'medium' ? 'Modéré' : 'Élevé';

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Légende des niveaux de risque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { level: 'low', label: 'Faible', desc: 'Polluants sous les seuils réglementaires', color: 'bg-green-500' },
              { level: 'medium', label: 'Modéré', desc: 'Présence de polluants à surveiller', color: 'bg-yellow-500' },
              { level: 'high', label: 'Élevé', desc: 'Dépassements ou polluants préoccupants', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.level} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm`}
                >
                  {item.level === 'high' ? '⚠️' : '●'}
                </div>
                <div>
                  <div className="font-medium text-xs md:text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Regional grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions
          .sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.riskLevel] - order[b.riskLevel];
          })
          .map((c) => (
            <Card key={c.code} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-lg">{c.name}</CardTitle>
                  <Badge className={getRiskBadgeClass(c.riskLevel)}>
                    {getRiskLabel(c.riskLevel)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Conformité</span>
                  <span className="font-medium">{c.complianceRate}%</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Population</span>
                  <span className="font-medium">{c.populationMillions} M</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Communes</span>
                  <span className="font-medium">{c.communes.toLocaleString()}</span>
                </div>
                <div className="text-xs md:text-sm">
                  <span className="text-muted-foreground">Polluants principaux :</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.pollutants.slice(0, 4).map((p) => (
                      <Badge key={p.pollutant} variant="outline" className="text-xs">
                        {p.pollutant}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Zones affectées</span>
                  <span className="font-medium">
                    {c.pollutants.reduce((s, p) => s + p.affectedZones, 0)}
                  </span>
                </div>
                {c.riskLevel === 'high' && (
                  <div className="flex items-center space-x-1 text-xs md:text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Région à surveiller</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Sources : Hub'Eau, ARS, Ministère de la Santé — Données 2024 (ordres de grandeur).
      </p>
    </div>
  );
};

export default QualityMap;
