"use client";
import { Composition, scoreBottle, letterGrade, reasons, Profile, CRITERION_LABELS, getCompositionForDisplay } from "@/utils/rankingV2";
import { AlertTriangle, Sparkles, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BottleRankingCard({
  name, brand, location, isSparkling, compos, profile, rank
}: {
  name: string;
  brand?: string;
  location?: string;
  isSparkling?: boolean;
  compos: Composition;
  profile: Profile;
  rank?: number;
}) {
  const scored = scoreBottle(compos, profile);
  const letter = letterGrade(scored.total);
  const rsn = reasons(compos, profile);
  const compositionData = getCompositionForDisplay(compos);

  // Count available data points
  const availableData = compositionData.filter(c => c.value != null).length;
  const dataCompleteness = Math.round((availableData / 11) * 100);

  const getLetterColor = (letter: string) => {
    switch(letter) {
      case "A": return "text-green-600 bg-green-100";
      case "B": return "text-green-500 bg-green-50";
      case "C": return "text-yellow-600 bg-yellow-50";
      case "D": return "text-orange-500 bg-orange-50";
      case "E": return "text-red-500 bg-red-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-green-400";
    if (score >= 4) return "bg-yellow-500";
    if (score >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get top 5 most important criteria for this profile
  const sortedCriteria = compositionData
    .map(c => ({
      ...c,
      score: scored.breakdown10[c.criterion],
      weight: scored.weights[c.criterion],
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm relative ${scored.excluded ? 'border-red-300 bg-red-50/30' : ''}`}>
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
        }`}>
          {rank}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{brand || name}</span>
            {isSparkling && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gazeuse
              </Badge>
            )}
          </div>
          {brand && brand !== name && (
            <div className="text-sm text-gray-600 truncate">{name}</div>
          )}
          {location && (
            <div className="text-xs text-gray-400 truncate">{location}</div>
          )}
        </div>
        <div className="text-right ml-2">
          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getLetterColor(letter)}`}>
            {letter}
          </div>
          <div className="text-sm text-gray-600 mt-1">{scored.total}/{scored.outOf}</div>
        </div>
      </div>

      {/* Exclusion warning */}
      {scored.excluded && (
        <div className="mb-3 p-2 bg-red-100 rounded-lg border border-red-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <span className="font-medium">Non recommandé pour ce profil</span>
            <ul className="mt-1 text-xs">
              {scored.exclusionReasons.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Criteria bars */}
      <div className="space-y-2 mb-3">
        {sortedCriteria.map(({ criterion, value, score, weight }) => {
          const info = CRITERION_LABELS[criterion];
          return (
            <div key={criterion}>
              <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                <span className="flex items-center gap-1">
                  {info.label}
                  {value != null && (
                    <span className="text-gray-400">
                      ({criterion === 'pH' ? value.toFixed(1) : Math.round(value)}{info.unit ? ` ${info.unit}` : ''})
                    </span>
                  )}
                </span>
                <span className="font-medium">{score.toFixed(1)}/10</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getBarColor(score)}`}
                  style={{ width: `${Math.max(0, Math.min(10, score)) * 10}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Data completeness indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <Droplets className="w-3 h-3" />
        <span>Données: {availableData}/11 critères ({dataCompleteness}%)</span>
      </div>

      {/* Reasons */}
      {rsn.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1 border-t pt-2 mt-2">
          {rsn.slice(0, 3).map((t, i) => (
            <li key={i} className={t.startsWith('⚠️') ? 'text-red-600 font-medium' : t.startsWith('✓') ? 'text-green-600' : ''}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
