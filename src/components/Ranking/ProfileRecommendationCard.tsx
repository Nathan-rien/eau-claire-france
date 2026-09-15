"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Profile, getProfileInfo } from "@/utils/rankingV2";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateProfileText } from "@/utils/rankingI18n";

interface Props {
  profile: Profile;
}

function parseGuideline(raw: string): { label: string; op: string; value: string } | null {
  const m = raw.match(/^(.+?)\s*(<|>|≤|≥|=)\s*(.+)$/);
  if (!m) return null;
  return { label: m[1].trim(), op: m[2], value: m[3].trim() };
}

function parseAvoid(raw: string): { title: string; detail?: string } {
  const m = raw.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (!m) return { title: raw };
  return { title: m[1].trim(), detail: m[2].trim() };
}

export default function ProfileRecommendationCard({ profile }: Props) {
  const info = getProfileInfo(profile);
  const rec = info.recommendations;
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(language !== 'en');
  const label = t(`profile.${profile}.label`) || info.label;
  const desc = t(`profile.${profile}.desc`) || info.description;

  const parsed = (rec?.guidelines ?? []).map((g) => translateProfileText(g, language)).map((g) => ({ raw: g, p: parseGuideline(g) }));
  const metrics = parsed.filter((g) => g.p) as { raw: string; p: { label: string; op: string; value: string } }[];
  const textGuidelines = parsed.filter((g) => !g.p);

  return (
    <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-slate-100 hover:bg-slate-50/60 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{label}</h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate">{desc}</p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          {open ? (<>{t('profileCard.hide')} <ChevronUp className="w-4 h-4" /></>) : (<>{t('profileCard.recommendations')} <ChevronDown className="w-4 h-4" /></>)}
        </span>
      </button>

      {rec && open && (
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 p-5 sm:p-6 bg-slate-50/60 border-b md:border-b-0 md:border-r border-slate-100">
            <span className="inline-block text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600 mb-3">
              {t('profileCard.target')}
            </span>
            <p className="text-[15px] text-slate-800 leading-relaxed">{translateProfileText(rec.who, language)}</p>
            {rec.source && (
              <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] italic text-slate-500 leading-relaxed">{translateProfileText(rec.source, language)}</p>
              </div>
            )}
          </div>

          <div className="md:w-3/5 p-5 sm:p-6 space-y-6">
            <section>
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {t('profileCard.thresholds')}
              </h4>

              {metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                  {metrics.map((g, i) => (
                    <div key={i}>
                      <p className="text-[11px] text-slate-500 font-medium mb-0.5 leading-tight">{g.p.label}</p>
                      <p className="text-sm text-slate-900 font-semibold tabular-nums">
                        <span className="text-slate-400 font-normal mr-1">{g.p.op}</span>
                        {g.p.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {textGuidelines.length > 0 && (
                <ul className={`space-y-2 ${metrics.length > 0 ? "mt-4 pt-4 border-t border-slate-100" : ""}`}>
                  {textGuidelines.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{g.raw}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {rec.avoid && rec.avoid.length > 0 && (
              <section>
                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  {t('profileCard.contraindications')}
                </h4>
                <ul className="space-y-2">
                  {rec.avoid.map((a, i) => {
                    const { title, detail } = parseAvoid(translateProfileText(a, language));
                    return (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm leading-snug">
                          <span className="font-semibold text-amber-900">{title}</span>
                          {detail && <span className="block text-xs text-amber-800/80 mt-0.5">{detail}</span>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
