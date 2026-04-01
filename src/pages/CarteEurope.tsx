import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEUWaterQuality, getScoreBadgeClass, EU_COUNTRY_COORDS, type EUCountryWaterQuality } from '@/services/europeWaterApi';
import { MapboxSecurityService } from '@/services/mapboxSecurityService';
import { Droplets, MapPin, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapLoader } from '@/components/ui/map-loader';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const SCORE_COLORS: Record<string, string> = {
  A: '#16a34a',
  B: '#eab308',
  C: '#dc2626',
};

interface EuropeMapSectionProps {
  data: EUCountryWaterQuality[];
  onSelectCountry: (code: string | null) => void;
  selectedCode: string | null;
}

const EuropeMapSection: React.FC<EuropeMapSectionProps> = ({ data, onSelectCountry, selectedCode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const openPopup = useCallback((country: EUCountryWaterQuality, map: mapboxgl.Map) => {
    popupRef.current?.remove();
    const coords = EU_COUNTRY_COORDS[country.countryCode];
    if (!coords) return;

    const popup = new mapboxgl.Popup({ offset: 15, maxWidth: '280px' })
      .setLngLat([coords[1], coords[0]])
      .setHTML(`
        <div style="font-family:system-ui;padding:4px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <strong style="font-size:15px">${country.countryName}</strong>
            <span style="background:${SCORE_COLORS[country.qualityScore] || '#888'};color:#fff;padding:1px 8px;border-radius:9999px;font-size:12px;font-weight:600">${country.qualityScore}</span>
          </div>
          <div style="font-size:13px;line-height:1.6;color:#444">
            <div><b>Conformité :</b> ${country.complianceRate}%</div>
            <div><b>Nitrates moy. :</b> ${country.nitrateAvg} mg/L</div>
            <div><b>Violations pesticides :</b> ${country.pesticideViolations}</div>
            <div><b>Violations plomb :</b> ${country.leadViolations}</div>
            <div><b>Violations bactéries :</b> ${country.bacteriaViolations}</div>
            <div><b>Population :</b> ${country.populationServedMillions}M</div>
          </div>
        </div>
      `)
      .addTo(map);

    popupRef.current = popup;
  }, []);

  useEffect(() => {
    if (!mapContainer.current || data.length === 0) return;

    MapboxSecurityService.configureMapbox(mapboxgl);

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10, 50],
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 8,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      data.forEach(country => {
        const coords = EU_COUNTRY_COORDS[country.countryCode];
        if (!coords) return;

        const color = SCORE_COLORS[country.qualityScore] || '#888';

        const el = document.createElement('div');
        el.style.cssText = `
          width:32px;height:32px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:#fff;
          transition:box-shadow 0.15s;
        `;
        el.textContent = country.countryCode;
        el.addEventListener('mouseenter', () => { el.style.boxShadow = `0 0 0 4px ${color}44, 0 4px 12px rgba(0,0,0,0.4)`; });
        el.addEventListener('mouseleave', () => { el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'; });
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectCountry(country.countryCode);
          openPopup(country, map);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([coords[1], coords[0]])
          .addTo(map);

        markersRef.current.push(marker);
      });
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [data, onSelectCountry, openPopup]);

  // Sync external selection with popup
  useEffect(() => {
    if (!mapRef.current || !selectedCode) return;
    const country = data.find(c => c.countryCode === selectedCode);
    if (country) openPopup(country, mapRef.current);
  }, [selectedCode, data, openPopup]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[500px] md:h-[600px]" />
        <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-t border-border">
          <span className="font-medium">Légende :</span>
          {Object.entries(SCORE_COLORS).map(([score, color]) => (
            <span key={score} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
              Score {score}
            </span>
          ))}
          <span className="ml-auto">Taille ∝ population</span>
        </div>
      </CardContent>
    </Card>
  );
};

const CarteEurope: React.FC = () => {
  const [data, setData] = useState<EUCountryWaterQuality[]>([]);
  const [selected, setSelected] = useState<EUCountryWaterQuality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEUWaterQuality().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const handleSelectCountry = useCallback((code: string | null) => {
    if (!code) { setSelected(null); return; }
    const country = data.find(c => c.countryCode === code);
    setSelected(prev => prev?.countryCode === code ? null : country ?? null);
  }, [data]);

  const avgCompliance = data.length ? (data.reduce((s, c) => s + c.complianceRate, 0) / data.length).toFixed(1) : '—';
  const totalPop = data.reduce((s, c) => s + c.populationServedMillions, 0).toFixed(0);
  const countA = data.filter(c => c.qualityScore === 'A').length;

  return (
    <Layout>
      <SEOHead
        {...seoData.carteEurope}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🇪🇺</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Qualité de l'eau en Europe
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Données de conformité de l'eau potable dans les 27 pays de l'UE, basées sur la Directive Eau Potable (Drinking Water Directive) de l'Agence européenne pour l'environnement.
          </p>
          <Link to="/carte" className="text-sm text-primary hover:underline">
            ← Retour à la carte France
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Droplets className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{avgCompliance}%</div>
              <div className="text-xs text-muted-foreground">Conformité moyenne</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">27</div>
              <div className="text-xs text-muted-foreground">Pays analysés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{totalPop}M</div>
              <div className="text-xs text-muted-foreground">Population couverte</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{countA}</div>
              <div className="text-xs text-muted-foreground">Pays score A</div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Map */}
        <MapLoader loadOnInteraction={true} minHeight="500px">
          {!loading && (
            <EuropeMapSection
              data={data}
              onSelectCountry={handleSelectCountry}
              selectedCode={selected?.countryCode ?? null}
            />
          )}
        </MapLoader>

        {/* Country grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-32" />
              </Card>
            ))
          ) : (
            data
              .sort((a, b) => b.complianceRate - a.complianceRate)
              .map(country => (
                <Card
                  key={country.countryCode}
                  className={`cursor-pointer transition-all hover:shadow-md ${selected?.countryCode === country.countryCode ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelected(selected?.countryCode === country.countryCode ? null : country)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{country.countryName}</CardTitle>
                      <Badge className={getScoreBadgeClass(country.qualityScore)}>
                        {country.qualityScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conformité</span>
                      <span className="font-semibold text-foreground">{country.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${country.complianceRate}%`,
                          backgroundColor: SCORE_COLORS[country.qualityScore] || '#888',
                        }}
                      />
                    </div>
                    {selected?.countryCode === country.countryCode && (
                      <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t border-border mt-2">
                        <div className="flex justify-between"><span>Nitrates moy.</span><span>{country.nitrateAvg} mg/L</span></div>
                        <div className="flex justify-between"><span>Violations pesticides</span><span>{country.pesticideViolations}</span></div>
                        <div className="flex justify-between"><span>Violations plomb</span><span>{country.leadViolations}</span></div>
                        <div className="flex justify-between"><span>Violations bactéries</span><span>{country.bacteriaViolations}</span></div>
                        <div className="flex justify-between"><span>Population desservie</span><span>{country.populationServedMillions}M</span></div>
                        <div className="flex justify-between"><span>Zones d'approvisionnement</span><span>{country.waterSupplyZones.toLocaleString()}</span></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Source : EEA Waterbase – WISE Drinking Water Directive (DWD), rapport 2023. Données agrégées au niveau national.
        </p>
      </div>
    </Layout>
  );
};

export default CarteEurope;
