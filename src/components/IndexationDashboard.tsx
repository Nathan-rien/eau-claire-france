import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '@/utils/csv';
import { AlertTriangle, CheckCircle2, Clock, Upload, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { gscCoverageUrl, gscInspectUrl, gscSitemapsUrl } from '@/lib/gsc';

type Row = {
  id: string;
  url: string;
  coverage_state: string | null;
  is_indexed: boolean;
  last_crawled_at: string | null;
  first_seen_unindexed: string | null;
  import_source: string | null;
  updated_at: string;
};

const NON_INDEXED_HINTS = [
  'non index', 'not indexed', 'exclu', 'excluded', 'crawled -', 'explor', 'discovered',
  'détect', 'detect', 'soft 404', '404', 'redirect', 'noindex', 'duplicate', 'dupliqu',
  'erreur', 'error', 'bloqu', 'blocked',
];

const pick = (headers: string[], needles: string[]) =>
  headers.find((h) => needles.some((n) => h.toLowerCase().includes(n)));

const detectIndexed = (state: string) => {
  const s = state.toLowerCase().trim();
  if (!s) return false;
  if (NON_INDEXED_HINTS.some((h) => s.includes(h))) return false;
  return s.includes('index') || s.includes('valide') || s.includes('valid') || s.includes('submitted and indexed');
};

const toISODate = (raw?: string) => {
  if (!raw) return null;
  const v = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const daysSince = (iso: string | null) => {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
};

export default function IndexationDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [threshold, setThreshold] = useState<number>(() => {
    const stored = localStorage.getItem('indexation_threshold_days');
    return stored ? Number(stored) : 21;
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('indexation_status')
      .select('*')
      .order('is_indexed', { ascending: true })
      .order('first_seen_unindexed', { ascending: true })
      .limit(1000);
    if (error) {
      toast({ title: 'Erreur de chargement', description: error.message, variant: 'destructive' });
    } else {
      setRows((data || []) as Row[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('indexation_threshold_days', String(threshold));
  }, [threshold]);

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const { headers, rows: csvRows } = parseCSV(text);
      const urlCol = pick(headers, ['url', 'adresse', 'page', 'lien']);
      if (!urlCol) throw new Error("Aucune colonne d'URL détectée dans le fichier.");
      const stateCol = pick(headers, ['état', 'etat', 'state', 'couverture', 'coverage', 'raison', 'reason', 'indexation', 'statut', 'status', 'type']);
      const crawlCol = pick(headers, ['exploration', 'crawl', 'dernière', 'derniere', 'last']);

      const existing = new Map(rows.map((r) => [r.url, r]));
      const nowIso = new Date().toISOString();

      const payload = csvRows
        .map((r) => {
          const url = (r[urlCol] || '').replace(/^"|"$/g, '').trim();
          if (!url.startsWith('http')) return null;
          const state = stateCol ? r[stateCol] : '';
          const indexed = stateCol ? detectIndexed(state) : false;
          const prev = existing.get(url);
          const firstSeen = indexed
            ? null
            : prev && !prev.is_indexed && prev.first_seen_unindexed
              ? prev.first_seen_unindexed
              : nowIso;
          return {
            url,
            coverage_state: state || (indexed ? 'Indexée' : 'Non indexée'),
            is_indexed: indexed,
            last_crawled_at: crawlCol ? toISODate(r[crawlCol]) : null,
            first_seen_unindexed: firstSeen,
            import_source: file.name,
            updated_at: nowIso,
          };
        })
        .filter(Boolean) as Record<string, unknown>[];

      if (payload.length === 0) throw new Error('Aucune URL valide trouvée dans le fichier.');

      const { error } = await supabase
        .from('indexation_status')
        .upsert(payload as never, { onConflict: 'url' });
      if (error) throw error;

      toast({ title: 'Import réussi', description: `${payload.length} URLs mises à jour.` });
      await load();
    } catch (e) {
      toast({
        title: "Échec de l'import",
        description: e instanceof Error ? e.message : 'Erreur inconnue',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleClear = async () => {
    if (!confirm('Supprimer tout le suivi d\u2019indexation ?')) return;
    const { error } = await supabase.from('indexation_status').delete().neq('url', '');
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    setRows([]);
  };

  const stats = useMemo(() => {
    const indexed = rows.filter((r) => r.is_indexed).length;
    const notIndexed = rows.length - indexed;
    const alerts = rows.filter(
      (r) => !r.is_indexed && (daysSince(r.first_seen_unindexed) ?? 0) >= threshold,
    );
    return { total: rows.length, indexed, notIndexed, alerts };
  }, [rows, threshold]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.is_indexed !== b.is_indexed) return a.is_indexed ? 1 : -1;
        return (daysSince(b.first_seen_unindexed) ?? -1) - (daysSince(a.first_seen_unindexed) ?? -1);
      }),
    [rows],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Suivi d'indexation Search Console</CardTitle>
          <CardDescription>
            Importez un export CSV de Search Console (rapport « Indexation des pages » ou « Pages »).
            Les URLs sont fusionnées par adresse : l'ancienneté du statut « non indexée » est conservée
            d'un import à l'autre pour déclencher les alertes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="csv">Export CSV</Label>
              <Input
                id="csv"
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                disabled={importing}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="max-w-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="threshold">Seuil d'alerte (jours)</Label>
              <Input
                id="threshold"
                type="number"
                min={1}
                max={365}
                value={threshold}
                onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))}
                className="w-32"
              />
            </div>
            <Button variant="outline" onClick={load} disabled={loading} className="min-h-11">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <a href={gscCoverageUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Rapport indexation
              </a>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <a href={gscSitemapsUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Sitemaps
              </a>
            </Button>
            {rows.length > 0 && (
              <Button variant="outline" onClick={handleClear} className="min-h-11 text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Vider
              </Button>
            )}
          </div>
          {importing && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="w-4 h-4 animate-pulse" /> Import en cours…
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">URLs suivies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Indexées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.indexed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Non indexées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.notIndexed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Alertes (&gt; {threshold} j)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {stats.alerts.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {stats.alerts.length} page(s) non indexée(s) depuis plus de {threshold} jours
            </CardTitle>
            <CardDescription>
              Actions recommandées : vérifier la canonique et le maillage interne, puis demander une
              indexation manuelle dans Search Console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.alerts.slice(0, 20).map((r) => (
                <li key={r.id} className="text-sm flex flex-wrap items-center gap-2">
                  <Badge variant="destructive">{daysSince(r.first_seen_unindexed)} j</Badge>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all"
                  >
                    {r.url}
                  </a>
                  {r.coverage_state && (
                    <span className="text-muted-foreground">— {r.coverage_state}</span>
                  )}
                  <Button asChild size="sm" variant="outline" className="min-h-11">
                    <a href={gscInspectUrl(r.url)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Demander l'indexation
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Détail des URLs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : sorted.length === 0 ? (
            <p className="text-muted-foreground">
              Aucune donnée : importez un export CSV Search Console pour démarrer le suivi.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>État Search Console</TableHead>
                    <TableHead className="text-right">Non indexée depuis</TableHead>
                    <TableHead className="text-right">Dernière exploration</TableHead>
                    <TableHead className="text-right">Search Console</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r) => {
                    const days = daysSince(r.first_seen_unindexed);
                    const alerting = !r.is_indexed && (days ?? 0) >= threshold;
                    return (
                      <TableRow key={r.id} className={alerting ? 'bg-destructive/5' : undefined}>
                        <TableCell className="max-w-[320px] truncate">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {r.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.is_indexed ? 'default' : alerting ? 'destructive' : 'secondary'}>
                            {r.is_indexed ? 'Indexée' : 'Non indexée'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.coverage_state || '—'}</TableCell>
                        <TableCell className="text-right">
                          {r.is_indexed ? '—' : days !== null ? `${days} j` : '—'}
                        </TableCell>
                        <TableCell className="text-right">{r.last_crawled_at || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline" className="min-h-11 whitespace-nowrap">
                            <a href={gscInspectUrl(r.url)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {r.is_indexed ? 'Inspecter' : "Demander l'indexation"}
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
