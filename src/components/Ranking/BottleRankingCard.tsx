"use client";
import { Composition, scoreBottle, letterGrade, reasons, Profile } from "@/utils/rankingV2";

export default function BottleRankingCard({
  name, brand, compos, pricePerL, profile
}: {
  name: string; brand?: string; compos: Composition; pricePerL?: number; profile: Profile;
}) {
  const scored = scoreBottle(compos, profile);
  const letter = letterGrade(scored.total);
  const rsn = reasons(compos, profile);

  const bar = (label:string, val:number|undefined, s10:number) => (
    <div className="mb-2">
      <div className="flex justify-between text-sm">
        <span>{label} {val!=null ? `(${val})` : ""}</span>
        <span>{s10.toFixed(1)}/10</span>
      </div>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 rounded bg-green-500" style={{ width: `${Math.max(0, Math.min(10, s10)) * 10}%` }} />
      </div>
    </div>
  );

  const getLetterColor = (letter: string) => {
    switch(letter) {
      case "A": return "text-green-600";
      case "B": return "text-green-500";
      case "C": return "text-yellow-600";
      case "D": return "text-orange-500";
      case "E": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold">{brand ? `${brand} — ${name}` : name}</div>
          {pricePerL!=null && <div className="text-sm text-gray-500">{pricePerL.toFixed(2).replace(".", ",")} €/L</div>}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getLetterColor(letter)}`}>{letter}</div>
          <div className="text-sm text-gray-600">{scored.total.toFixed(1)}/50</div>
        </div>
      </div>

      {bar("Nitrates mg/L", compos.NO3_mg_L, scored.breakdown10.nitrates)}
      {bar("Résidu sec mg/L", compos.residu_sec_180_mg_L, scored.breakdown10.residu)}
      {bar("Calcium mg/L", compos.Ca_mg_L, scored.breakdown10.calcium)}
      {bar("Magnésium mg/L", compos.Mg_mg_L, scored.breakdown10.magnesium)}
      {bar("Sodium mg/L", compos.Na_mg_L, scored.breakdown10.sodium)}

      {rsn.length > 0 && (
        <ul className="mt-3 text-sm text-gray-700 list-disc pl-5">
          {rsn.map((t,i)=><li key={i}>{t}</li>)}
        </ul>
      )}
      <div className="mt-3 text-xs text-gray-500">
        Profil : <b>{profile}</b> — pondérations {JSON.stringify(scored.weights)}
      </div>
    </div>
  );
}