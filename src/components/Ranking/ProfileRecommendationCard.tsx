"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Profile, getProfileInfo } from "@/utils/rankingV2";

interface Props {
  profile: Profile;
}

export default function ProfileRecommendationCard({ profile }: Props) {
  const info = getProfileInfo(profile);
  const rec = info.recommendations;
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-green-50/70 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/40 transition-colors"
        aria-expanded={open}
      >
        <span className="text-2xl shrink-0">{info.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-blue-900">{info.label}</span>
            <span className="text-sm text-gray-600">— {info.description}</span>
          </div>
        </div>
        {rec && (
          <span className="shrink-0 text-blue-700 inline-flex items-center gap-1 text-xs font-medium">
            {open ? (
              <>Masquer <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Recommandations <ChevronDown className="w-4 h-4" /></>
            )}
          </span>
        )}
      </button>

      {rec && open && (
        <div className="px-4 pb-4 pt-1 border-t border-blue-100/60 bg-white/50">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-blue-700 mb-1">
                Pour qui
              </div>
              <p className="text-gray-700">{rec.who}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-blue-700 mb-1">
                Recommandations officielles
              </div>
              <ul className="space-y-1 text-gray-700">
                {rec.guidelines.map((g, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-600 shrink-0">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
            {rec.avoid && rec.avoid.length > 0 && (
              <div className="sm:col-span-2">
                <div className="text-xs uppercase tracking-wide font-semibold text-amber-700 mb-1">
                  À éviter
                </div>
                <ul className="space-y-1 text-gray-700">
                  {rec.avoid.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-600 shrink-0">⚠</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rec.source && (
              <div className="sm:col-span-2 flex gap-2 text-xs text-gray-500 italic pt-1 border-t border-gray-100">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{rec.source}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
