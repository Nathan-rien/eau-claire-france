"use client";
import { Profile, PROFILES, getProfileInfo } from "@/utils/rankingV2";

interface Props {
  value: Profile;
  onChange: (p: Profile) => void;
}

export default function RankingProfileSelector({ value, onChange }: Props) {
  const profiles = Object.keys(PROFILES) as Profile[];

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-700 mb-3">Choisissez votre profil d'usage :</h2>
      <div className="flex flex-wrap gap-2">
        {profiles.map((p) => {
          const info = getProfileInfo(p);
          const isSelected = value === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                flex items-center gap-2
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md scale-105' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              title={info.description}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {getProfileInfo(value).description}
      </p>
    </div>
  );
}
