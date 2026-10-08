import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, RefreshCw, Trash2, Check, X, Download, Loader2 } from 'lucide-react';
import {
  WaterPoint,
  WaterPointModeration,
  WaterPointType,
  WATER_POINT_TYPES,
  WATER_POINT_TYPE_META,
  MODERATION_META,
  POTABILITE_META,
  SOURCE_DONNEE_LABEL,
  signWaterPointPhotos,
} from '@/data/waterPoints';
import LazyWaterPointsMap from './LazyWaterPointsMap';
import { OSM_IMPORT_GRID, OSM_IMPORT_STORAGE_KEY, readOsmImportProgress, remainingOsmTiles, osmRetryDelay, osmTileStatus } from './osmImportProgress';
import { Progress } from '@/components/ui/progress';

type StatusFilter = WaterPointModeration | 'all';
type TypeFilter = WaterPointType | 'all';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validés' },
  { value: 'rejete', label: 'Rejetés' },
  { value: 'all', label: 'Tous' },
];

const WaterPointsAdmin: React.FC = () => {
  const [points, setPoints] = useState<WaterPoint[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('en_attente');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(readOsmImportProgress);
  const stopImport = useRef(false);
  const importRunning = useRef(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(timer); stopImport.current = true; };
  }, []);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('water_points')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (statusFilter !== 'all') query = query.eq('statut_moderation', statusFilter);
    if (typeFilter !== 'all') query = query.eq('type', typeFilter);

    const { data, error } = await query;
    if (error) {
      console.error('Water points admin load error:', error);
      toast({
        title: 'Chargement impossible',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    const list = (data || []) as WaterPoint[];
    setPoints(list);
    setPhotoUrls(await signWaterPointPhotos(list));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const setStatus = async (id: string, statut: WaterPointModeration) => {
    const { error } = await supabase
      .from('water_points')
      .update({
        statut_moderation: statut,
        derniere_verification_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Action impossible',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: statut === 'valide' ? 'Point publié' : 'Point rejeté',
    });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('water_points').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Suppression impossible',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Point supprimé' });
    load();
  };

  const importOsm = async (automatic = false) => {
    if (importRunning.current) return;
    const ok = automatic || window.confirm(
      "Lancer l'import des points d'eau OpenStreetMap pour la France ? " +
        "L'opération peut prendre plusieurs minutes."
    );
    if (!ok) return;

    importRunning.current = true;
    stopImport.current = false;
    setImporting(true);
    const progress = { ...importProgress, completed: [...importProgress.completed], failed: { ...importProgress.failed } };
    progress.autoResume = true;
    const persist = () => {
      setImportProgress({ ...progress, completed: [...progress.completed], failed: { ...progress.failed } });
      try { localStorage.setItem(OSM_IMPORT_STORAGE_KEY, JSON.stringify(progress)); } catch { /* UI progress still works without storage. */ }
    };
    const wait = async (ms: number) => {
      progress.retryAt = Date.now() + ms;
      persist();
      while (!stopImport.current && Date.now() < progress.retryAt) {
        await new Promise(r => setTimeout(r, Math.min(250, progress.retryAt - Date.now())));
      }
      progress.retryAt = null;
      persist();
    };
    try {
      persist();
      if (progress.retryAt && progress.retryAt > Date.now()) await wait(progress.retryAt - Date.now());
      // Initial pass plus three bounded automatic recovery passes.
      for (let round = 0; round < 4 && !stopImport.current; round++) {
      for (const tile of remainingOsmTiles(progress)) {
        if (stopImport.current) break;
        progress.currentTile = tile;
        persist();
        let succeeded = false;
        for (let attempt = 0; attempt < 3 && !stopImport.current; attempt++) {
          progress.requests++;
          const res = await supabase.functions.invoke('admin-import-osm-water-points', { body: { grid: OSM_IMPORT_GRID, tile_start: tile, attempt } });
          let data = res.data;
          const context = res.error && 'context' in res.error ? res.error.context : undefined;
          if (!data && context instanceof Response) {
            try { data = await context.clone().json(); } catch { /* Keep the transport error below. */ }
          }
          if (!res.error && data?.ok) {
            succeeded = true;
            progress.requestSuccesses++;
            progress.completed.push(tile);
            delete progress.failed[String(tile)];
            progress.created += data.created ?? 0;
            progress.updated += data.updated ?? 0;
            progress.received += data.total_received ?? 0;
            persist();
            break;
          }
          const status = context instanceof Response ? context.status : undefined;
          progress.failed[String(tile)] = `${data?.error_code || (status ? `HTTP ${status}` : 'réseau')} : ${data?.error || res.error?.message || 'Erreur inconnue'}`;
          persist();
          if (status === 401 || status === 403 || data?.retryable === false) {
            throw new Error(progress.failed[String(tile)]);
          }
          if (attempt < 2) await wait(osmRetryDelay(attempt, data?.retry_after_ms ?? 0));
        }
        // An exhausted zone remains in the queue; do not abort all other zones.
        if (!succeeded) persist();
        progress.currentTile = null;
        persist();
        // Refresh public-point preview after each successful sector.
        if (succeeded && !stopImport.current) await load();
        if (!stopImport.current) await new Promise(r => setTimeout(r, 1100));
      }
      if (!remainingOsmTiles(progress).length) break;
      if (round < 3 && !stopImport.current) await wait(30000 * 2 ** round);
      }
      toast({ title: stopImport.current ? 'Import en pause' : Object.keys(progress.failed).length ? 'Import partiel' : 'Import terminé', description: `${progress.completed.length}/${OSM_IMPORT_GRID ** 2} zones réussies, ${Object.keys(progress.failed).length} en échec. ${progress.created} créés, ${progress.updated} mis à jour.` });
    } catch (error) {
      toast({ title: 'Import interrompu', description: error instanceof Error ? error.message : 'Erreur inattendue', variant: 'destructive' });
    } finally {
      progress.autoResume = false;
      progress.currentTile = null;
      progress.retryAt = null;
      persist();
      importRunning.current = false;
      setImporting(false);
      load();
    }
  };

  useEffect(() => {
    if (importProgress.autoResume && !importRunning.current && remainingOsmTiles(importProgress).length) {
      void importOsm(true);
    }
    // Resume only an import explicitly started previously in this browser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapPoints = useMemo(
    () => points.filter((p) => Number.isFinite(p.latitude)),
    [points]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Zone d&apos;Eau — modération des points d&apos;eau
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void importOsm()}
            disabled={importing || importProgress.completed.length === OSM_IMPORT_GRID ** 2}
            className="min-h-[44px] md:min-h-0"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {importProgress.completed.length || Object.keys(importProgress.failed).length ? 'Reprendre l’import OpenStreetMap' : 'Importer depuis OpenStreetMap'}
          </Button>
          {importing && <Button variant="outline" onClick={() => { stopImport.current = true; }}>Mettre en pause</Button>}
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            className="min-h-[44px] md:min-h-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {(importing || importProgress.requests > 0) && (
          <div role="status" className="text-sm text-muted-foreground space-y-2">
            <p>{importProgress.completed.length}/{OSM_IMPORT_GRID ** 2} zones réussies ({Math.round(importProgress.completed.length / OSM_IMPORT_GRID ** 2 * 100)} % du périmètre) · {Object.keys(importProgress.failed).length} zones en échec</p>
            <p>{importProgress.created} créés · {importProgress.updated} mis à jour · Succès des requêtes : {importProgress.requests ? Math.round(importProgress.requestSuccesses / importProgress.requests * 100) : 0} %</p>
            <Progress value={importProgress.completed.length / OSM_IMPORT_GRID ** 2 * 100} aria-label="Secteurs OpenStreetMap traités" />
            <p>{importProgress.currentTile !== null ? `Zone ${importProgress.currentTile + 1} en cours` : importing ? 'Import en cours' : 'Import arrêté'}{importProgress.retryAt && importing ? ` · Reprise automatique dans ${Math.max(0, Math.ceil((importProgress.retryAt - now) / 1000))} s` : ''} · {remainingOsmTiles(importProgress).length - Object.keys(importProgress.failed).filter(tile => !importProgress.completed.includes(Number(tile))).length} zones en attente</p>
            <div className="flex flex-wrap gap-3" aria-hidden="true"><span>✓ Traitée</span><span>↻ En cours</span><span>! En échec</span><span>· En attente</span></div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1" aria-label="État des 256 secteurs">
              {Array.from({ length: OSM_IMPORT_GRID ** 2 }, (_, tile) => {
                const status = osmTileStatus(importProgress, tile);
                const labels = { completed: 'Traitée', running: 'En cours', failed: 'En échec', pending: 'En attente' };
                const symbols = { completed: '✓', running: '↻', failed: '!', pending: '·' };
                const classes = { completed: 'bg-primary/15 text-primary border-primary/30', running: 'bg-secondary text-secondary-foreground border-primary', failed: 'bg-destructive/10 text-destructive border-destructive/30', pending: 'bg-muted text-muted-foreground border-border' };
                return <div key={tile} title={`Zone ${tile + 1} — ${labels[status]}${importProgress.failed[String(tile)] ? ` : ${importProgress.failed[String(tile)]}` : ''}`} aria-label={`Zone ${tile + 1} : ${labels[status]}`} className={`aspect-square min-w-0 flex items-center justify-center rounded border text-xs ${classes[status]}`}>{symbols[status]}</div>;
              })}
            </div>
            {Object.keys(importProgress.failed).length > 0 && <details><summary>Erreurs à reprendre</summary><ul className="mt-2 space-y-1">{Object.entries(importProgress.failed).map(([tile, error]) => <li key={tile}>Zone {Number(tile) + 1} : {error}</li>)}</ul></details>}
          </div>
        )}
        {/* Filtres */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={statusFilter === f.value ? 'default' : 'outline'}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
              onClick={() => setTypeFilter('all')}
            >
              Tous les types
            </Button>
            {WATER_POINT_TYPES.map((tp) => (
              <Button
                key={tp}
                size="sm"
                variant={typeFilter === tp ? 'secondary' : 'ghost'}
                onClick={() => setTypeFilter(tp)}
              >
                {WATER_POINT_TYPE_META[tp].short}
              </Button>
            ))}
          </div>
        </div>

        {/* Prévisualisation carte */}
        {mapPoints.length > 0 && (
          <LazyWaterPointsMap
            points={mapPoints}
            photoUrls={photoUrls}
            height={320}
          />
        )}

        {/* Liste */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : points.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun point d&apos;eau pour ce filtre.
          </p>
        ) : (
          <div className="space-y-3">
            {points.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-border p-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: WATER_POINT_TYPE_META[p.type]?.color,
                        color: WATER_POINT_TYPE_META[p.type]?.color,
                      }}
                    >
                      {WATER_POINT_TYPE_META[p.type]?.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={MODERATION_META[p.statut_moderation]?.badgeClass}
                    >
                      {MODERATION_META[p.statut_moderation]?.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        POTABILITE_META[p.statut_potabilite]?.badgeClass
                      }
                    >
                      {POTABILITE_META[p.statut_potabilite]?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {SOURCE_DONNEE_LABEL[p.source_donnee]}
                    </span>
                  </div>

                  {photoUrls[p.id] && (
                    <img
                      src={photoUrls[p.id]}
                      alt=""
                      className="mb-2 max-h-40 rounded-md object-cover"
                    />
                  )}

                  {p.description && (
                    <p className="text-sm text-foreground">{p.description}</p>
                  )}
                  {p.accessibilite && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Accès : {p.accessibilite}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)} ·{' '}
                    {new Date(p.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:flex-col">
                  {p.statut_moderation !== 'valide' && (
                    <Button
                      size="sm"
                      onClick={() => setStatus(p.id, 'valide')}
                      className="min-h-[44px] md:min-h-0"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Publier
                    </Button>
                  )}
                  {p.statut_moderation !== 'rejete' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus(p.id, 'rejete')}
                      className="min-h-[44px] md:min-h-0"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(p.id)}
                    className="min-h-[44px] md:min-h-0"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaterPointsAdmin;
