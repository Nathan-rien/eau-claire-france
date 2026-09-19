import React, { useEffect, useMemo, useState } from 'react';
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

  const importOsm = async () => {
    const ok = window.confirm(
      "Lancer l'import des points d'eau OpenStreetMap pour la France ? " +
        "L'opération peut prendre plusieurs minutes."
    );
    if (!ok) return;

    setImporting(true);
    toast({
      title: 'Import OpenStreetMap lancé',
      description: 'Cela peut prendre plusieurs minutes, ne fermez pas la page.',
    });

    let nextTile: number | null = 0;
    let created = 0;
    let updated = 0;
    let received = 0;

    // L'import est découpé en lots de sous-zones : chaque appel avance la grille.
    while (nextTile !== null) {
      let data: {
        ok?: boolean;
        created?: number;
        updated?: number;
        total_received?: number;
        next_tile?: number | null;
        grid?: number;
        error?: string;
      } | null = null;
      let error: { message?: string } | null = null;

      // Une zone peut échouer (réseau, Overpass saturé) : on réessaie.
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await supabase.functions.invoke(
          'admin-import-osm-water-points',
          { body: { tile_start: nextTile } }
        );
        data = res.data;
        error = res.error;
        if (!error && data?.ok) break;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }

      if (error || !data?.ok) {
        setImporting(false);
        toast({
          title: 'Import interrompu',
          description: data?.error || error?.message || 'Erreur inconnue',
          variant: 'destructive',
        });
        load();
        return;
      }

      created += data.created ?? 0;
      updated += data.updated ?? 0;
      received += data.total_received ?? 0;
      nextTile = data.next_tile ?? null;

      if (nextTile !== null) {
        toast({
          title: 'Import en cours…',
          description: `${created} créés, ${updated} mis à jour (zone ${nextTile}/${(data.grid ?? 6) ** 2}).`,
        });
      }
    }

    setImporting(false);
    toast({
      title: 'Import OpenStreetMap terminé',
      description: `${created} point(s) créé(s), ${updated} mis à jour (${received} reçus d'Overpass).`,
    });
    load();
  };

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
            onClick={importOsm}
            disabled={importing}
            className="min-h-[44px] md:min-h-0"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Importer depuis OpenStreetMap
          </Button>
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
