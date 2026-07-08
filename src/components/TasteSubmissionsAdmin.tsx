import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Trash2, RefreshCw } from 'lucide-react';
import { TASTE_TAG_META, TasteTag } from '@/data/tasteReports';

interface Submission {
  id: string;
  region: string | null;
  location_label: string | null;
  quote: string;
  tag: string;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  moderator_note: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  approved: 'Publié',
  rejected: 'Rejeté',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const TasteSubmissionsAdmin: React.FC = () => {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('taste_reports_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (filter !== 'all') query = query.eq('status', filter);

    const { data, error } = await query;
    if (error) {
      console.error('Load submissions error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les contributions.',
        variant: 'destructive',
      });
    } else {
      setItems((data || []) as Submission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('taste_reports_submissions')
      .update({
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: userData.user?.id ?? null,
      })
      .eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: status === 'approved' ? 'Contribution publiée' : 'Contribution rejetée' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer définitivement cette contribution ?')) return;
    const { error } = await supabase
      .from('taste_reports_submissions')
      .delete()
      .eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Contribution supprimée' });
    load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Contributions — Goût de l'eau</CardTitle>
            <CardDescription>
              Modération manuelle des témoignages soumis via /gout-eau.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tout' : STATUS_LABEL[f]}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune contribution.</p>
        ) : (
          <div className="space-y-3">
            {items.map((s) => {
              const meta = TASTE_TAG_META[s.tag as TasteTag];
              return (
                <div key={s.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={STATUS_COLOR[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                    {meta && (
                      <Badge variant="outline" className={meta.badgeClass}>
                        {meta.label}
                      </Badge>
                    )}
                    {s.region && (
                      <span className="text-xs text-muted-foreground">{s.region}</span>
                    )}
                    {s.location_label && (
                      <span className="text-xs text-muted-foreground">· {s.location_label}</span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(s.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <blockquote className="text-sm italic text-gray-800 border-l-2 pl-3 border-gray-200">
                    {s.quote}
                  </blockquote>
                  {s.email && (
                    <p className="text-xs text-muted-foreground">
                      Contact : <span className="font-mono">{s.email}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {s.status !== 'approved' && (
                      <Button size="sm" onClick={() => setStatus(s.id, 'approved')}>
                        <Check className="w-4 h-4 mr-1" /> Publier
                      </Button>
                    )}
                    {s.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(s.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" /> Rejeter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => remove(s.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasteSubmissionsAdmin;
