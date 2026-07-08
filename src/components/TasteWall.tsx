import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  TASTE_REPORTS,
  TASTE_TAG_META,
  TasteTag,
  TasteReport,
} from '@/data/tasteReports';

interface TasteWallProps {
  selectedRegion?: string | null;
  onClearRegion?: () => void;
}

const ALL_TAGS: TasteTag[] = [
  'chlore',
  'mineral',
  'metallique',
  'variable',
  'neutre',
  'national',
];

const TasteWall: React.FC<TasteWallProps> = ({ selectedRegion, onClearRegion }) => {
  const [activeTag, setActiveTag] = useState<TasteTag | 'all'>('all');

  const scopedReports: TasteReport[] = useMemo(() => {
    if (!selectedRegion) return TASTE_REPORTS;
    return TASTE_REPORTS.filter((r) => r.region === selectedRegion);
  }, [selectedRegion]);

  const filteredReports = useMemo(() => {
    if (activeTag === 'all') return scopedReports;
    return scopedReports.filter((r) => r.tag === activeTag);
  }, [scopedReports, activeTag]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scopedReports.length };
    ALL_TAGS.forEach((t) => {
      counts[t] = scopedReports.filter((r) => r.tag === t).length;
    });
    return counts;
  }, [scopedReports]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTag('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            activeTag === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Tout ({tagCounts.all})
        </button>
        {ALL_TAGS.map((t) => {
          const meta = TASTE_TAG_META[t];
          const active = activeTag === t;
          const count = tagCounts[t] || 0;
          return (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              disabled={count === 0}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                active
                  ? 'text-white border-transparent'
                  : count === 0
                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                    : `${meta.badgeClass} hover:opacity-80`
              }`}
              style={active ? { background: meta.color, borderColor: meta.color } : {}}
            >
              {meta.label} ({count})
            </button>
          );
        })}

        {selectedRegion && onClearRegion && (
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Filtre région : {selectedRegion}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={onClearRegion}
            >
              <X className="w-3 h-3 mr-1" /> Réinitialiser
            </Button>
          </div>
        )}
      </div>

      {/* Masonry wall */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          Aucun retour référencé pour ce filtre.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {filteredReports.map((r) => {
            const meta = TASTE_TAG_META[r.tag];
            return (
              <Card
                key={r.id}
                className="mb-4 break-inside-avoid border-l-4 shadow-sm hover:shadow-md transition"
                style={{ borderLeftColor: meta.color }}
              >
                <CardContent className="p-4 space-y-3">
                  <Badge
                    variant="outline"
                    className={`${meta.badgeClass} text-xs`}
                  >
                    {meta.label}
                  </Badge>
                  <blockquote className="text-sm text-gray-800 leading-relaxed italic">
                    {r.quote}
                  </blockquote>
                  {r.note && (
                    <p className="text-xs text-gray-500">{r.note}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 pt-2 border-t">
                    <span className="font-medium text-gray-700">
                      {r.locationLabel}
                    </span>
                    {r.region && (
                      <span className="text-gray-400">· {r.region}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="text-gray-700 font-medium">{r.source}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span>{r.dateDisplay}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasteWall;
