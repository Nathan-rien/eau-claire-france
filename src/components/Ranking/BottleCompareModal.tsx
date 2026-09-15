"use client";
import { X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Composition, scoreBottle, letterGrade, Profile, CRITERION_LABELS, getCompositionForDisplay, formatMineralValue } from '@/utils/rankingV2';
import { useLanguage } from '@/contexts/LanguageContext';
import { criterionLabel, translateReason } from '@/utils/rankingI18n';
import type { WaterSource } from '@/hooks/useWaterCompositions';


interface Props {
  open: boolean;
  onClose: () => void;
  waters: WaterSource[];
  profile: Profile;
}

const letterColor = (l: string) => ({
  A: 'bg-green-100 text-green-700',
  B: 'bg-green-50 text-green-600',
  C: 'bg-yellow-50 text-yellow-700',
  D: 'bg-orange-50 text-orange-600',
  E: 'bg-red-50 text-red-600',
  X: 'bg-red-100 text-red-700 border border-red-300',
}[l] || 'bg-gray-100 text-gray-600');

export default function BottleCompareModal({ open, onClose, waters, profile }: Props) {
  const { t, language } = useLanguage();
  if (waters.length === 0) return null;

  const scored = waters.map(w => {
    const s = scoreBottle(w.composition, profile);
    return { water: w, ...s, letter: letterGrade(s.total, s.excluded) };
  });

  // Best one by score
  const bestScore = Math.max(...scored.map(s => s.total));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('rankUI.compareTitle', { n: String(waters.length) })}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-4 font-medium text-gray-600">Critère</th>
                {scored.map(s => (
                  <th key={s.water.id} className="text-left py-3 px-3 min-w-[140px]">
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      {s.water.brand}
                      {s.water.is_sparkling && <Sparkles className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="text-xs text-gray-500 font-normal">{s.water.source_name}</div>
                    <div className="text-xs text-gray-400 font-normal">{s.water.location}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-blue-50/50">
                <td className="py-3 pr-4 font-medium">Score / 80</td>
                {scored.map(s => (
                  <td key={s.water.id} className="py-3 px-3">
                    <div className={`font-bold ${s.total === bestScore && !s.excluded ? 'text-green-700' : 'text-gray-900'}`}>
                      {s.total}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 font-medium">Note</td>
                {scored.map(s => (
                  <td key={s.water.id} className="py-3 px-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold ${letterColor(s.letter)}`}>
                      {s.letter}
                    </span>
                  </td>
                ))}
              </tr>
              {getCompositionForDisplay(scored[0].water.composition).map(({ criterion }) => {
                const info = CRITERION_LABELS[criterion];
                const values = scored.map(s => {
                  const data = getCompositionForDisplay(s.water.composition);
                  return data.find(d => d.criterion === criterion)?.value;
                });
                const validValues = values.filter((v): v is number => v != null);
                const max = validValues.length ? Math.max(...validValues) : 0;
                const min = validValues.length ? Math.min(...validValues) : 0;

                return (
                  <tr key={criterion} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-700">
                      {info.label} <span className="text-xs text-gray-400">({info.unit})</span>
                    </td>
                    {values.map((v, i) => (
                      <td key={i} className="py-2 px-3">
                        {v != null ? (
                          <span className={
                            validValues.length > 1
                              ? v === max ? 'text-blue-700 font-semibold' : v === min ? 'text-gray-500' : 'text-gray-700'
                              : 'text-gray-700'
                          }>
                            {formatMineralValue(v, criterion)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <td className="py-3 pr-4 font-medium text-gray-700 align-top">Recommandation</td>
                {scored.map(s => (
                  <td key={s.water.id} className="py-3 px-3 text-xs">
                    {s.excluded ? (
                      <div className="text-red-600">
                        <div className="font-medium mb-1">Non recommandée</div>
                        <ul className="space-y-0.5">
                          {s.exclusionReasons.slice(0, 2).map((r, i) => <li key={i}>• {r}</li>)}
                        </ul>
                      </div>
                    ) : s.total === bestScore ? (
                      <div className="text-green-700 font-medium">✓ Meilleur choix pour ce profil</div>
                    ) : (
                      <div className="text-gray-500">Adaptée à ce profil</div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
