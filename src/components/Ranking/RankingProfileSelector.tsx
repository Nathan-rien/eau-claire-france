"use client";
import { Profile } from "@/utils/rankingV2";

const LABELS: Record<Profile, string> = {
  daily: "Quotidien",
  baby: "Bébé",
  sport: "Sport",
  low_sodium: "Faible sodium",
  tea: "Thé / Café",
};

export default function RankingProfileSelector({
  value, onChange
}: { value: Profile; onChange: (p:Profile)=>void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(LABELS).map(([key,label]) => (
        <button
          key={key}
          onClick={() => onChange(key as Profile)}
          className={`px-3 py-1 rounded-full border transition-colors ${
            value===key 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}