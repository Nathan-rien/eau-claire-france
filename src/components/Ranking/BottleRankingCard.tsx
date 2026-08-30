"use client";
import { Composition, scoreBottle, letterGrade, reasons, Profile, CRITERION_LABELS, getCompositionForDisplay, formatMineralValue } from "@/utils/rankingV2";
import { AlertTriangle, Sparkles, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "@/components/LocalizedLink";
import { brandToSlug } from "@/config/brands";
import { isPricedBrandSlug } from "@/config/pricedBrands";

export default function BottleRankingCard({
  name, brand, location, isSparkling, compos, profile, rank, podium
}: {
  name: string;
  brand?: string;
  location?: string;
  isSparkling?: boolean;
  compos: Composition;
  profile: Profile;
  rank?: number;
  podium?: boolean;
}) {
  const { t } = useLanguage();
  const candidateSlug = brand ? brandToSlug(brand) : undefined;
  const brandSlug = isPricedBrandSlug(candidateSlug) ? candidateSlug : undefined;
  const scored = scoreBottle(compos, profile);
  const letter = letterGrade(scored.total, scored.excluded);
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
      case "X": return "text-red-700 bg-red-100 border border-red-300";
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

  const podiumBorder = podium && rank
    ? rank === 1 ? 'border-2 border-yellow-400 shadow-yellow-100 shadow-lg'
    : rank === 2 ? 'border-2 border-gray-300 shadow-md'
    : rank === 3 ? 'border-2 border-amber-600/40 shadow-md'
    : ''
    : '';

  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm relative ${podiumBorder} ${scored.excluded ? 'border-red-300 bg-red-50/30' : ''}`}>
      {/* Rank badge */}
      {rank && (
        <div className={`absolute -top-3 -left-3 ${rank <= 3 ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'} rounded-full flex items-center justify-center text-white font-bold shadow-md ${
          rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-amber-700' : 'bg-blue-500'
        }`}>
          {rank}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {brandSlug ? (
              <Link
                to={`/marque/${brandSlug}`}
                className="font-semibold text-gray-900 truncate hover:text-blue-600 hover:underline"
              >
                {brand || name}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900 truncate">{brand || name}</span>
            )}
            {compos.source_variable === true && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 border-amber-300 text-amber-700 bg-amber-50"
                title={t('ranking.variableSourceHint')}>
                <AlertTriangle className="w-3 h-3" />
                {t('ranking.variableSourceShort')}
              </Badge>
            )}
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

      {/* Multi-source disclaimer */}
      {compos.source_variable === true && (
        <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          {t('ranking.variableSource')}
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
                      ({formatMineralValue(value, criterion)}{info.unit ? ` ${info.unit}` : ''})
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

      {/* Data completeness indicator - only when partial */}
      {availableData < 8 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
          <Droplets className="w-3 h-3" />
          <span>Données partielles: {availableData}/11 critères</span>
        </div>
      )}

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
