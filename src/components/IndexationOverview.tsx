import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, ListChecks, Map } from 'lucide-react';
import { gscCoverageUrl, gscInspectUrl, gscSitemapsUrl } from '@/lib/gsc';

type Row = {
  id: string;
  url: string;
  coverage_state: string | null;
  is_indexed: boolean;
  first_seen_unindexed: string | null;
  last_crawled_at: string | null;
};

const daysSince = (iso: string | null) => {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
};

const THRESHOLD = Number(localStorage.getItem('indexation_threshold_days') || 21);

export default function IndexationOverview() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('indexation_status')
        .select('id,url,coverage_state,is_indexed,first_seen_unindexed,last_crawled_at')
        .limit(1000);
      if (cancelled) return;
      if (error) setError(error.message);
      else setRows((data || []) as Row[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { pending, indexed } = useMemo(() => {
    const notIndexed = rows
      .filter((r) => !r.is_indexed)
      .sort((a, b) => (daysSince(b.first_seen_unindexed) ?? -1) - (daysSince(a.first_seen_unindexed) ?? -1));
    return { pending: notIndexed, indexed: rows.length - notIndexed.length };
  }, [rows]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Indexation Google
            </CardTitle>
            <CardDescription>
              Pages en attente d'indexation ou non indexées. Chaque lien ouvre l'inspection Search
              Console, où vous pouvez cliquer « Demander une indexation ».
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={gscCoverageUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Rapport indexation
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={gscSitemapsUrl()} target="_blank" rel="noopener noreferrer">
                <Map className="w-4 h-4 mr-2" /> Sitemaps
              </a>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/indexation">Suivi complet</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">URLs suivies</div>
            <div className="text-2xl font-bold">{rows.length}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Indexées
            </div>
            <div className="text-2xl font-bold text-green-600">{indexed}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> En attente / non indexées
            </div>
            <div className="text-2xl font-bold text-orange-600">{pending.length}</div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Chargement…</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Suivi d'indexation indisponible ({error}). Accès réservé aux administrateurs.
          </p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune page non indexée enregistrée. Importez un export Search Console depuis le{' '}
            <Link to="/admin/indexation" className="underline">
              suivi d'indexation
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y">
            {pending.slice(0, 25).map((r) => {
              const days = daysSince(r.first_seen_unindexed);
              const alerting = (days ?? 0) >= THRESHOLD;
              return (
                <li key={r.id} className="py-3 flex flex-wrap items-center gap-3">
                  <Badge variant={alerting ? 'destructive' : 'secondary'}>
                    {days !== null ? `${days} j` : 'Nouveau'}
                  </Badge>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline break-all flex-1 min-w-[200px]"
                  >
                    {r.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                  </a>
                  <span className="text-xs text-muted-foreground">{r.coverage_state || '—'}</span>
                  <Button asChild size="sm" variant="outline" className="min-h-11">
                    <a href={gscInspectUrl(r.url)} target="_blank" rel="noopener noreferrer">
                      {alerting && <AlertTriangle className="w-4 h-4 mr-2" />}
                      Demander l'indexation
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
        {pending.length > 25 && (
          <p className="text-xs text-muted-foreground">
            {pending.length - 25} autres URLs non indexées dans le{' '}
            <Link to="/admin/indexation" className="underline">
              suivi complet
            </Link>
            .
          </p>
        )}
      </CardContent>
    </Card>
  );
}
